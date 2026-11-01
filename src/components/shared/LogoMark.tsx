import type { SVGProps } from "react";

/** Panda mark from the design export (../totofia-design/logo). Colors are fixed brand colors, not theme tokens. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <circle cx="16" cy="18" r="11" fill="#0F766E" />
      <circle cx="16" cy="18" r="6" fill="#14B8A6" />
      <circle cx="48" cy="18" r="11" fill="#0F766E" />
      <circle cx="48" cy="18" r="6" fill="#14B8A6" />
      <rect
        x="8"
        y="16"
        width="48"
        height="42"
        rx="21"
        fill="#FFFFFF"
        stroke="#0F766E"
        strokeWidth="3"
      />
      <ellipse cx="22" cy="34" rx="7" ry="6" fill="#0F766E" transform="rotate(-15 22 34)" />
      <ellipse cx="42" cy="34" rx="7" ry="6" fill="#0F766E" transform="rotate(15 42 34)" />
      <circle cx="23" cy="34" r="2.5" fill="#FFFFFF" />
      <circle cx="41" cy="34" r="2.5" fill="#FFFFFF" />
      <circle cx="24" cy="33" r="1" fill="#14B8A6" />
      <circle cx="42" cy="33" r="1" fill="#14B8A6" />
      <circle cx="16" cy="42" r="3.5" fill="#FED7AA" opacity="0.8" />
      <circle cx="48" cy="42" r="3.5" fill="#FED7AA" opacity="0.8" />
      <path d="M 30 40 Q 32 38 34 40 Q 32 43 30 40 Z" fill="#0F766E" />
      <path
        d="M 32 42 Q 29 46 26 44 M 32 42 Q 35 46 38 44"
        stroke="#0F766E"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
