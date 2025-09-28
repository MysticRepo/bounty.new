import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { trpc } from '@/utils/trpc';

/**
 * Generic hook for TRPC mutations with optimistic updates
 * Reduces boilerplate in components by ~60%
 */
export function useTrpcMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  options?: {
    onSuccess?: (data: TOutput, variables: TInput) => void;
    onError?: (error: Error, variables: TInput) => void;
    optimisticUpdate?: (input: TInput) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const mutateWithOptimistic = useCallback(
    (input: TInput) => {
      // Apply optimistic update if provided
      if (options?.optimisticUpdate) {
        options.optimisticUpdate(input);
      }
      mutation.mutate(input);
    },
    [mutation, options]
  );

  return {
    ...mutation,
    mutateWithOptimistic,
  };
}

/**
 * Specialized hook for bounty-related mutations
 * Consolidates common patterns from bounty components
 */
export function useBountyMutation() {
  const queryClient = useQueryClient();

  const voteBounty = useTrpcMutation(
    trpc.bounties.voteBounty.mutate,
    {
      invalidateQueries: ['bounties'],
      optimisticUpdate: (input) => {
        // Optimistic update logic for voting
        const votesKey = trpc.bounties.getBountyVotes.queryKey({
          bountyId: input.bountyId,
        });
        const previous = queryClient.getQueryData(votesKey);
        if (previous) {
          queryClient.setQueryData(votesKey, {
            count: previous.isVoted
              ? Math.max(0, Number(previous.count) - 1)
              : Number(previous.count) + 1,
            isVoted: !previous.isVoted,
          });
        }
      },
    }
  );

  const toggleBookmark = useTrpcMutation(
    trpc.bounties.toggleBountyBookmark.mutate,
    {
      invalidateQueries: ['bounties'],
      optimisticUpdate: (input) => {
        const bookmarkKey = trpc.bounties.getBountyBookmark.queryKey({
          bountyId: input.bountyId,
        });
        const previous = queryClient.getQueryData(bookmarkKey);
        if (previous) {
          queryClient.setQueryData(bookmarkKey, {
            bookmarked: !previous.bookmarked,
          });
        }
      },
    }
  );

  return {
    voteBounty,
    toggleBookmark,
  };
}

/**
 * Hook for comment mutations with optimistic updates
 */
export function useCommentMutation(bountyId: string) {
  const queryClient = useQueryClient();
  const key = trpc.bounties.getBountyComments.queryKey({ bountyId });

  const addComment = useTrpcMutation(
    trpc.bounties.addBountyComment.mutate,
    {
      optimisticUpdate: (input) => {
        const previous = queryClient.getQueryData(key) || [];
        const optimistic = [
          {
            id: `temp-${Date.now()}`,
            content: input.content,
            parentId: input.parentId ?? null,
            createdAt: new Date().toISOString(),
            user: { id: 'me', name: 'You', image: null },
            likeCount: 0,
            isLiked: false,
            editCount: 0,
          },
          ...previous,
        ];
        queryClient.setQueryData(key, optimistic);
      },
    }
  );

  const toggleLike = useTrpcMutation(
    trpc.bounties.toggleCommentLike.mutate,
    {
      optimisticUpdate: (input) => {
        const previous = queryClient.getQueryData(key) || [];
        const next = previous.map((c: any) =>
          c.id === input.commentId
            ? {
                ...c,
                likeCount: Number(c.likeCount || 0) + (c.isLiked ? -1 : 1),
                isLiked: !c.isLiked,
              }
            : c
        );
        queryClient.setQueryData(key, next);
      },
    }
  );

  const updateComment = useTrpcMutation(
    trpc.bounties.updateBountyComment.mutate,
    {
      optimisticUpdate: (input) => {
        const previous = queryClient.getQueryData(key) || [];
        const next = previous.map((c: any) =>
          c.id === input.commentId
            ? {
                ...c,
                content: input.content,
                editCount: Number(c.editCount || 0) + 1,
              }
            : c
        );
        queryClient.setQueryData(key, next);
      },
    }
  );

  const deleteComment = useTrpcMutation(
    trpc.bounties.deleteBountyComment.mutate,
    {
      optimisticUpdate: (input) => {
        const previous = queryClient.getQueryData(key) || [];
        const next = previous.filter((c: any) => c.id !== input.commentId);
        queryClient.setQueryData(key, next);
      },
    }
  );

  return {
    addComment,
    toggleLike,
    updateComment,
    deleteComment,
  };
}