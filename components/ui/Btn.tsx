import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "ink" | "accent" | "light" | "discord" | "telegram";
  external?: boolean;
  className?: string;
  magnetic?: boolean;
};

const variants = { ink: "", accent: "btn-accent", light: "btn-light", discord: "btn-discord", telegram: "btn-telegram" } as const;

/** Pulsante dalla cima ad arco. Un solo stile in tutto il sito. */
export function Btn({ href, children, variant = "ink", external = false, className = "", magnetic = true }: Props) {
  const cls = `btn ${variants[variant]} ${className}`;
  const mag = magnetic ? { "data-magnetic": "" } : {};
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...mag}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...mag}>
      {children}
    </Link>
  );
}
