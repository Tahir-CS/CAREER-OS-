import { Link, useLocation } from 'react-router-dom';
import { Menu, Settings } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/app', label: 'Workspace' },
    { path: '/keywords', label: 'ATS scanner' },
    { path: '/interview', label: 'Interview prep' },
    { path: '/history', label: 'History' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f7f5]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="CareerOS home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111] text-[11px] font-bold tracking-tight text-white">
            CO
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#111]">CareerOS</span>
            <span className="hidden text-xs text-[#777] sm:inline">Career intelligence workspace</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-black/[0.05] font-medium text-[#111]' : 'text-[#666] hover:bg-black/[0.035] hover:text-[#111]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#666] transition hover:bg-black/[0.04] hover:text-[#111]"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/app"
            className="inline-flex h-9 items-center rounded-md bg-[#111] px-4 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            Open workspace
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#333] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-[#f7f7f5] px-5 py-3 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-[#333] hover:bg-black/[0.04]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/app"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-[#111] px-4 text-sm font-medium text-white"
            >
              Open workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
