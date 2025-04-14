import { useToast } from "@/hooks/use-toast";

export const toast = {
  success: (message: string) => {
    const { addToast } = useToast.getState();
    addToast({ message, type: "success" });
  },
  error: (message: string) => {
    const { addToast } = useToast.getState();
    addToast({ message, type: "error" });
  },
  warning: (message: string) => {
    const { addToast } = useToast.getState();
    addToast({ message, type: "warning" });
  },
  info: (message: string) => {
    const { addToast } = useToast.getState();
    addToast({ message, type: "info" });
  },
}; 