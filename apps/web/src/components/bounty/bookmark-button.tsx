'use client';

import { Button } from '@bounty/ui/components/button';
import { useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { useBountyMutation } from '@/hooks/use-trpc-mutation';
import { componentClasses, cn } from '@/lib/design-tokens';

interface BookmarkButtonProps {
  bountyId: string;
  className?: string;
  bookmarked?: boolean;
  onToggle?: () => void;
}

export default function BookmarkButton({
  bountyId,
  className,
  bookmarked: controlledBookmarked,
  onToggle,
}: BookmarkButtonProps) {
  const bookmarkQuery = useQuery({
    ...trpc.bounties.getBountyBookmark.queryOptions({ bountyId }),
    enabled: !onToggle,
  });
  const { toggleBookmark } = useBountyMutation();

  const handleClick = useCallback(() => {
    if (onToggle) {
      return onToggle();
    }
    toggleBookmark.mutateWithOptimistic({ bountyId });
  }, [bountyId, onToggle, toggleBookmark]);

  const bookmarked = onToggle
    ? Boolean(controlledBookmarked)
    : (bookmarkQuery.data?.bookmarked ?? false);

  return (
    <Button
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={bookmarked}
      className={cn(componentClasses.button.icon, className)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      size="icon"
      variant="outline"
    >
      <Bookmark
        className={cn('h-4 w-4', bookmarked && 'fill-white text-white')}
      />
    </Button>
  );
}
