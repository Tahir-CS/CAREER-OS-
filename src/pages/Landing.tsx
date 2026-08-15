import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Search, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUploader, { AnalyzePayload } from '../components/ResumeUploader';

const workflow = [
  {
    number: '01',
    title: 'Upload your resume.',
    text: 'CareerOS extracts the roles, skills, seniority, and evidence your document can actually support.',
  },
  {
    number: '02',
    title: 'See live jobs worth your time.',
    text: 'Openings are ranked against resume evidence so the feed is about fit, not just matching a job-title keyword.',
  },
  {
    number: '03',
    title: 'Prepare the application.',
    text: 'Choose a role and CareerOS reuses the same resume to build a role-specific gap report and interview handoff.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const handleUpload = (payload: AnalyzePayload) => {
    navigate('/app', { state: { initialUpload: payload } });
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <Header />

      <main>
        <section className="bg-[#fbfbfd] px-5 pb-12 pt-16 text-center sm:pt-20 md:pb-16 md:pt-24">
          <div className="mx-auto max-w-[1080px]">
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#6e6e73]">CareerOS</p>
            <h1 className="mx-auto mt-4 max-w-[1020px] text-[52px] font-semibold leading-[0.94] tracking-[-0.058em] sm:text-[68px] md:text-[84px] lg:text-[96px]">
              Upload your resume. Find jobs that fit.
            </h1>
            <p className="mx-auto mt-6 max-w-[780px] text-[20px] font-normal leading-[1.28] tracking-[-0.025em] text-[#6e6e73] sm:text-[24px] md:text-[28px]">
              CareerOS turns your experience into a search profile, finds live openings, and shows why each role is — or is not — supported by your resume.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/app"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-7 text-[14px] font-medium text-white transition hover:bg-[#343436]"
              >
                Find my matches <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex h-12 items-center justify-center text-[14px] font-medium text-[#1d1d1f] transition-opacity hover:opacity-60"
              >
                I already have a job description
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfbfd] px-4 pb-16 sm:px-6 md:pb-24">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-[#f5f5f7] sm:rounded-[38px]">
            <img
              src="/brand/careeros-job-matches.svg"
              alt="Illustration of the CareerOS job matching interface with evidence-backed role cards"
              className="block h-auto w-full"
            />
          </div>
        </section>

        <section className="bg-white px-5 py-20 md:py-28">
          <div className="mx-auto max-w-[1080px]">
            <div className="mx-auto max-w-[850px] text-center">
              <p className="text-[14px] font-semibold text-[#6e6e73]">From one document to a real search</p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[52px] md:text-[64px]">
                The resume is the starting point. Not the product.
              </h2>
              <p className="mx-auto mt-5 max-w-[700px] text-[18px] leading-7 tracking-[-0.02em] text-[#6e6e73] md:text-[20px]">
                You should not have to hunt for a role, copy its description into another tool, and then start from zero. CareerOS keeps discovery and preparation in one flow.
              </p>
            </div>

            <div className="mt-14 grid gap-10 border-t border-black/[0.08] pt-10 md:grid-cols-3 md:gap-12">
              {workflow.map((item) => (
                <div key={item.number}>
                  <p className="text-[12px] font-semibold text-[#86868b]">{item.number}</p>
                  <h3 className="mt-4 text-[24px] font-semibold tracking-[-0.035em]">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-6 text-[#6e6e73]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-2 sm:gap-6">
            <article className="flex min-h-[520px] flex-col rounded-[28px] bg-[#1d1d1f] p-8 text-white sm:rounded-[36px] sm:p-10 md:min-h-[600px] md:p-12">
              <div>
                <Search className="h-5 w-5 text-[#a1a1a6]" />
                <p className="mt-5 text-[14px] font-semibold text-[#a1a1a6]">Job discovery</p>
                <h2 className="mt-3 max-w-[520px] text-[40px] font-semibold leading-[1.03] tracking-[-0.05em] text-white sm:text-[50px] md:text-[58px]">
                  Search from what you have actually done.
                </h2>
                <p className="mt-5 max-w-[500px] text-[17px] leading-7 text-[#c7c7cc]">
                  CareerOS uses realistic target roles and evidenced skills from your resume to retrieve live openings. Low-signal listings do not get padded into the feed just to make it look busy.
                </p>
              </div>

              <div className="mt-auto pt-12">
                <div className="rounded-[24px] bg-white/[0.07] p-6 ring-1 ring-white/[0.08]">
                  <p className="text-[12px] font-semibold text-[#a1a1a6]">WHY THIS ROLE</p>
                  <div className="mt-4 space-y-3 text-sm text-white">
                    <p className="flex items-center gap-2"><Check className="h-4 w-4" /> Node.js appears in your work history.</p>
                    <p className="flex items-center gap-2"><Check className="h-4 w-4" /> PostgreSQL is demonstrated in a project.</p>
                    <p className="text-[#a1a1a6]">Needs evidence: Kubernetes</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="flex min-h-[520px] flex-col rounded-[28px] bg-white p-8 ring-1 ring-black/[0.05] sm:rounded-[36px] sm:p-10 md:min-h-[600px] md:p-12">
              <div>
                <Sparkles className="h-5 w-5 text-[#6e6e73]" />
                <p className="mt-5 text-[14px] font-semibold text-[#6e6e73]">Application handoff</p>
                <h2 className="mt-3 max-w-[520px] text-[40px] font-semibold leading-[1.03] tracking-[-0.05em] sm:text-[50px] md:text-[58px]">
                  Pick a job. Keep your resume in context.
                </h2>
                <p className="mt-5 max-w-[500px] text-[17px] leading-7 text-[#6e6e73]">
                  Preparing an application should not mean uploading everything again. CareerOS reuses the stored resume and compares it directly with the selected live listing.
                </p>
              </div>

              <div className="mt-auto pt-12">
                <div className="rounded-[24px] bg-[#f5f5f7] p-6">
                  <p className="text-[12px] font-semibold text-[#86868b]">ONE CONTINUOUS WORKFLOW</p>
                  <p className="mt-3 text-[21px] font-semibold leading-8 tracking-[-0.03em]">Resume → matching jobs → application report → interview practice.</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white px-5 py-20 md:py-28">
          <div className="mx-auto max-w-[900px]">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="text-[14px] font-semibold text-[#6e6e73]">Try the actual flow</p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[52px] md:text-[64px]">
                Your resume in. Relevant jobs out.
              </h2>
              <p className="mx-auto mt-5 max-w-[650px] text-[18px] leading-7 tracking-[-0.02em] text-[#6e6e73]">
                A job description is optional. Add one only when you already know which role you want to analyze.
              </p>
            </div>

            <div className="mt-12 rounded-[32px] bg-[#f5f5f7] p-3 sm:p-4">
              <ResumeUploader onAnalyze={handleUpload} />
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto flex min-h-[430px] max-w-[1280px] items-center justify-center rounded-[28px] bg-white px-6 py-16 text-center ring-1 ring-black/[0.04] sm:rounded-[36px] md:min-h-[500px]">
            <div className="max-w-[840px]">
              <p className="text-[14px] font-semibold text-[#6e6e73]">CareerOS</p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[1.01] tracking-[-0.055em] sm:text-[56px] md:text-[68px]">
                Spend your time applying to the right jobs, not searching for them twice.
              </h2>
              <Link
                to="/app"
                className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 text-[14px] font-medium text-white transition hover:bg-[#343436]"
              >
                Upload your resume <ArrowRight className="h-4 w-4" />
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
