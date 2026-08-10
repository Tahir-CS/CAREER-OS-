import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, FileText, Sparkles, LayoutDashboard, History, Mic, Search, Settings, Info, LifeBuoy, Rocket } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/app', label: 'Workspace', icon: LayoutDashboard },
    { path: '/interview', label: 'Mock Interview', icon: Mic },
    { path: '/keywords', label: 'ATS Scanner', icon: Search },
    { path: '/history', label: 'History', icon: History },
    { path: '/about', label: 'About', icon: Info },
    { path: '/support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <header className="container mx-auto px-4 py-4 md:py-6">
      <nav className="apple-card px-5 py-4 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Logo & Title */}
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

            {/* Launch App Button for mobile */}
            <Link to="/app" className="lg:hidden">
              <Button size="sm" className="apple-button px-4 text-xs">
                Launch App
              </Button>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-[#f5f5f7] p-1.5 border border-border/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#0071e3] shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/settings" className="text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f]">
              <Settings className="h-4 w-4" />
            </Link>
            <Link to="/app">
              <Button className="apple-button h-10 px-5 text-xs font-semibold">
                <Rocket className="mr-1.5 h-3.5 w-3.5" /> Launch Workspace
              </Button>
            </Link>
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Header;
