import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function NotFound({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true
}: NotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="rounded-full bg-brand-purple/10 p-6 mb-6">
        <FileQuestion className="h-12 w-12 text-brand-purple" />
      </div>
      <h1 className="text-4xl font-bold mb-4 text-brand-neutral-dark">{title}</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        {message}
      </p>
      {showBackButton && (
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
          >
            Go to Home
          </Button>
        </div>
      )}
    </div>
  );
} 