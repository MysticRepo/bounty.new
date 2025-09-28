import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@bounty/ui/components/avatar';
import { addNavigationContext } from '@bounty/ui/hooks/use-navigation-context';
import { formatLargeNumber } from '@bounty/ui/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, MessageCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { memo } from 'react';
import BookmarkButton from '@/components/bounty/bookmark-button';
import { UpvoteButton } from '@/components/bounty/bounty-actions';
import type { Bounty } from '@/types/dashboard';
import { useBountyMutation } from '@/hooks/use-trpc-mutation';
import { componentClasses, cn } from '@/lib/design-tokens';
import { MarkdownContent } from './markdown-content';

interface BountyCardProps {
  bounty: Bounty;
  stats?: {
    commentCount: number;
    voteCount: number;
    isVoted: boolean;
    bookmarked: boolean;
  };
}

export const BountyCard = memo(function BountyCard({
  bounty,
  stats: initialStats,
}: BountyCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { voteBounty, toggleBookmark } = useBountyMutation();

  const handleClick = () => {
    const url = addNavigationContext(`/bounty/${bounty.id}`, pathname);
    router.push(url);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const creatorInitial = bounty.creator.name?.charAt(0)?.toUpperCase() || 'U';
  const creatorName = bounty.creator.name || 'Anonymous';
  const voteCount = initialStats?.voteCount ?? 0;
  const isVotedInitial = initialStats?.isVoted ?? false;

  const handleUpvote = () => {
    voteBounty.mutateWithOptimistic({ bountyId: bounty.id });
  };

  const handleToggleBookmark = () => {
    toggleBookmark.mutateWithOptimistic({ bountyId: bounty.id });
  };

  return (
    <div
      aria-label={`View bounty: ${bounty.title}`}
      className={cn(
        componentClasses.cardHover,
        'flex w-full cursor-pointer flex-col items-start gap-3 p-6'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className={componentClasses.avatar}>
            <AvatarImage
              alt={bounty.creator.name || ''}
              src={bounty.creator.image || ''}
            />
            <AvatarFallback>{creatorInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn('font-medium text-sm', componentClasses.text.primary)}>
                {creatorName}
              </span>
              <div className="flex h-4 w-4 rotate-45 transform items-center justify-center rounded bg-blue-500">
                <Check className="-rotate-45 h-2.5 w-2.5 transform text-white" />
              </div>
            </div>
            <span className={cn('text-xs capitalize', componentClasses.text.muted)}>
              {bounty.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UpvoteButton
            isVoted={isVotedInitial}
            onUpvote={handleUpvote}
            voteCount={voteCount}
          />
          <BookmarkButton
            bookmarked={initialStats?.bookmarked}
            bountyId={bounty.id}
            onToggle={handleToggleBookmark}
          />
          <span className={cn('font-semibold text-sm', componentClasses.text.accent)}>
            ${formatLargeNumber(bounty.amount)}
          </span>
        </div>
      </div>

      <div className="w-full">
        <h3 className={cn('mb-2 line-clamp-2 font-medium text-base', componentClasses.text.primary)}>
          {bounty.title}
        </h3>
        <div className={cn('relative text-sm', componentClasses.text.muted)}>
          <div className="max-h-24 overflow-hidden pr-1">
            <MarkdownContent content={bounty.description} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-[#191919]" />
        </div>
      </div>

      <div className={cn('mt-auto flex items-center gap-4 text-xs', componentClasses.text.muted)}>
        <div className="flex items-center gap-1">
          <Clock aria-hidden="true" className="h-4 w-4" />
          <time
            dateTime={bounty.createdAt}
            title={new Date(bounty.createdAt).toLocaleString()}
          >
            {formatDistanceToNow(new Date(bounty.createdAt), {
              addSuffix: true,
            })}
          </time>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
          <span>
            {initialStats?.commentCount ?? 0}{' '}
            {(initialStats?.commentCount ?? 0) === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>
    </div>
  );
});
