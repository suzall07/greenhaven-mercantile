
import { useState, useCallback, useEffect } from "react";
import { Toast as ToastPrimitive } from "@/components/ui/toast";

type ToastProps = React.ComponentProps<typeof ToastPrimitive> & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

// Simple toast function to use outside of React components
export const toast = (options: ToastOptions) => {
  const event = new CustomEvent("toast", {
    detail: options
  });
  document.dispatchEvent(event);
};

// Hook for use within React components
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((props: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newToast = { 
      id, 
      title: props.title, 
      description: props.description,
      action: props.action,
      variant: props.variant
    } as ToastProps;
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Listen for toast events (for use outside of React components)
  useEffect(() => {
    const handleToast = (event: Event) => {
      const options = (event as CustomEvent).detail;
      if (options) {
        addToast(options);
      }
    };

    document.addEventListener("toast", handleToast);
    return () => document.removeEventListener("toast", handleToast);
  }, [addToast]);

  return {
    toast: addToast,
    toasts,
    dismissToast,
  };
};
