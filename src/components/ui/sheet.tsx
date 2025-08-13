'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Fallback visually-hidden utility to satisfy a11y without adding a new dep
function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </div>
  );
}

export type SheetSide = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type SheetProps = DialogPrimitive.DialogProps;

export function Sheet(props: SheetProps) {
  return <DialogPrimitive.Root {...props} />;
}

export interface SheetContentProps extends DialogPrimitive.DialogContentProps {
  side?: SheetSide;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = 'right', children, ...props }, ref) => {
    const sideClasses: Record<SheetSide, string> = {
      top: 'inset-x-0 top-0 border-b',
      bottom: 'inset-x-0 bottom-0 border-t',
      left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r',
      right: 'inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l',
      center: 'inset-0 flex items-center justify-center',
    };

    const roundedClasses: Record<SheetSide, string> = {
      top: 'rounded-b-xl',
      bottom: 'rounded-t-xl',
      left: 'rounded-r-xl',
      right: 'rounded-l-xl',
      center: 'rounded-xl',
    };

    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
            // Fade animation
            'transition-opacity duration-300',
            'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
          )}
        />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed z-50 bg-background p-0 shadow-lg outline-none',
            sideClasses[side],
            roundedClasses[side],
            // Slide up from bottom by default; other sides will still have a smooth transform
            'transition-transform duration-300 ease-out',
            side === 'bottom'
              ? 'data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full'
              : side === 'top'
                ? 'data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-full'
                : side === 'left'
                  ? 'data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full'
                  : side === 'right'
                    ? 'data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full'
                    : 'data-[state=open]:scale-100 data-[state=closed]:scale-95',
            className,
          )}
          {...props}
        >
          {/* Accessibility: provide hidden title/description to satisfy Dialog a11y requirements */}
          <VisuallyHidden>
            <DialogPrimitive.Title>Audio Drawer</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Audio player and transcript
            </DialogPrimitive.Description>
          </VisuallyHidden>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  },
);

SheetContent.displayName = 'SheetContent';
