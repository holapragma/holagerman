import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-hover)">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-muted-foreground">
            {title}
          </p>
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-200 group-hover:scale-110">
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </div>
        </div>
        <p className="mt-4 text-[34px] leading-none font-semibold tracking-tight">
          {value}
        </p>
        {description ? (
          <p className="mt-2.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </motion.div>
  );
}