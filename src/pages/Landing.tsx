import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, FileSearch, MessageSquareText, Mic2, Search, Shield, Upload } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUploader, { AnalyzePayload } from '../components/ResumeUploader';

const capabilities = [
  {
    number: '01',
    title: 'Resume and job matching',
    text: 'Compare a resume against a target role, surface gaps, and get a relevance score based on the content of both documents.',
  },
  {
    number: '02',
    title: 'ATS review',
    text: 'Inspect keyword coverage, formatting risks, missing skills, and other signals that can affect an applicant tracking system scan.',
  },
  {
    number: '03',
    title: 'Interview preparation',
    text: 'Generate role-aware questions, practise spoken answers, and review responses against a structured STAR-style checklist.',
  },
  {
    number: '04',
    title: 'Progress history',
    text: 'Keep previous analyses in one place so you can compare revisions instead of losing each result after a single session.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const handleDemoUpload = (_payload: AnalyzePayload) => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111]">
      <Header />

      <main>
        <section className="border-b border-black/5">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7a7a75]">
                <span className="h-px w-8 bg-[#aaa]" />
                Career intelligence workspace
              </div>

              <h1 className="max-w-4xl text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#111] sm:text-[64px] lg:text-[78px]">
                Make your application fit the role before you send it.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5d5d58] md:text-xl">
                CareerOS brings resume analysis, job matching, ATS review, and interview preparation into one practical workspace.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/app"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#111] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
                >
                  Analyze a resume <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/interview"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-black/10 bg-white px-5 text-sm font-semibold text-[#222] transition hover:bg-[#f0f0ed]"
                >
                  Try interview prep
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {['PDF and DOCX input', 'Role-specific analysis', 'Saved analysis history'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#666]">
                    <Check className="h-4 w-4 text-[#222]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-black/10 bg-[#151515] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
                <div className="rounded-xl bg-[#fbfbf9] p-5 md:p-6">
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#999]">Analysis / Senior frontend engineer</p>
                      <p className="mt-1 text-sm font-semibold text-[#222]">Resume fit overview</p>
                    </div>
                    <span className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-[#555]">Report</span>
                  </div>

                  <div className="grid gap-4 py-5 sm:grid-cols-[130px_1fr]">
                    <div className="rounded-xl border border-black/5 bg-white p-4">
                      <p className="text-xs text-[#888]">Match score</p>
                      <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#111]">78</p>
                      <p className="mt-1 text-xs text-[#777]">out of 100</p>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-white p-4">
                      <div className="flex items-center justify-between text-xs text-[#777]">
                        <span>Keyword coverage</span>
                        <span>14 / 18</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ecece8]">
                        <div className="h-full w-[78%] rounded-full bg-[#222]" />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <span className="rounded-md bg-[#f1f1ee] px-2.5 py-2 text-[#555]">React</span>
                        <span className="rounded-md bg-[#f1f1ee] px-2.5 py-2 text-[#555]">TypeScript</span>
                        <span className="rounded-md bg-[#f1f1ee] px-2.5 py-2 text-[#555]">Accessibility</span>
                        <span className="rounded-md bg-[#fff1c2] px-2.5 py-2 text-[#6b5215]">Testing gap</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-black/5 bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#999]">Strong signal</p>
                      <p className="mt-2 text-sm font-medium text-[#222]">Relevant frontend ownership</p>
                      <p className="mt-1 text-xs leading-5 text-[#777]">Experience maps clearly to the role's product delivery requirements.</p>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#999]">Next fix</p>
                      <p className="mt-2 text-sm font-medium text-[#222]">Add measurable test coverage</p>
                      <p className="mt-1 text-xs leading-5 text-[#777]">The job asks for testing depth that is not explicit in the resume.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-lg border border-black/10 bg-[#ffe08a] px-4 py-3 text-xs font-medium text-[#413514] shadow-sm md:block">
                Built around the actual workflow, not AI theatre.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a8a84]">What it does</p>
              <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-5xl">
                Four tools, one application workflow.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#666]">
                The product is organised around the decisions a job seeker actually makes: what to change, what is missing, and what to practise next.
              </p>
            </div>

            <div className="border-t border-black/10">
              {capabilities.map((item) => (
                <div key={item.number} className="grid gap-4 border-b border-black/10 py-7 sm:grid-cols-[64px_220px_1fr] sm:items-start">
                  <span className="font-mono text-xs text-[#999]">{item.number}</span>
                  <h3 className="text-lg font-semibold tracking-[-0.025em] text-[#222]">{item.title}</h3>
                  <p className="max-w-xl text-sm leading-6 text-[#666]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-[#111] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">Workflow</p>
                <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white md:text-5xl">
                  From job post to better application in three steps.
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Upload, title: 'Upload', text: 'Add a resume and, if you have one, the job description.' },
                  { icon: Search, title: 'Review', text: 'Inspect match, ATS gaps, missing keywords, and suggested changes.' },
                  { icon: MessageSquareText, title: 'Prepare', text: 'Use the same role context to practise likely interview questions.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                    <Icon className="h-5 w-5 text-white/70" />
                    <h3 className="mt-7 text-base font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a8a84]">Try it</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-5xl">
                Start with your actual resume.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#666]">
                Uploading here takes you into the full workspace, where the analysis and revision tools live.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-[#555]">
                <div className="flex items-start gap-3">
                  <FileSearch className="mt-0.5 h-4 w-4 text-[#222]" />
                  <span>Resume parsing and role comparison</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mic2 className="mt-0.5 h-4 w-4 text-[#222]" />
                  <span>Browser-based voice practice</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-4 w-4 text-[#222]" />
                  <span>No fake usage counters or invented customer logos</span>
                </div>
              </div>
            </div>

            <ResumeUploader onAnalyze={handleDemoUpload} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
          <div className="rounded-2xl border border-black/10 bg-[#ffe08a] px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6f5b20]">Built for iteration</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#1b180f] md:text-4xl">
                  Get a clearer answer to one question: what should I change before I apply?
                </h2>
              </div>
              <Link
                to="/app"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111] px-5 text-sm font-semibold text-white hover:bg-[#2a2a2a]"
              >
                Open CareerOS <ArrowRight className="h-4 w-4" />
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
