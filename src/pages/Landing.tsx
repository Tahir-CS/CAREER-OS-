import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUploader, { AnalyzePayload } from '../components/ResumeUploader';

const workflow = [
  {
    number: '01',
    title: 'Bring the role.',
    text: 'Paste the job description so every recommendation has a real target.',
  },
  {
    number: '02',
    title: 'See the mismatch.',
    text: 'Compare the resume with the role, including ATS signals, missing evidence, and weak positioning.',
  },
  {
    number: '03',
    title: 'Make the next move.',
    text: 'Turn the report into better bullets, a tighter application, and interview questions worth practising.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const handleDemoUpload = (_payload: AnalyzePayload) => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <Header />

      <main>
        <section className="bg-[#fbfbfd] px-5 pb-12 pt-16 text-center sm:pt-20 md:pb-16 md:pt-24">
          <div className="mx-auto max-w-[1080px]">
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#6e6e73]">CareerOS</p>
            <h1 className="mx-auto mt-4 max-w-[980px] text-[52px] font-semibold leading-[0.96] tracking-[-0.055em] text-[#1d1d1f] sm:text-[68px] md:text-[82px] lg:text-[92px]">
              Build a stronger application.
            </h1>
            <p className="mx-auto mt-6 max-w-[760px] text-[20px] font-normal leading-[1.25] tracking-[-0.025em] text-[#6e6e73] sm:text-[24px] md:text-[28px]">
              Match your resume to the role, fix what is weak, and walk into the interview knowing what to say.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/app"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 text-[14px] font-medium text-white transition hover:bg-[#343436]"
              >
                Open CareerOS <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/keywords"
                className="inline-flex h-11 items-center justify-center gap-1 text-[14px] font-medium text-[#1d1d1f] transition-opacity hover:opacity-60"
              >
                Explore ATS matching <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfbfd] px-4 pb-16 sm:px-6 md:pb-24">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-[#f5f5f7] sm:rounded-[36px]">
            <img
              src="/brand/careeros-product.svg"
              alt="CareerOS workspace showing a role-match report and revision plan"
              className="block h-auto w-full"
            />
          </div>
        </section>

        <section className="bg-white px-5 py-20 md:py-28">
          <div className="mx-auto max-w-[1080px]">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[14px] font-semibold text-[#6e6e73]">From resume to interview</p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#1d1d1f] sm:text-[52px] md:text-[64px]">
                One workflow. Three decisions.
              </h2>
              <p className="mx-auto mt-5 max-w-[670px] text-[18px] leading-7 tracking-[-0.02em] text-[#6e6e73] md:text-[20px]">
                CareerOS keeps the work connected, so the resume edit you make is tied to the role you want and the interview you are preparing for.
              </p>
            </div>

            <div className="mt-14 grid gap-10 border-t border-black/[0.08] pt-10 md:grid-cols-3 md:gap-12">
              {workflow.map((item) => (
                <div key={item.number}>
                  <p className="text-[12px] font-semibold text-[#86868b]">{item.number}</p>
                  <h3 className="mt-4 text-[24px] font-semibold tracking-[-0.035em] text-[#1d1d1f]">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-6 text-[#6e6e73]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-2 sm:gap-6">
            <article className="flex min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-[#1d1d1f] p-8 text-white sm:rounded-[36px] sm:p-10 md:min-h-[610px] md:p-12">
              <div>
                <p className="text-[14px] font-semibold text-[#a1a1a6]">Role match</p>
                <h2 className="mt-3 max-w-[520px] text-[38px] font-semibold leading-[1.03] tracking-[-0.05em] text-white sm:text-[48px] md:text-[56px]">
                  See the gap before a recruiter does.
                </h2>
                <p className="mt-5 max-w-[470px] text-[17px] leading-7 text-[#c7c7cc]">
                  Separate what your resume already proves from what the role still needs to see. No decorative score wall. Just evidence and next actions.
                </p>
              </div>

              <div className="mt-auto pt-12">
                <div className="rounded-[24px] bg-white/[0.07] p-6 ring-1 ring-white/[0.08]">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-semibold text-[#a1a1a6]">NEXT REVISION</p>
                      <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white">Make ownership explicit.</p>
                    </div>
                    <span className="text-[44px] font-semibold tracking-[-0.05em] text-white">86</span>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[86%] rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </article>

            <article className="flex min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-white p-8 ring-1 ring-black/[0.05] sm:rounded-[36px] sm:p-10 md:min-h-[610px] md:p-12">
              <div>
                <p className="text-[14px] font-semibold text-[#6e6e73]">Interview practice</p>
                <h2 className="mt-3 max-w-[520px] text-[38px] font-semibold leading-[1.03] tracking-[-0.05em] text-[#1d1d1f] sm:text-[48px] md:text-[56px]">
                  Practise the questions your gaps create.
                </h2>
                <p className="mt-5 max-w-[470px] text-[17px] leading-7 text-[#6e6e73]">
                  Move from the report into focused practice by voice or text. The interview room stays tied to the same application instead of starting another generic chat.
                </p>
              </div>

              <div className="mt-auto pt-12">
                <div className="rounded-[24px] bg-[#f5f5f7] p-6">
                  <p className="text-[12px] font-semibold text-[#86868b]">PRACTICE PROMPT</p>
                  <p className="mt-3 text-[20px] font-semibold leading-7 tracking-[-0.025em] text-[#1d1d1f]">
                    “Tell me about a system you owned from design through production.”
                  </p>
                  <div className="mt-6 flex gap-1.5" aria-hidden="true">
                    {[18, 30, 44, 26, 52, 36, 22, 46, 32, 16, 38, 28].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className="w-1.5 rounded-full bg-[#1d1d1f]"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white px-5 py-20 md:py-28">
          <div className="mx-auto max-w-[980px]">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="text-[14px] font-semibold text-[#6e6e73]">Use your own material</p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#1d1d1f] sm:text-[52px] md:text-[64px]">
                Start with the resume you are actually sending.
              </h2>
              <p className="mx-auto mt-5 max-w-[650px] text-[18px] leading-7 tracking-[-0.02em] text-[#6e6e73]">
                Add the target job description when you have it. The pair gives CareerOS enough context to make the work role-specific.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-[28px] bg-[#f5f5f7] p-3 sm:rounded-[34px] sm:p-4">
              <ResumeUploader onAnalyze={handleDemoUpload} />
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto flex min-h-[430px] max-w-[1280px] items-center justify-center rounded-[28px] bg-white px-6 py-16 text-center ring-1 ring-black/[0.04] sm:rounded-[36px] md:min-h-[500px]">
            <div className="max-w-[820px]">
              <p className="text-[14px] font-semibold text-[#6e6e73]">CareerOS</p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[1.01] tracking-[-0.055em] text-[#1d1d1f] sm:text-[56px] md:text-[68px]">
                Leave with a better application, not another chat transcript.
              </h2>
              <Link
                to="/app"
                className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 text-[14px] font-medium text-white transition hover:bg-[#343436]"
              >
                Open the workspace <ArrowRight className="h-4 w-4" />
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
