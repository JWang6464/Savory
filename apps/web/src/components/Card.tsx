import type { ReactNode } from "react";

export default function Card(props: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur">
      <header className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
          {props.title}
        </h2>
        {props.right ? (
          <div className="text-xs text-zinc-600">{props.right}</div>
        ) : null}
      </header>

      <div className="text-sm text-zinc-800">{props.children}</div>
    </section>
  );
}
