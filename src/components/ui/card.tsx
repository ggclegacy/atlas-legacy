import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-line bg-surface', className)} {...props} />;
}

/**
 * Section heading used above or inside a Card.
 *
 * The gold rule to the left of the label is Atlas's structural marker — it is
 * how hierarchy is expressed, rather than with heavy borders or large type.
 */
export function CardHeader({
  title,
  action,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { title: ReactNode; action?: ReactNode }) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 px-4 pt-3.5 pb-2', className)}
      {...props}
    >
      <h2 className="flex items-center gap-2.5 text-xs tracking-[0.16em] text-secondary uppercase">
        <span aria-hidden className="h-3 w-px bg-gold-600" />
        {title}
      </h2>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4', className)} {...props} />;
}
