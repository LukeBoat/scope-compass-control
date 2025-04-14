
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "@/components/ui/sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
}

// Helper function to display toast notifications using either the shadcn toast or sonner
export const showToast = ({
  title,
  description,
  type = "info",
  duration = 5000,
  action,
}: ToastOptions) => {
  // Use sonner toast for a more modern look
  sonnerToast[type](title, {
    description,
    duration,
    action,
  });
};

// Pre-configured toast notifications for common actions
export const toastSuccess = (message: string, description?: string) => {
  showToast({
    title: message,
    description,
    type: "success",
  });
};

export const toastError = (message: string, description?: string) => {
  showToast({
    title: message,
    description,
    type: "error",
  });
};

export const toastInfo = (message: string, description?: string) => {
  showToast({
    title: message,
    description,
    type: "info",
  });
};

export const toastWarning = (message: string, description?: string) => {
  showToast({
    title: message,
    description,
    type: "warning",
  });
};
