import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        // Botón primario - Azul principal
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        
        // Botón secundario - Azul secundario
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90",
        
        // Botón de acento - Azul de acento
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90",
        
        // Botón outline - Borde con fondo transparente
        outline: "border border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/60 active:bg-primary/5 dark:border-primary/50 dark:text-primary-foreground dark:hover:bg-primary/20 dark:hover:border-primary/70",
        
        // Botón ghost - Solo texto con hover sutil
        ghost: "hover:bg-accent/10 hover:text-accent-foreground active:bg-accent/5 dark:hover:bg-accent/20 dark:text-accent-foreground",
        
        // Botón de enlace - Estilo de enlace subrayado
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto dark:text-primary-foreground",
        
        // Botón de éxito - Verde
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-success dark:text-success-foreground dark:hover:bg-success/90",
        
        // Botón de advertencia - Naranja
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-warning dark:text-warning-foreground dark:hover:bg-warning/90",
        
        // Botón destructivo - Rojo
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm font-medium",
        sm: "h-8 px-3 text-xs rounded-md font-medium",
        lg: "h-12 px-6 text-base rounded-xl font-medium",
        xl: "h-14 px-8 text-lg rounded-xl font-semibold",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
        "icon-sm": "h-8 w-8 p-0 flex items-center justify-center text-sm",
        "icon-lg": "h-12 w-12 p-0 flex items-center justify-center text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
