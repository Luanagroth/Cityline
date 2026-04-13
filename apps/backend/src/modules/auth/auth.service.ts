import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { signAuthToken } from '../../shared/auth/jwt.js';

interface AuthInput {
  email: string;
  password: string;
  name?: string;
}

class AuthService {
  async register(input: AuthInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'EMAIL_ALREADY_IN_USE', 'Já existe uma conta com este email.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(input: AuthInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos.');
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!validPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos.');
    }

    return this.buildAuthResponse(user);
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
    }

    return user;
  }

  async saveLocation(userId: string, input: { latitude: number; longitude: number; label?: string }) {
    return prisma.savedLocation.create({
      data: {
        userId,
        label: input.label,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });
  }

  async listLocations(userId: string) {
    return prisma.savedLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  private buildAuthResponse(user: { id: string; email: string; name: string | null; createdAt: Date }) {
    return {
      token: signAuthToken({
        sub: user.id,
        email: user.email,
        name: user.name,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}

export const authService = new AuthService();
