import type { ReactNode } from "react";

export default function Card(props: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur transition hover:border-white/20 hover:bg-white/10">
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
      </div>

      <header className="relative mb-4 flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold tracking-wide text-zinc-100">
          {props.title}
        </h2>
        {props.right ? (
          <div className="text-sm text-zinc-300">{props.right}</div>
        ) : null}
      </header>

      <div className="relative text-sm text-zinc-200">{props.children}</div>
    </section>
  );
}
