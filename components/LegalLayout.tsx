"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export interface Section {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  summary: string;
  sections: Section[];
  children: React.ReactNode;
  currentPage: "terms" | "privacy";
}

export default function LegalLayout({
  title,
  subtitle,
  effectiveDate,
  version,
  summary,
  sections,
  children,
  currentPage,
}: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">

      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-normal text-neutral-900 no-underline tracking-tight">
            Prizmsol
          </Link>
          <nav className="flex gap-1">
            <Link
              href="/legal/terms"
              className={`text-[13px] px-3 py-1.5 rounded-md no-underline transition-colors ${
                currentPage === "terms"
                  ? "bg-neutral-200 text-neutral-900 font-medium"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className={`text-[13px] px-3 py-1.5 rounded-md no-underline transition-colors ${
                currentPage === "privacy"
                  ? "bg-neutral-200 text-neutral-900 font-medium"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-[200px_1fr] gap-16 items-start">

          {/* Sticky sidebar */}
          <aside className="sticky top-20 pt-10 pb-10">
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mb-4">
              On this page
            </p>
            <nav className="space-y-0.5">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`block text-[13px] leading-snug py-1.5 pl-3 border-l-2 no-underline transition-all duration-150 ${
                    activeId === id
                      ? "border-neutral-800 text-neutral-900 font-medium"
                      : "border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-neutral-200 space-y-3">
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5">Effective date</p>
                <p className="text-[13px] text-neutral-600">{effectiveDate}</p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5">Version</p>
                <p className="text-[13px] text-neutral-600">{version}</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="pt-10 pb-24 max-w-[600px]">

            {/* Header */}
            <div className="mb-10">
              <p className="text-[11px] tracking-widest uppercase text-neutral-400 font-medium mb-3">
                Legal · {subtitle}
              </p>
              <h1 className="font-serif text-4xl font-normal text-neutral-900 tracking-tight leading-tight mb-6">
                {title}
              </h1>

              {/* Summary callout */}
              <div className="bg-neutral-100 rounded-xl p-4">
                <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mb-1.5">
                  Plain-language summary
                </p>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {summary}
                </p>
              </div>
            </div>

            {children}
          </main>

        </div>
      </div>
    </div>
  );
}