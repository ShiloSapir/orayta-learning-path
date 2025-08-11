import { toast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useAppToast = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(options?.title || message, {
      description: options?.description,
      action: options?.action
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(options?.title || message, {
      description: options?.description,
      action: options?.action
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(options?.title || message, {
      description: options?.description,
      action: options?.action
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(options?.title || message, {
      description: options?.description,
      action: options?.action
    });
  };

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning
  };
};