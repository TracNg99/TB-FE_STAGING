'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClassName: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none',
  secondary:
    'bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none',
  outline:
    'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none',
  ghost:
    'bg-transparent hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none',
  destructive:
    'bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none',
};

const sizeClassName: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          variantClassName[variant],
          sizeClassName[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
