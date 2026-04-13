import { Bus, Database, MapPinned, Route, ShipWheel, Sparkles } from 'lucide-react';

const highlights = [
  {
    title: 'Mobilidade com dados reais',
    description: 'O projeto esta evoluindo de uma base mockada para uma estrutura alimentada por coleta, normalizacao e importacao de dados reais.',
    icon: Database,
  },
  {
    title: 'Mapa interativo',
    description: 'Linhas, sentidos, stops e trajetos podem ser visualizados em uma experiencia espacial pensada para evoluir sem refazer a base.',
    icon: MapPinned,
  },
  {
    title: 'Arquitetura escalavel',
    description: 'Frontend, backend e dominio compartilhado foram separados para suportar crescimento de regras, cidades e modais.',
    icon: Route,
  },
];

const roadmap = [
  'Concluir a validacao da linha 0100 com dados revisados',
  'Aprimorar o layout final do dashboard principal',
  'Expandir a reutilizacao global de stops entre linhas',
  'Evoluir recomendacao de embarque e inteligencia de rota',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_38%),linear-gradient(180deg,_#f8fbff_0%,_#edf4fb_48%,_#f8fafc_100%)] text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Demo Preview
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Cityline
            </h1>
          </div>

          <nav className="hidden items-center gap-3 sm:flex">
            <a
              href="https://github.com/Luanagroth/Cityline"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              GitHub
            </a>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              <Bus className="h-3.5 w-3.5" />
              Mobilidade urbana em desenvolvimento avancado
            </span>

            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Uma base moderna para visualizar linhas, horarios, paradas e rotas com potencial de produto real.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Esta pagina funciona como uma landing temporaria para apresentar o projeto com mais clareza enquanto o
              layout final do aplicativo principal ainda esta sendo refinado. A versao publica atual foi pensada como
              uma vitrine do projeto, enquanto a experiencia completa segue em evolucao interna.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://github.com/Luanagroth/Cityline"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
              >
                Acompanhar no GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/luana-groth/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Entrar em contato
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">Em desenvolvimento avancado</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Backend</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">API funcional e modular</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dados</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">Consolidacao real em andamento</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-sky-200/60 blur-3xl sm:block" />
            <div className="absolute -right-8 bottom-6 hidden h-40 w-40 rounded-full bg-cyan-200/60 blur-3xl sm:block" />

            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100">
                  Preview de produto
                </span>
                <ShipWheel className="h-5 w-5 text-sky-300" />
              </div>

              <div className="mt-6 space-y-4">
                {highlights.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-sky-500/15 p-2 text-sky-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Momento atual</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50">
                  O foco agora esta em consolidar os dados reais da linha 0100, evoluir a experiencia visual e preparar
                  a base para expansao por novas linhas e modais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Roadmap imediato</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Uma demo mais bonita agora, sem perder a profundidade tecnica do projeto.
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roadmap.map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
