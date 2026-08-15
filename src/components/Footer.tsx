import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-black/[0.08] bg-[#f5f5f7]">
      <div className="mx-auto max-w-[1080px] px-5 py-10 md:px-6">
        <div className="grid gap-9 md:grid-cols-[1.45fr_0.8fr_0.8fr]">
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">CareerOS</p>
            <p className="mt-3 max-w-md text-[13px] leading-6 text-[#6e6e73]">
              Resume analysis, role matching, ATS review, and interview practice in one focused workspace.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-[#1d1d1f]">Product</p>
            <div className="mt-3 grid gap-2 text-[12px] text-[#6e6e73]">
              <Link to="/app" className="hover:text-[#1d1d1f]">Workspace</Link>
              <Link to="/keywords" className="hover:text-[#1d1d1f]">ATS</Link>
              <Link to="/interview" className="hover:text-[#1d1d1f]">Interview</Link>
              <Link to="/history" className="hover:text-[#1d1d1f]">History</Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-[#1d1d1f]">Project</p>
            <div className="mt-3 grid gap-2 text-[12px] text-[#6e6e73]">
              <Link to="/about" className="hover:text-[#1d1d1f]">About</Link>
              <Link to="/support" className="hover:text-[#1d1d1f]">Support</Link>
              <a
                href="https://github.com/Tahir-CS/CAREER-OS-"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#1d1d1f]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-black/[0.07] pt-5 text-[11px] text-[#86868b]">
          © {new Date().getFullYear()} CareerOS
        </div>
      </div>
    </footer>
  );
};

export default Footer;
