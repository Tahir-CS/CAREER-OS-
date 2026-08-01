import { BadgeCheck, FileText, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

const Header = () => {
  return (
    <header className="container mx-auto px-4 py-6 md:py-8">
      <nav className="apple-card px-6 py-4 md:px-8 md:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a href="/" className="flex items-center gap-3.5 transition-opacity hover:opacity-90">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0071e3] to-[#af52de] text-white shadow-md shadow-[#0071e3]/20">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <p className="chip-mono text-[10px] uppercase font-bold tracking-widest text-[#86868b]">Career Intelligence Platform</p>
              <p className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-foreground md:text-2xl">CareerOS</p>
            </div>
          </a>

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3]">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Live AI Review
            </Badge>
            <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#34c759]/10 px-3.5 py-1 text-xs font-semibold text-[#34c759]">
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
