import { LucideProps } from "lucide-react";

// Custom Torah-inspired icons
export const ScrollIcon = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M3 18h18" />
    <path d="M8 6v12" />
    <path d="M16 6v12" />
    <path d="M6 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2" />
    <path d="M18 6c1.1 0 2 .9 2 2v8c0-1.1-.9-2-2-2" />
  </svg>
);

export const LampIcon = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v6" />
    <path d="M8 8h8" />
    <path d="M10 8v8a2 2 0 0 0 4 0V8" />
    <path d="M8 22h8" />
    <circle cx="12" cy="4" r="2" />
  </svg>
);

export const PomegranateIcon = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3c-3.5 0-6 2.5-6 6v6c0 3.5 2.5 6 6 6s6-2.5 6-6V9c0-3.5-2.5-6-6-6z" />
    <path d="M10 2l1-1 1 1" />
    <circle cx="10" cy="11" r="1" />
    <circle cx="14" cy="11" r="1" />
    <circle cx="12" cy="14" r="1" />
    <circle cx="10" cy="17" r="1" />
    <circle cx="14" cy="17" r="1" />
  </svg>
);

export const WisdomCrownIcon = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 16L12 8l7 8" />
    <path d="M12 2v6" />
    <path d="M19 16h2v4H3v-4h2" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
  </svg>
);