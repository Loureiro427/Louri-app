import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../store/useUserStore";

export type IconName =
  | "home"
  | "plan"
  | "chart"
  | "user"
  | "water"
  | "flame"
  | "plus"
  | "close"
  | "chevron"
  | "back"
  | "check"
  | "clock"
  | "scale"
  | "edit"
  | "reset"
  | "sun"
  | "moon"
  | "bell"
  | "help"
  | "idea"
  | "star"
  | "file"
  | "exit"
  | "search"
  | "target"
  | "settings";
const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v10H3z" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  plan: (
    <>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M8 8V5m4 3V3m4 5V5" />
    </>
  ),
  chart: (
    <>
      <path d="M5 20V10m7 10V4m7 16v-7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  water: <path d="M12 3s-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12Z" />,
  flame: (
    <path d="M12 3c1 5-4 6-3 10 1-2 2-3 4-4 1 3 5 4 5 8a6 6 0 0 1-12 0c0-4 3-7 6-14Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  scale: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M7 8a7 7 0 0 1 10 0l-2 4H9Z" />
      <path d="m12 9 2-3" />
    </>
  ),
  edit: (
    <>
      <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" />
    </>
  ),
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  moon: <path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z" />,
  bell: (
    <>
      <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 3h4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01" />
    </>
  ),
  idea: (
    <>
      <path d="M9 19h6m-5 3h4M8 15a7 7 0 1 1 8 0l-1 1H9Z" />
    </>
  ),
  star: <path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />,
  file: (
    <>
      <path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6" />
    </>
  ),
  exit: (
    <>
      <path d="M9 3H4v18h5m5-14 5 5-5 5m-6-5h11" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="3" />
      <circle cx="15" cy="17" r="3" />
    </>
  ),
};
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
export function PageHeader({
  title,
  eyebrow,
  description,
  action,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="app-page-header">
      <div>
        {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="app-header-description">{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="app-section-heading">
      <h2>{title}</h2>
      {action}
    </div>
  );
}
export function Progress({
  value,
  max,
  label,
  tone = "green",
}: {
  value: number;
  max: number;
  label: string;
  tone?: "green" | "blue" | "orange";
}) {
  const percentage = Math.max(
    0,
    Math.min(100, max > 0 ? (value / max) * 100 : 0)
  );
  return (
    <div
      className={`app-progress app-tone-${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
}
export function Sheet({
  title,
  description,
  children,
  onClose,
  large = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  large?: boolean;
}) {
  const dark = useUserStore((state) => state.dados.temaEscuro ?? true);
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus({ preventScroll: true });
    return () => {
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <div
      className={`app-themed app-sheet-overlay ${dark ? "" : "app-light"}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`app-sheet ${large ? "app-sheet--large" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
          if (e.key !== "Tab") return;
          const items = Array.from(
            panel.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input:not(:disabled),textarea,select,a[href]"
            ) || []
          );
          const first = items[0],
            last = items.at(-1);
          if (
            e.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === panel.current)
          ) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="app-sheet-handle" aria-hidden="true" />
        <div className="app-sheet-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="app-icon-button"
            aria-label="Fechar"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="app-sheet-content custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
}
export function ActionRow({
  icon,
  title,
  detail,
  value,
  onClick,
  danger = false,
}: {
  icon?: IconName;
  title: string;
  detail?: string;
  value?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      {icon && (
        <span className="app-row-icon">
          <Icon name={icon} size={19} />
        </span>
      )}
      <span className="app-row-copy">
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
      {value && <span className="app-row-value">{value}</span>}
      {onClick && <Icon name="chevron" size={16} />}
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={`app-action-row ${danger ? "is-danger" : ""}`}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div className="app-action-row">{content}</div>
  );
}
