
import { useState, useCallback } from "react";
import { toast as sonnerToast, type ToastT } from "@/components/ui/toast";

type ToastProps = React.ComponentProps<typeof ToastT>;

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

// Simple toast function to use outside of React components
export const toast = (options: ToastOptions) => {
  sonnerToast({
    title: options.title,
    description: options.description,
    action: options.action,
    variant: options.variant,
  });
};

// Hook for use within React components
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((props: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    sonnerToast({
      ...props,
      id,
    });

    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title: props.title, description: props.description, action: props.action } as ToastProps,
    ]);

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toast: addToast,
    toasts,
    dismissToast,
  };
};
