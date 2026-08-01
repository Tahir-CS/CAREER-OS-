import { BadgeCheck, FileText, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

const Header = () => {
  return (
    <header className="container mx-auto px-4 py-6 md:py-8">
      <nav className="brutalist-card rounded-none px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <span className="inline-flex h-11 w-11 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <p className="chip-mono text-xs uppercase text-muted-foreground">Career Intelligence Platform</p>
              <p className="font-display text-xl font-bold text-foreground md:text-2xl uppercase">CareerOS</p>
            </div>
          </a>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="chip-mono border-2 border-border bg-white text-black dark:bg-black dark:text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Live AI Review
            </Badge>
            <Badge variant="outline" className="chip-mono border-2 border-border bg-accent text-accent-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
              ATS Focused
            </Badge>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
