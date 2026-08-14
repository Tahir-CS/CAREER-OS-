import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowUpRight } from 'lucide-react';

const stack = [
  ['01', 'React + Vite', 'The client application and browser-side interaction layer.'],
  ['02', 'Express API', 'Accepts uploads, creates jobs, and serves completed feedback.'],
  ['03', 'Redis + BullMQ', 'Moves document analysis out of the request path and into background workers.'],
  ['04', 'MinIO object storage', 'Keeps uploaded resume files outside the application container filesystem.'],
  ['05', 'PostgreSQL + pgvector', 'Stores report data and supports vector similarity for role matching.'],
  ['06', 'Browser speech APIs', 'Provides microphone transcription and spoken question playback when supported.'],
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main>
        <section className="border-b border-[#d2cabb]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="rule-label">About / 05</p>
              <h1 className="display-serif mt-4 max-w-2xl text-5xl leading-[0.98] md:text-7xl">A job-search tool with an inspectable system behind it.</h1>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-xl text-base leading-7 text-[#59615c]">
                CareerOS is built as a real application pipeline: documents are uploaded, queued, processed by workers, stored, and returned as structured reports. The interface is only the front end of that workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d2cabb] bg-[#173f35] text-[#f8f5ed]">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e99a7e]">System path</p>
                <h2 className="display-serif mt-4 text-4xl leading-[1.02] text-[#f8f5ed] md:text-5xl">One request moves through six clear layers.</h2>
              </div>

              <div className="grid border-l border-t border-white/15 sm:grid-cols-2 lg:grid-cols-3">
                {stack.map(([number, title, text]) => (
                  <div key={number} className="min-h-[190px] border-b border-r border-white/15 p-5">
                    <span className="font-mono text-[10px] text-[#e99a7e]">{number}</span>
                    <h3 className="mt-7 text-base font-semibold text-[#f8f5ed]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#afc0b9]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="eyebrow">Design principles</p>
              <h2 className="display-serif mt-4 max-w-md text-4xl leading-[1.02] md:text-5xl">What the product should optimise for.</h2>
            </div>

            <div className="border-t border-[#d2cabb]">
              {[
                ['Useful before impressive', 'Every screen should help the user make a concrete application decision before it tries to explain the technology.'],
                ['Specific before magical', 'Role fit, ATS coverage, and interview feedback should point to evidence the user can inspect and change.'],
                ['Asynchronous where it matters', 'Document processing does not belong in a long blocking HTTP request, so the app uses queued background work and live status updates.'],
                ['Local context when possible', 'Preferences and report history can stay in the browser for a lightweight workflow without pretending there is a full account system when there is not.'],
              ].map(([title, text], index) => (
                <div key={title} className="grid gap-4 border-b border-[#d2cabb] py-6 sm:grid-cols-[54px_220px_1fr]">
                  <span className="font-mono text-xs text-[#b84f31]">0{index + 1}</span>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="text-sm leading-6 text-[#59615c]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#d2cabb] bg-[#e9e4d8]">
          <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">Source</p>
                <h2 className="mt-2 text-xl font-semibold">Inspect the implementation, not just the marketing page.</h2>
                <p className="mt-1 text-sm text-[#59615c]">The repository contains the frontend, backend, deployment configuration, and project documentation.</p>
              </div>
              <a
                href="https://github.com/Tahir-CS/CAREER-OS-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#173f35] px-4 text-sm font-semibold text-[#f8f5ed]"
              >
                Open repository <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
