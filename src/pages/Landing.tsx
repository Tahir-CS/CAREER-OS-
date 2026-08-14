import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CornerDownRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUploader, { AnalyzePayload } from '../components/ResumeUploader';

const workflow = [
  {
    number: '01',
    title: 'Read the role',
    text: 'Pull the requirements, skills, and language that actually matter from the job description.',
  },
  {
    number: '02',
    title: 'Read your resume',
    text: 'Check what is explicit, what is weakly evidenced, and what is missing before an ATS or recruiter sees it.',
  },
  {
    number: '03',
    title: 'Close the gap',
    text: 'Turn the mismatch into specific edits, stronger bullets, and questions worth practising before the interview.',
  },
];

const tools = [
  ['Resume workspace', 'Upload a resume, add a target role, and get one working report instead of disconnected AI chats.'],
  ['ATS scan', 'Compare keyword coverage and missing role signals without rewriting your resume into keyword soup.'],
  ['Interview room', 'Practise role-aware questions by voice or text and review each answer against a repeatable structure.'],
  ['Revision history', 'Keep previous runs so you can see whether the resume is actually getting better.'],
];

const Landing = () => {
  const navigate = useNavigate();

  const handleDemoUpload = (_payload: AnalyzePayload) => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main>
        <section className="border-b border-[#d2cabb]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="rule-label">CareerOS / application workbench</div>
              <h1 className="display-serif mt-7 text-[52px] leading-[0.96] text-[#17201d] sm:text-[68px] lg:text-[78px]">
                Make the resume fit the work, not the algorithm.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#59615c]">
                CareerOS compares your resume with the role you want, shows the mismatch, and turns it into a practical revision and interview plan.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/app"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#173f35] px-5 text-sm font-semibold text-[#f8f5ed] transition hover:bg-[#225a4b]"
                >
                  Start with a resume <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/keywords"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[#c9c1b2] bg-[#faf8f2] px-5 text-sm font-semibold text-[#17201d] transition hover:bg-[#e9e4d8]"
                >
                  Scan a job description
                </Link>
              </div>

              <div className="mt-9 grid gap-2.5 text-sm text-[#59615c]">
                {['PDF and DOCX resumes', 'Role-specific analysis', 'Saved locally between revisions'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#8ea49b] bg-[#e6eee9] text-[#173f35]">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-4">
              <img
                src="/brand/workflow-board.svg"
                alt="CareerOS report board showing a resume, role match score, and next actions"
                className="w-full"
              />
              <div className="absolute -bottom-3 right-5 hidden border border-[#b9ae9c] bg-[#f3f0e7] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#59615c] md:block">
                One report · clear next move
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d2cabb] bg-[#e9e4d8]">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="eyebrow">How the work moves</p>
                <h2 className="display-serif mt-4 max-w-md text-4xl leading-[1.02] md:text-5xl">
                  Three passes. No prompt engineering required.
                </h2>
              </div>

              <div className="border-t border-[#c8c0b1]">
                {workflow.map((item) => (
                  <div key={item.number} className="grid gap-4 border-b border-[#c8c0b1] py-6 sm:grid-cols-[56px_180px_1fr]">
                    <span className="font-mono text-xs text-[#b84f31]">{item.number}</span>
                    <h3 className="text-base font-semibold tracking-[-0.02em]">{item.title}</h3>
                    <p className="max-w-xl text-sm leading-6 text-[#59615c]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d2cabb] bg-[#173f35] text-[#f8f5ed]">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#93aaa1]">Inside the workbench</p>
                <h2 className="display-serif mt-4 max-w-lg text-4xl leading-[1.02] text-[#f8f5ed] md:text-5xl">
                  The product is organised by decisions, not AI features.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-6 text-[#b9c8c2]">
                  You should always know what page you are on, what input it needs, and what action the result is meant to support.
                </p>
              </div>

              <div className="grid border-l border-t border-white/15 sm:grid-cols-2">
                {tools.map(([title, text], index) => (
                  <div key={title} className="min-h-[180px] border-b border-r border-white/15 p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#e99a7e]">0{index + 1}</span>
                      <CornerDownRight className="h-4 w-4 text-[#78948a]" />
                    </div>
                    <h3 className="mt-8 text-base font-semibold text-[#f8f5ed]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#aebfb8]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="eyebrow">Use your own material</p>
              <h2 className="display-serif mt-4 max-w-md text-4xl leading-[1.02] md:text-5xl">
                Start with the document you are actually sending.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#59615c]">
                Add the target job description when you have it. CareerOS uses the pair to make the report role-specific instead of giving generic resume advice.
              </p>
              <div className="mt-8 border-l-2 border-[#e86e45] pl-4 text-sm leading-6 text-[#59615c]">
                The landing uploader moves you into the workspace. Your analysis and revision tools live there.
              </div>
            </div>

            <ResumeUploader onAnalyze={handleDemoUpload} />
          </div>
        </section>

        <section className="border-t border-[#d2cabb]">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-6 bg-[#e86e45] p-7 md:grid-cols-[1fr_auto] md:items-end md:p-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f2f20]">The point of the product</p>
                <h2 className="display-serif mt-3 max-w-3xl text-3xl leading-[1.04] text-[#17201d] md:text-4xl">
                  Leave with a better application, not another chat transcript.
                </h2>
              </div>
              <Link
                to="/app"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#17201d] px-5 text-sm font-semibold text-[#f8f5ed]"
              >
                Open the workbench <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
