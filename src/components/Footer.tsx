import { Link } from 'react-router-dom';
import { Github, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[#d2cabb] bg-[#e9e4d8]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/brand/careeros-mark.svg" alt="" className="h-10 w-10" />
              <div>
                <p className="text-base font-semibold tracking-[-0.02em] text-[#17201d]">CareerOS</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#72776f]">Job search workbench</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#59615c]">
              A focused workspace for turning a job description and a resume into a concrete revision and interview plan.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7b7d76]">Workflows</p>
            <div className="mt-4 grid gap-2.5 text-sm text-[#3e4742]">
              <Link to="/app" className="hover:text-[#173f35]">Resume workspace</Link>
              <Link to="/keywords" className="hover:text-[#173f35]">ATS scan</Link>
              <Link to="/interview" className="hover:text-[#173f35]">Interview practice</Link>
              <Link to="/history" className="hover:text-[#173f35]">Revision history</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7b7d76]">Project</p>
            <div className="mt-4 grid gap-2.5 text-sm text-[#3e4742]">
              <Link to="/about" className="hover:text-[#173f35]">How it works</Link>
              <Link to="/support" className="hover:text-[#173f35]">Support</Link>
              <a
                href="https://github.com/Tahir-CS/CAREER-OS-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#173f35]"
              >
                GitHub <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#d2cabb] pt-6 text-xs text-[#73776f] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CareerOS</p>
          <a
            href="https://github.com/Tahir-CS/CAREER-OS-"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#173f35]"
          >
            <Github className="h-3.5 w-3.5" /> Open-source project
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
