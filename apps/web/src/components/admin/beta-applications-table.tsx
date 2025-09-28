'use client';

import { ListCard } from '@/components/shared/data-card';
import type { BetaApplication } from '@/types/beta-application';
import { BetaApplicationCard } from './beta-application-card';

interface BetaApplicationsTableProps {
  applications: BetaApplication[];
  total: number;
  isLoading: boolean;
}

export function BetaApplicationsTable({
  applications,
  total,
  isLoading,
}: BetaApplicationsTableProps) {
  const items = applications.map(app => ({
    id: app.id,
    title: app.projectName,
    description: `by ${app.user?.name || 'Unknown'} (${app.user?.email || 'No email'})`,
    badge: {
      text: app.status,
      variant: app.status === 'approved' ? 'default' : 
               app.status === 'rejected' ? 'destructive' : 'secondary'
    } as const,
    actions: <BetaApplicationCard application={app} />
  }));

  return (
    <ListCard
      title={`Applications (${total})`}
      description="Review applications and grant beta access"
      items={items}
      loading={isLoading}
      emptyMessage="No applications found"
    />
  );
}
