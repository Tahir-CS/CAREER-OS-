import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-black/5 bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111] text-[11px] font-bold text-white">CO</div>
              <span className="text-sm font-semibold text-[#111]">CareerOS</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#666]">
              A focused workspace for resume analysis, job matching, ATS review, and interview preparation.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#999]">Product</p>
            <div className="mt-4 grid gap-2 text-sm text-[#555]">
              <Link to="/app" className="hover:text-[#111]">Workspace</Link>
              <Link to="/keywords" className="hover:text-[#111]">ATS scanner</Link>
              <Link to="/interview" className="hover:text-[#111]">Interview prep</Link>
              <Link to="/history" className="hover:text-[#111]">History</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#999]">Project</p>
            <div className="mt-4 grid gap-2 text-sm text-[#555]">
              <Link to="/about" className="hover:text-[#111]">About</Link>
              <Link to="/support" className="hover:text-[#111]">Support</Link>
              <a
                href="https://github.com/Tahir-CS/CAREER-OS-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-[#111]"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/5 pt-6 text-xs text-[#888] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CareerOS</p>
          <p>Built as a practical career tooling project, not a marketing demo.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
