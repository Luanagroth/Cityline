'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
      <div className="surface w-full p-6 text-center">
        <p className="text-sm font-semibold text-brand-700">CityLine</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Não foi possível carregar o painel</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tente novamente. O app continua preparado para fallback seguro quando a API externa oscila.
        </p>
        <button
          className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => reset()}
        >
          Recarregar
        </button>
      </div>
    </main>
  );
}
