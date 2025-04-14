
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="w-6 h-6 rounded-full bg-brand-purple-light flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-xl">Scope Sentinel</span>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-full pl-8"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button variant="default" className="bg-brand-purple-light hover:bg-brand-purple">
            Start New Project
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-brand-purple text-white">US</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
