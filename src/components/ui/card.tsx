'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Tipos de variantes para la tarjeta
type CardVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'outline' | 'elevated';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-card border-border',
      primary: 'bg-primary/5 border-primary/20',
      secondary: 'bg-secondary/5 border-secondary/20',
      accent: 'bg-accent/5 border-accent/20',
      outline: 'bg-transparent border-border/50',
      elevated: 'bg-card border-border shadow-lg',
    };

    const hoverClasses = hoverable 
      ? 'transition-all duration-200 hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5' 
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl border',
          variantClasses[variant],
          hoverClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Componente para el encabezado de la tarjeta
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withBorder?: boolean;
  }
>(({ className, withBorder = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-6',
      withBorder && 'border-b border-border/30',
      className
    )}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

// Componente para el título de la tarjeta
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-tight tracking-tight text-foreground',
      className
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

// Componente para la descripción de la tarjeta
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
