import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Undo, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useResponsiveToast } from "@/hooks/useResponsiveToast";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
  onUndo?: () => void;
  projectColor?: string;
}

// Icon mapping for different toast types
const toastIcons = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />
};

// Helper function to display toast notifications using sonner
export const showToast = ({
  title,
  description,
  type = "info",
  duration = 5000,
  action,
  onUndo,
  projectColor,
}: ToastOptions) => {
  const icon = projectColor ? 
    <div className="flex-shrink-0 h-4 w-4 rounded-full" style={{ backgroundColor: projectColor }}></div> : 
    toastIcons[type];

  // Create a combined action including both the undo button and any custom action
  const combinedAction = onUndo ? (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 px-2 text-xs flex items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUndo();
        }}
      >
        <Undo className="h-3 w-3" />
        Undo
      </Button>
      {action}
    </div>
  ) : action;

  // Use sonner toast for a more modern look
  sonnerToast[type](title, {
    description,
    duration,
    action: combinedAction,
    icon,
    // Add responsive positioning
    position: window.innerWidth < 768 ? 'top-center' : 'bottom-center',
    style: {
      marginBottom: window.innerWidth < 768 ? '1rem' : '4rem', // More margin on desktop to avoid nav
    },
  });
};

// Pre-configured toast notifications for common actions
export const toastSuccess = (message: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
  showToast({
    title: message,
    description,
    type: "success",
    ...options
  });
};

export const toastError = (message: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
  showToast({
    title: message,
    description,
    type: "error",
    ...options
  });
};

export const toastInfo = (message: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
  showToast({
    title: message,
    description,
    type: "info",
    ...options
  });
};

export const toastWarning = (message: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
  showToast({
    title: message,
    description,
    type: "warning",
    ...options
  });
};
