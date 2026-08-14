import { Link, useLocation } from 'react-router-dom';
import { Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/app', label: 'Workspace', code: '01' },
    { path: '/keywords', label: 'ATS scan', code: '02' },
    { path: '/interview', label: 'Interview', code: '03' },
    { path: '/history', label: 'History', code: '04' },
    { path: '/about', label: 'About', code: '05' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#173f35] text-[#f8f5ed]">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-3.5" aria-label="CareerOS home">
          <img src="/brand/careeros-mark.svg" alt="" className="h-9 w-9" />
          <div className="leading-none">
            <div className="flex items-baseline gap-2">
              <span className="text-[16px] font-semibold tracking-[-0.025em] text-[#f8f5ed]">CareerOS</span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-[#9eb5ac] sm:inline">Job search workbench</span>
            </div>
            <span className="mt-1 hidden text-[10px] text-[#9eb5ac] lg:block">Resume → role fit → interview readiness</span>
          </div>
        </Link>

        <nav className="hidden h-full items-center md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex h-full items-center gap-2 px-3.5 text-[13px] transition-colors ${
                  active ? 'text-white' : 'text-[#b9c8c2] hover:text-white'
                }`}
              >
                <span className={`font-mono text-[9px] ${active ? 'text-[#f0a58a]' : 'text-[#78948a]'}`}>{item.code}</span>
                <span>{item.label}</span>
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] bg-[#e86e45]" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/settings"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
              location.pathname === '/settings'
                ? 'border-[#e86e45] bg-[#e86e45] text-[#17201d]'
                : 'border-white/15 text-[#c4d0cb] hover:border-white/30 hover:text-white'
            }`}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/app"
            className="inline-flex h-9 items-center rounded-md bg-[#f3f0e7] px-4 text-[13px] font-semibold text-[#173f35] transition hover:bg-white"
          >
            Analyze resume
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-[#f8f5ed] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#173f35] px-5 pb-5 pt-3 md:hidden">
          <div className="mx-auto grid max-w-7xl">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 border-b border-white/10 px-1 py-3 text-sm ${active ? 'text-white' : 'text-[#b9c8c2]'}`}
                >
                  <span className="font-mono text-[10px] text-[#e99a7e]">{item.code}</span>
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 text-sm text-[#f8f5ed]"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#f3f0e7] px-4 text-sm font-semibold text-[#173f35]"
              >
                Analyze resume
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
