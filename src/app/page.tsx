import { Button } from "@/components/ui/button";
import { payloomConfig } from "@/payloom/core/config";

const milestones = [
  "Next.js App Router scaffolded",
  "Prisma connected to Neon",
  "Initial schema migrated",
  "shadcn/ui initialized",
  "Health API online",
  "Payloom core skeleton ready",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-950/30">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Foundation Ready
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Payloom
          </h1>
          <p className="mt-3 text-base text-slate-300">
            A production-sane payment toolkit foundation with clean config, Prisma,
            and a resilient core architecture.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Provider
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {payloomConfig.paymentProvider}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Environment
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {payloomConfig.environment}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-emerald-300 text-slate-950 hover:bg-emerald-200"
            >
              <a href="/api/health">View Health</a>
            </Button>
            <span className="self-center text-xs text-slate-400">
              /api/health
            </span>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
          <h2 className="text-lg font-semibold text-white">Segment 1 Checklist</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-300">
            {milestones.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
