"use client";

/**
 * The pieces the install steps share. Elevation comes from borders and background
 * steps, never from shadow - heavy shadows read badly on a dark ground.
 */

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-od-line bg-od-panel-deep-3 rounded-[10px] border ${className}`}>{children}</div>
  );
}

export function Heading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div>
      <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="text-od-muted-4 mt-2 max-w-[62ch] text-pretty">{blurb}</p>
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "violet" | "green" | "amber";
}) {
  const tones = {
    neutral: "border-od-border-7 bg-[var(--od-raise-5)] text-od-muted-5",
    violet: "border-[color:var(--od-violet-border)] bg-[rgba(139,124,255,.14)] text-[color:var(--od-violet-3)]",
    green: "border-[color:var(--od-green-border)] bg-[rgba(63,185,132,.10)] text-[color:var(--od-green-text)]",
    amber: "border-[color:var(--od-amber-border)] bg-od-amber-bg text-[color:var(--od-amber-text)]",
  };
  return (
    <span className={`rounded-[5px] border px-2 py-[2px] text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** The filled dot that marks the chosen option in every list on this screen. */
export function Radio({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span
      className={`mt-[3px] flex-none rounded-full border ${className}`}
      style={{
        width: 15,
        height: 15,
        borderColor: on ? "var(--od-violet)" : "var(--od-stroke-5)",
        background: on ? "var(--od-violet)" : "transparent",
        boxShadow: on ? "inset 0 0 0 3px var(--od-panel-deep-3)" : "none",
      }}
    />
  );
}

export function ChoiceCard({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full cursor-pointer rounded-[10px] border p-[16px_17px] text-start ${
        on ? "border-od-stroke bg-od-raise-10" : "border-od-line bg-od-panel-deep-3"
      }`}
    >
      {children}
    </button>
  );
}

/** A row inside a panel: a label on one side, a machine value on the other. */
export function FieldRow({
  label,
  help,
  value,
  dim = false,
  last = false,
}: {
  label: string;
  help?: string;
  value: string;
  dim?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-x-5 gap-y-3 p-[14px_18px] ${
        last ? "" : "border-b border-[color:var(--od-raise-6)]"
      }`}
    >
      <div className="min-w-[190px] flex-[1_1_220px]">
        <div className="text-od-text-3 font-medium">{label}</div>
        {help ? (
          <div className="text-od-muted-5 mt-[3px] max-w-[48ch] text-[12.5px] text-pretty">{help}</div>
        ) : null}
      </div>
      <span
        dir="ltr"
        className={`mono ltr-data border-od-border-6 bg-od-canvas-2 min-w-[min(100%,220px)] flex-[0_1_280px] rounded-[7px] border p-[9px_12px] text-[12.5px] [overflow-wrap:anywhere] ${
          dim ? "text-od-muted-5" : "text-od-text-2"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function PanelFooter({ note, action }: { note: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-[18px] gap-y-3 p-[14px_18px]">
      <span className="text-od-faint max-w-[58ch] text-[12.5px] text-pretty">{note}</span>
      <button
        type="button"
        className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-[7px] border px-[14px] py-2 text-[13px] font-medium whitespace-nowrap"
      >
        {action}
      </button>
    </div>
  );
}

/** A coloured callout. `plain` is neutral information; `amber` is a consequence. */
export function Note({
  tone,
  title,
  children,
}: {
  tone: "plain" | "amber";
  title?: string;
  children: React.ReactNode;
}) {
  const amber = tone === "amber";
  return (
    <div
      className={`mt-[14px] rounded-[10px] border p-[14px_16px] ${
        amber ? "border-od-amber-border-2 bg-[var(--od-amber-bg-2)]" : "border-od-line bg-od-panel-deep-2"
      }`}
    >
      {title ? (
        <div
          className={`text-[14.5px] font-semibold ${
            amber ? "text-[color:var(--od-amber-text-2)]" : "text-[color:var(--od-text-5)]"
          }`}
        >
          {title}
        </div>
      ) : null}
      <div
        className={`max-w-[66ch] text-[13px] text-pretty ${title ? "mt-1" : ""} ${
          amber ? "text-[color:var(--od-amber-text-3)]" : "text-od-muted"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function SectionHead({ label, note, extra }: { label: string; note: string; extra?: string | null }) {
  return (
    <div className="p-[15px_18px_8px]">
      <div className="text-od-faint text-[12px] font-semibold tracking-[.08em] uppercase">{label}</div>
      <div className="text-od-faint mt-1 max-w-[64ch] text-[12.5px] text-pretty">{note}</div>
      {extra ? (
        <div className="mt-[6px] text-[12.5px] text-pretty text-[color:var(--od-violet-3)]">{extra}</div>
      ) : null}
    </div>
  );
}

/** Pass / warn / fail badge, shared by the readiness checks and the install tasks. */
export function StatusMark({
  tone,
  children,
  spin = false,
}: {
  tone: "ok" | "warn" | "fail" | "violet" | "idle";
  children: React.ReactNode;
  spin?: boolean;
}) {
  const border = {
    ok: "var(--od-green-border)",
    warn: "var(--od-amber-border)",
    fail: "var(--od-red-border)",
    violet: "var(--od-violet-border)",
    idle: "var(--od-border-7)",
  }[tone];
  const background = {
    ok: "rgba(63,185,132,.11)",
    warn: "var(--od-amber-bg)",
    fail: "rgba(240,96,94,.11)",
    violet: "rgba(139,124,255,.13)",
    idle: "transparent",
  }[tone];
  const color = {
    ok: "var(--od-green-text)",
    warn: "var(--od-amber-text)",
    fail: "var(--od-red-text-4)",
    violet: "var(--od-violet-3)",
    idle: "var(--od-faint-2)",
  }[tone];

  return (
    <span
      className="inline-flex size-[22px] flex-none items-center justify-center rounded-full border text-[12px] leading-none font-bold"
      style={{
        borderColor: border,
        background,
        color,
        animation: spin ? "od-spin 1.1s linear infinite" : "none",
      }}
    >
      {children}
    </span>
  );
}
