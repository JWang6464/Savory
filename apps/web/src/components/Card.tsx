import type { ReactNode } from "react";

export default function Card(props: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>{props.title}</h2>
      {props.children}
    </div>
  );
}
