export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-3xl bg-slate-200" />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[540px] rounded-3xl bg-slate-200" />
          <div className="h-[540px] rounded-3xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
