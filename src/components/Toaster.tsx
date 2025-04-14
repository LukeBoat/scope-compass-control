import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800",
            {
              "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-400":
                toast.type === "success",
              "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-400":
                toast.type === "error",
              "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400":
                toast.type === "warning",
              "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400":
                toast.type === "info",
            }
          )}
        >
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => dismiss(toast.id)}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 