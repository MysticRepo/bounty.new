'use client';

import { Button, HotkeyButton } from '@bounty/ui/components/button';
import { cn } from '@bounty/ui/lib/utils';
import { useCallback, useRef } from 'react';
import { useCommentForm, useCharacterCount } from '@/hooks/use-form-state';
import { componentClasses } from '@/lib/design-tokens';

// Types
interface BountyCommentFormProps {
  maxChars?: number;
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  errorKey?: number;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function BountyCommentForm({
  maxChars = 245,
  onSubmit,
  isSubmitting = false,
  error,
  errorKey,
  placeholder = 'Add a comment',
  submitLabel = 'Post',
  onCancel,
  autoFocus = false,
  disabled = false,
}: BountyCommentFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    form,
    handleSubmit,
    isSubmitting: formSubmitting,
    submitError,
    content,
    remaining,
    isOverLimit,
    isNearLimit,
    canSubmit,
  } = useCommentForm(maxChars, onSubmit);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
        return;
      }

      // Handle Enter key (both regular and Cmd/Ctrl+Enter)
      if (e.key === 'Enter') {
        const isCommandEnter = e.metaKey || e.ctrlKey;
        const isPlainEnter = !(e.shiftKey || isCommandEnter);

        if (isCommandEnter || isPlainEnter) {
          e.preventDefault();
          handleSubmit();
        }
      }
    },
    [onCancel, handleSubmit]
  );

  // Combine refs and event handlers
  const { ref: formRef, onChange, ...fieldProps } = form.register('content');
  const combinedRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      formRef(el);
      textareaRef.current = el;
    },
    [formRef]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
    },
    [onChange]
  );

  // Error message with priority: prop error > form errors
  const errorMessage = error || submitError;
  const hasError = Boolean(errorMessage);
  const isActuallySubmitting = isSubmitting || formSubmitting;

  return (
    <form
      className="space-y-3"
      noValidate
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit(onValidatedSubmit)}
    >
      {/* Textarea Container with Cursor Counter Overlay */}
      <div className="relative">
        <textarea
          {...fieldProps}
          aria-describedby={hasError ? 'comment-error' : 'comment-counter'}
          aria-invalid={hasError}
          autoFocus={autoFocus}
          className={cn(
            componentClasses.input,
            'min-h-16',
            isOverLimit
              ? 'border-red-700 focus:ring-red-700'
              : 'border-neutral-800'
          )}
          disabled={isActuallySubmitting || disabled}
          onChange={handleInputChange}
          placeholder={placeholder}
          ref={combinedRef}
        />

        {/* Character Counter */}
        <div className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1">
          {isNearLimit && (
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isOverLimit ? 'bg-red-500' : 'bg-yellow-500'
              )}
            />
          )}
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums opacity-60',
              isOverLimit
                ? 'text-red-400'
                : isNearLimit
                  ? 'text-yellow-400'
                  : 'text-neutral-500'
            )}
            id="comment-counter"
          >
            {remaining}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <div
          aria-live="polite"
          className="text-red-400 text-xs" // Force re-render when errorKey changes
          id="comment-error"
          key={errorKey}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            className={componentClasses.button.secondary}
            disabled={isActuallySubmitting || disabled}
            onClick={onCancel}
            size="sm"
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        )}
        <HotkeyButton
          className={cn(isActuallySubmitting && 'cursor-not-allowed opacity-75')}
          disabled={!canSubmit || isActuallySubmitting || disabled}
          hotkey="⏎"
          size="sm"
          type="submit"
        >
          {isActuallySubmitting ? 'Posting...' : submitLabel}
        </HotkeyButton>
      </div>
    </form>
  );
}
