import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/app', label: 'Workspace' },
    { path: '/keywords', label: 'ATS' },
    { path: '/interview', label: 'Interview' },
    { path: '/history', label: 'History' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fbfbfd]/78 text-[#1d1d1f] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#fbfbfd]/72">
      <div className="mx-auto flex h-11 max-w-[1024px] items-center px-5 md:px-6">
        <Link
          to="/"
          className="shrink-0 text-[14px] font-semibold tracking-[-0.025em] text-[#1d1d1f] transition-opacity hover:opacity-60"
          aria-label="CareerOS home"
        >
          CareerOS
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[12px] tracking-[-0.01em] transition-colors ${
                  active ? 'font-medium text-[#1d1d1f]' : 'font-normal text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-5 md:flex">
          <Link
            to="/settings"
            className={`text-[12px] transition-colors ${
              location.pathname === '/settings' ? 'font-medium text-[#1d1d1f]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Settings
          </Link>
          <Link
            to="/app"
            className="inline-flex h-7 items-center rounded-full bg-[#1d1d1f] px-3.5 text-[12px] font-medium text-white transition hover:bg-[#343436]"
          >
            Open app
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center text-[#1d1d1f] md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/[0.05] bg-[#fbfbfd] px-5 pb-7 pt-4 md:hidden">
          <nav className="mx-auto max-w-[1024px]" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="block border-b border-black/[0.06] py-3 text-[20px] font-semibold tracking-[-0.03em] text-[#1d1d1f]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="block border-b border-black/[0.06] py-3 text-[20px] font-semibold tracking-[-0.03em] text-[#1d1d1f]"
            >
              Settings
            </Link>
            <Link
              to="/app"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex h-9 items-center rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white"
            >
              Open app
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
