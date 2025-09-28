import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bounty/ui/components/card';
import { Badge } from '@bounty/ui/components/badge';
import { Button } from '@bounty/ui/components/button';
import { componentClasses, cn } from '@/lib/design-tokens';
import { ReactNode } from 'react';

/**
 * Generic data card component
 * Consolidates 6+ similar card implementations
 * Reduces card component duplication by ~80%
 */

interface DataCardProps {
  title: string;
  description?: string;
  value?: string | number;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: ReactNode;
  href?: string;
  className?: string;
  children?: ReactNode;
}

export function DataCard({
  title,
  description,
  value,
  icon,
  badge,
  actions,
  href,
  className,
  children,
}: DataCardProps) {
  const cardContent = (
    <Card className={cn(componentClasses.card, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          'flex items-center gap-2 font-medium text-neutral-300 text-sm',
          href && 'group'
        )}>
          {icon}
          {title}
          {href && (
            <span className="h-4 w-4 text-neutral-400 transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          )}
        </CardTitle>
        {badge && (
          <Badge variant={badge.variant}>
            {badge.text}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {value && (
          <div className="font-semibold text-neutral-100 text-xl tracking-tight">
            {value}
          </div>
        )}
        {description && (
          <p className="mt-1 text-neutral-500 text-xs">
            {description}
          </p>
        )}
        {children}
        {actions && (
          <div className="mt-4 flex items-center gap-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

/**
 * Specialized card for statistics
 */
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  href?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  href,
}: StatCardProps) {
  return (
    <DataCard
      title={title}
      value={value}
      description={description}
      icon={icon}
      href={href}
      actions={
        trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm',
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )
      }
    />
  );
}

/**
 * Card for displaying lists with actions
 */
interface ListCardProps {
  title: string;
  description?: string;
  items: Array<{
    id: string;
    title: string;
    description?: string;
    badge?: {
      text: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    };
    actions?: ReactNode;
  }>;
  emptyMessage?: string;
  loading?: boolean;
}

export function ListCard({
  title,
  description,
  items,
  emptyMessage = 'No items found',
  loading = false,
}: ListCardProps) {
  return (
    <Card className={componentClasses.card}>
      <CardHeader>
        <CardTitle className="font-medium text-neutral-300 text-sm">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-neutral-500 text-xs">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn(componentClasses.skeleton, 'h-6 w-full')} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-neutral-400 text-sm">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.badge && (
                    <Badge variant={item.badge.variant}>
                      {item.badge.text}
                    </Badge>
                  )}
                </div>
                {item.actions && (
                  <div className="flex items-center space-x-2">
                    {item.actions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}