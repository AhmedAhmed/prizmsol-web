import React from "react";

interface SectionProps {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ id, num, title, children }: SectionProps) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-neutral-200">
        <span className="text-xs text-neutral-400 tabular-nums min-w-[20px]">{num}</span>
        <h2 className="font-serif text-lg font-medium text-neutral-900 tracking-tight">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-neutral-600 mb-3">{children}</p>
  );
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="pl-5 my-2 mb-3 space-y-1">{children}</ul>
  );
}

export function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-sm leading-relaxed text-neutral-600">{children}</li>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-neutral-300 pl-4 my-4">
      <p className="text-[13px] leading-relaxed text-neutral-500 italic">{children}</p>
    </div>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-neutral-800">{children}</strong>;
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-medium text-neutral-800 mb-1.5 mt-4">{children}</p>
  );
}