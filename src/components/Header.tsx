import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, FileText, Sparkles, LayoutDashboard, History, Mic, Search, Settings } from 'lucide-react';
import { Badge } from './ui/badge';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: History },
    { path: '/interview', label: 'Live Interview', icon: Mic },
    { path: '/keywords', label: 'ATS Scanner', icon: Search },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="container mx-auto px-4 py-4 md:py-6">
      <nav className="apple-card px-5 py-4 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3.5 transition-opacity hover:opacity-90">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/25">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="chip-mono text-[9px] uppercase font-bold tracking-widest text-[#86868b]">Career Intelligence Platform</p>
                <p className="text-xl font-bold tracking-tight text-[#1d1d1f]">CareerOS</p>
              </div>
            </Link>

            {/* Badges for small screens */}
            <div className="flex items-center gap-2 lg:hidden">
              <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0071e3]">
                <Sparkles className="mr-1 h-3 w-3" />
                Live AI
              </Badge>
            </div>
          </div>

          {/* Apple Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#f5f5f7] p-1.5 border border-border/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#0071e3] shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Badges */}
          <div className="hidden items-center gap-2.5 lg:flex">
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
