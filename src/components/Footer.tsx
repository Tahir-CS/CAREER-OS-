import { Link } from 'react-router-dom';
import { FileText, Github, Twitter, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-8 mt-16">
      <div className="apple-card p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-5 border-b border-border/70 pb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/25 font-bold">
                <FileText className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">CareerOS</span>
            </Link>
            <p className="text-sm text-[#86868b] max-w-sm leading-relaxed">
              Enterprise-grade AI Career Intelligence Platform. Accelerate candidate hiring velocity with vector embeddings, ATS keyword analysis, and zero-cost live voice interview practice.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-full bg-[#34c759]/10 px-3 py-1 text-xs font-semibold text-[#34c759]">
                <span className="h-2 w-2 rounded-full bg-[#34c759] animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="chip-mono text-xs uppercase font-bold text-[#1d1d1f]">Product Suite</p>
            <ul className="space-y-2 text-sm text-[#86868b]">
              <li><Link to="/app" className="hover:text-[#0071e3] transition-colors">Analyzer Workspace</Link></li>
              <li><Link to="/interview" className="hover:text-[#0071e3] transition-colors">Live Voice Interviewer</Link></li>
              <li><Link to="/keywords" className="hover:text-[#0071e3] transition-colors">ATS Keyword Scanner</Link></li>
              <li><Link to="/history" className="hover:text-[#0071e3] transition-colors">Analysis History</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <p className="chip-mono text-xs uppercase font-bold text-[#1d1d1f]">Company</p>
            <ul className="space-y-2 text-sm text-[#86868b]">
              <li><Link to="/about" className="hover:text-[#0071e3] transition-colors">About &amp; Architecture</Link></li>
              <li><Link to="/support" className="hover:text-[#0071e3] transition-colors">Support Center</Link></li>
              <li><a href="/careeros_master_handbook.html" target="_blank" rel="noreferrer" className="hover:text-[#0071e3] transition-colors">Developer Spec Handbook</a></li>
              <li><Link to="/settings" className="hover:text-[#0071e3] transition-colors">Candidate Settings</Link></li>
            </ul>
          </div>

          {/* Connect & Legal */}
          <div className="space-y-3">
            <p className="chip-mono text-xs uppercase font-bold text-[#1d1d1f]">Connect &amp; Trust</p>
            <div className="flex gap-3 text-[#86868b]">
              <a href="https://github.com/Tahir-CS/CAREER-OS-" target="_blank" rel="noreferrer" className="hover:text-[#0071e3]">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#0071e3]">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <div className="pt-2 text-xs text-[#86868b]">
              <p className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-[#34c759]" /> Enterprise Encryption</p>
              <p className="mt-1">GDPR &amp; SOC2 Compliant</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[#86868b]">
          <p>© {new Date().getFullYear()} CareerOS Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/support" className="hover:underline">Privacy Policy</Link>
            <Link to="/support" className="hover:underline">Terms of Service</Link>
            <Link to="/support" className="hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
