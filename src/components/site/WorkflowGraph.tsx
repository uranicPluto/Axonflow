import { motion, useReducedMotion } from "motion/react";

const nodes = [
  { id: "inbox", label: "Inbox", sub: "1,240 msgs/day", x: 40, y: 54, w: 128 },
  { id: "crm", label: "CRM", sub: "Deal records", x: 40, y: 168, w: 128 },
  { id: "docs", label: "Documents", sub: "PDF · scans", x: 40, y: 282, w: 128 },
  { id: "erp", label: "ERP", sub: "Orders · ledger", x: 40, y: 396, w: 128 },
] as const;

const outputs = [
  { id: "approve", label: "Human approval", sub: "2 pending", x: 596, y: 78, w: 148 },
  { id: "action", label: "Action executed", sub: "412 today", x: 596, y: 196, w: 148 },
  { id: "record", label: "Systems updated", sub: "Write-back", x: 596, y: 314, w: 148 },
  { id: "audit", label: "Audit ledger", sub: "Every run logged", x: 596, y: 432, w: 148 },
] as const;

const coreX = 300;
const coreW = 216;

const inputTargetYs = [150, 182, 250, 295];

const edgesIn = nodes.map((n, i) => ({
  d: `M ${n.x + n.w} ${n.y + 26} C ${n.x + n.w + 70} ${n.y + 26}, ${coreX - 70} ${
    inputTargetYs[i]
  }, ${coreX} ${inputTargetYs[i]}`,
  delay: i * 0.12,
}));

const edgesOut = outputs.map((o, i) => ({
  d: `M ${coreX + coreW} ${188 + i * 24} C ${coreX + coreW + 60} ${188 + i * 24}, ${
    o.x - 60
  } ${o.y + 24}, ${o.x} ${o.y + 24}`,
  delay: 0.5 + i * 0.12,
}));

function NodeCard({
  x,
  y,
  w,
  label,
  sub,
  delay,
  accent = true,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  sub: string;
  delay: number;
  accent?: boolean;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={52}
        rx={12}
        fill="var(--color-card)"
        stroke={accent ? "var(--color-primary)" : "var(--color-hairline)"}
        strokeOpacity={accent ? 0.45 : 1}
      />
      <circle
        cx={x + 15}
        cy={y + 26}
        r={3.5}
        fill={accent ? "var(--color-primary)" : "var(--color-muted-foreground)"}
      />
      <text
        x={x + 28}
        y={y + 22}
        fontSize="11.5"
        fontWeight="500"
        fill="var(--color-foreground)"
        fontFamily="Geist, sans-serif"
      >
        {label}
      </text>
      <text
        x={x + 28}
        y={y + 37}
        fontSize="9.5"
        fill="var(--color-muted-foreground)"
        fontFamily="Geist Mono, monospace"
      >
        {sub}
      </text>
    </motion.g>
  );
}

export function WorkflowGraph({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={className}>
      <svg
        viewBox="0 0 784 500"
        className="h-auto w-full"
        role="img"
        aria-label="Diagram: source systems flowing into an Axonflow orchestration core, then out to approvals, actions, system write-backs and an audit ledger"
      >
        <defs>
          <linearGradient id="axon-core" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* edges */}
        {[...edgesIn, ...edgesOut].map((e, i) => (
          <g key={i}>
            <path
              d={e.d}
              fill="none"
              stroke="var(--color-primary)"
              strokeOpacity="0.3"
              strokeWidth="2"
            />
            {reduced ? null : (
              <motion.path
                d={e.d}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.25 + e.delay, ease: "easeInOut" }}
              />
            )}
            {reduced ? null : (
              <circle r="3.2" fill="var(--color-primary)">
                <animateMotion
                  dur={`${3.4 + (i % 4) * 0.6}s`}
                  begin={`${1 + i * 0.28}s`}
                  repeatCount="indefinite"
                  path={e.d}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${3.4 + (i % 4) * 0.6}s`}
                  begin={`${1 + i * 0.28}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}

        {/* core */}
        <motion.g
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "408px 250px" }}
        >
          <rect
            x={coreX}
            y={116}
            width={coreW}
            height={268}
            rx={18}
            fill="url(#axon-core)"
            stroke="var(--color-primary)"
            strokeOpacity="0.35"
          />
          <text
            x={coreX + 20}
            y={146}
            fontSize="9.5"
            letterSpacing="1.6"
            fill="var(--color-primary)"
            fontFamily="Geist Mono, monospace"
          >
            ORCHESTRATION CORE
          </text>
          {[
            { label: "Classify & extract", value: "99.4%" },
            { label: "Rules engine", value: "versioned" },
            { label: "Agent tools", value: "scoped" },
            { label: "Evaluation gate", value: "CI" },
            { label: "Cost controls", value: "per team" },
          ].map((row, i) => (
            <motion.g
              key={row.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.09 }}
            >
              <rect
                x={coreX + 16}
                y={162 + i * 42}
                width={coreW - 32}
                height={34}
                rx={9}
                fill="var(--color-card)"
                stroke="var(--color-hairline)"
              />
              <text
                x={coreX + 28}
                y={183 + i * 42}
                fontSize="11"
                fill="var(--color-foreground)"
                fontFamily="Geist, sans-serif"
              >
                {row.label}
              </text>
              <text
                x={coreX + coreW - 28}
                y={183 + i * 42}
                textAnchor="end"
                fontSize="9.5"
                fill="var(--color-primary)"
                fontFamily="Geist Mono, monospace"
              >
                {row.value}
              </text>
            </motion.g>
          ))}
        </motion.g>

        {/* labels */}
        <text
          x={40}
          y={34}
          fontSize="9.5"
          letterSpacing="1.6"
          fill="var(--color-muted-foreground)"
          fontFamily="Geist Mono, monospace"
        >
          YOUR SYSTEMS
        </text>
        <text
          x={596}
          y={58}
          fontSize="9.5"
          letterSpacing="1.6"
          fill="var(--color-muted-foreground)"
          fontFamily="Geist Mono, monospace"
        >
          OUTCOMES
        </text>

        {nodes.map((n, i) => (
          <NodeCard key={n.id} {...n} delay={0.1 + i * 0.09} accent={true} />
        ))}
        {outputs.map((o, i) => (
          <NodeCard key={o.id} {...o} delay={0.7 + i * 0.09} accent={i !== 0} />
        ))}
      </svg>
    </div>
  );
}
