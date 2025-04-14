import { EmptyState } from "@/components/ui/empty-state";
import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <EmptyState
        icon={Settings}
        title="Coming Soon"
        description="Project settings and customization options will be available in a future update."
        className="bg-card"
      />
    </div>
  );
} 