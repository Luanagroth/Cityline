'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { DEFAULT_LOCALE, type UiLocale } from '@/lib/ui-copy';
import { loginWithEmail, registerWithEmail } from '@/services/auth/auth.service';
import { ApiRequestError } from '@/services/api/client';

type AuthMode = 'login' | 'register';

const copy: Record<
  UiLocale,
  {
    back: string;
    accessTag: string;
    heroTitle: string;
    heroDescription: string;
    benefitOpen: string;
    benefitOpenDescription: string;
    benefitAccount: string;
    benefitAccountDescription: string;
    auth: string;
    loginTitle: string;
    registerTitle: string;
    loginTab: string;
    registerTab: string;
    name: string;
    yourName: string;
    email: string;
    password: string;
    passwordHint: string;
    processing: string;
    loginAction: string;
    registerAction: string;
    loadingSession: string;
    activeSession: string;
    alreadyConnected: string;
    currentAccount: string;
    backToDashboard: string;
    signOut: string;
    authFailed: string;
  }
> = {
  'pt-BR': {
    back: 'Voltar para o painel',
    accessTag: 'Acesso CityLine',
    heroTitle: 'Conta opcional, beneficios reais.',
    heroDescription: 'O painel continua publico para consulta de linhas e horarios, mas com login voce desbloqueia sincronizacao de favoritos e salvamento de localizacoes.',
    benefitOpen: 'Acesso sem travar o produto',
    benefitOpenDescription: 'A consulta de mobilidade continua aberta para qualquer pessoa.',
    benefitAccount: 'Conta pessoal',
    benefitAccountDescription: 'Favoritos e localizacoes ficam vinculados ao usuario autenticado.',
    auth: 'Autenticacao',
    loginTitle: 'Entrar na sua conta',
    registerTitle: 'Criar conta CityLine',
    loginTab: 'Entrar',
    registerTab: 'Cadastrar',
    name: 'Nome',
    yourName: 'Seu nome',
    email: 'Email',
    password: 'Senha',
    passwordHint: 'Minimo de 6 caracteres',
    processing: 'Processando...',
    loginAction: 'Entrar agora',
    registerAction: 'Criar conta',
    loadingSession: 'Validando sua sessao...',
    activeSession: 'Sessao ativa',
    alreadyConnected: 'Voce ja esta conectada',
    currentAccount: 'Conta atual',
    backToDashboard: 'Voltar ao painel',
    signOut: 'Sair da conta',
    authFailed: 'Nao foi possivel concluir a autenticacao.',
  },
  en: {
    back: 'Back to dashboard',
    accessTag: 'CityLine Access',
    heroTitle: 'Optional account, real benefits.',
    heroDescription: 'The dashboard stays public for lines and schedules, but with login you unlock favorite sync and saved locations.',
    benefitOpen: 'Access without blocking the product',
    benefitOpenDescription: 'Mobility information remains open to everyone.',
    benefitAccount: 'Personal account',
    benefitAccountDescription: 'Favorites and saved locations stay linked to the authenticated user.',
    auth: 'Authentication',
    loginTitle: 'Sign in to your account',
    registerTitle: 'Create CityLine account',
    loginTab: 'Sign in',
    registerTab: 'Register',
    name: 'Name',
    yourName: 'Your name',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 6 characters',
    processing: 'Processing...',
    loginAction: 'Sign in now',
    registerAction: 'Create account',
    loadingSession: 'Checking your session...',
    activeSession: 'Active session',
    alreadyConnected: 'You are already connected',
    currentAccount: 'Current account',
    backToDashboard: 'Back to dashboard',
    signOut: 'Sign out',
    authFailed: 'Could not complete authentication.',
  },
  es: {
    back: 'Volver al panel',
    accessTag: 'Acceso CityLine',
    heroTitle: 'Cuenta opcional, beneficios reales.',
    heroDescription: 'El panel sigue publico para consultar lineas y horarios, pero con inicio de sesion desbloqueas favoritos y ubicaciones guardadas.',
    benefitOpen: 'Acceso sin bloquear el producto',
    benefitOpenDescription: 'La consulta de movilidad sigue abierta para cualquier persona.',
    benefitAccount: 'Cuenta personal',
    benefitAccountDescription: 'Favoritos y ubicaciones quedan vinculados al usuario autenticado.',
    auth: 'Autenticacion',
    loginTitle: 'Entrar en tu cuenta',
    registerTitle: 'Crear cuenta CityLine',
    loginTab: 'Entrar',
    registerTab: 'Registrar',
    name: 'Nombre',
    yourName: 'Tu nombre',
    email: 'Email',
    password: 'Contrasena',
    passwordHint: 'Minimo de 6 caracteres',
    processing: 'Procesando...',
    loginAction: 'Entrar ahora',
    registerAction: 'Crear cuenta',
    loadingSession: 'Validando tu sesion...',
    activeSession: 'Sesion activa',
    alreadyConnected: 'Ya estas conectada',
    currentAccount: 'Cuenta actual',
    backToDashboard: 'Volver al panel',
    signOut: 'Salir de la cuenta',
    authFailed: 'No fue posible completar la autenticacion.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, session, setSession } = useAuthSession();
  const [locale, setLocale] = useState<UiLocale>(DEFAULT_LOCALE);
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem('cityline:locale');
      if (storedLocale === 'pt-BR' || storedLocale === 'en' || storedLocale === 'es') {
        setLocale(storedLocale);
      }
    } catch {}
  }, []);

  const text = copy[locale];
  const title = useMemo(() => (mode === 'login' ? text.loginTitle : text.registerTitle), [mode, text]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const authSession =
        mode === 'login' ? await loginWithEmail({ email, password }) : await registerWithEmail({ name, email, password });

      setSession(authSession);
      router.push('/');
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiRequestError) {
        setError(submitError.message);
      } else if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError(text.authFailed);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="surface flex items-center gap-3 px-5 py-4 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-brand-700" />
          {text.loadingSession}
        </div>
      </main>
    );
  }

  if (isAuthenticated && session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <section className="surface w-full max-w-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">{text.activeSession}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{text.alreadyConnected}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {text.currentAccount}: <strong>{session.user.name ?? session.user.email}</strong>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <ArrowLeft className="h-4 w-4" />
              {text.backToDashboard}
            </Link>
            <button type="button" onClick={() => logout()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {text.signOut}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-brand-800 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <section>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-100 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {text.back}
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">{text.accessTag}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{text.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">{text.heroDescription}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">{text.benefitOpen}</p>
              <p className="mt-1 text-xs text-slate-200">{text.benefitOpenDescription}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">{text.benefitAccount}</p>
              <p className="mt-1 text-xs text-slate-200">{text.benefitAccountDescription}</p>
            </div>
          </div>
        </section>

        <section className="surface w-full p-5 text-slate-900 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{text.auth}</p>
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <LogIn className="h-5 w-5 text-brand-700" />
          </div>

          <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
            {(['login', 'register'] as const).map((currentMode) => (
              <button
                key={currentMode}
                type="button"
                onClick={() => {
                  setMode(currentMode);
                  setError(null);
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === currentMode ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}
              >
                {currentMode === 'login' ? text.loginTab : text.registerTab}
              </button>
            ))}
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">{text.name}</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-brand-400" placeholder={text.yourName} />
              </label>
            ) : null}

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">{text.email}</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-brand-400" placeholder="voce@exemplo.com" />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">{text.password}</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-brand-400" placeholder={text.passwordHint} />
            </label>

            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

            <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {submitting ? text.processing : mode === 'login' ? text.loginAction : text.registerAction}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
