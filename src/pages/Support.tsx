import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const helpItems = [
  ['Resume upload fails', 'Check that the file is PDF or DOCX and below 5 MB. If the API is unavailable, the workspace will show the upload error returned by the server.'],
  ['Analysis stays queued', 'Keep the workspace open for live updates. A queued job depends on the Redis/BullMQ worker being online and connected to the same backend environment.'],
  ['Voice input does not start', 'Speech recognition support varies by browser. You can always type the answer in Interview Prep when microphone transcription is unavailable.'],
  ['History looks empty', 'Revision history is stored in localStorage in the current browser. Clearing site data, private browsing, or changing devices creates a separate history.'],
  ['PDF export is unavailable', 'Exports require a completed feedback ID from the backend. Re-run the analysis if the report was loaded only from local history.'],
];

const Support = () => {
  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main>
        <section className="border-b border-[#d2cabb]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="rule-label">Support / help</p>
              <h1 className="display-serif mt-4 text-5xl leading-[0.98] md:text-7xl">Troubleshoot the workflow.</h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#59615c]">
              CareerOS is an open-source project. This page documents the common failure points and sends reproducible bugs to the repository instead of pretending there is a staffed support desk.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="self-start border border-[#cfc7b7] bg-[#173f35] p-6 text-[#f8f5ed] lg:sticky lg:top-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e99a7e]">Before filing a bug</p>
              <h2 className="display-serif mt-3 text-3xl text-[#f8f5ed]">Capture what actually failed.</h2>
              <ol className="mt-5 space-y-3 text-sm leading-6 text-[#b9c8c2]">
                <li>1. The page and action you were using.</li>
                <li>2. The exact error message shown.</li>
                <li>3. Browser and operating system.</li>
                <li>4. Whether the backend/worker was running.</li>
                <li>5. A reproducible sequence that does not include private resume data.</li>
              </ol>
              <a
                href="https://github.com/Tahir-CS/CAREER-OS-/issues"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex h-10 items-center gap-2 rounded-md bg-[#f3f0e7] px-4 text-sm font-semibold text-[#173f35]"
              >
                Open GitHub issues <ArrowUpRight className="h-4 w-4" />
              </a>
            </aside>

            <div>
              <div className="border-t border-[#d2cabb]">
                {helpItems.map(([title, text], index) => (
                  <article key={title} className="grid gap-4 border-b border-[#d2cabb] py-6 sm:grid-cols-[54px_220px_1fr]">
                    <span className="font-mono text-xs text-[#b84f31]">0{index + 1}</span>
                    <h2 className="text-base font-semibold">{title}</h2>
                    <p className="text-sm leading-6 text-[#59615c]">{text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Link to="/about" className="border border-[#cfc7b7] bg-[#faf8f2] p-5 transition hover:bg-[#e9e4d8]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#b84f31]">Architecture</p>
                  <h3 className="mt-3 text-base font-semibold">Understand the service path</h3>
                  <p className="mt-2 text-sm leading-6 text-[#59615c]">See which layer handles uploads, queues, storage, matching, and browser speech.</p>
                </Link>
                <a
                  href="https://github.com/Tahir-CS/CAREER-OS-"
                  target="_blank"
                  rel="noreferrer"
                  className="border border-[#cfc7b7] bg-[#faf8f2] p-5 transition hover:bg-[#e9e4d8]"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#b84f31]">Source</p>
                  <h3 className="mt-3 flex items-center gap-2 text-base font-semibold">Inspect the repository <ArrowUpRight className="h-4 w-4" /></h3>
                  <p className="mt-2 text-sm leading-6 text-[#59615c]">Check open issues, deployment files, backend code, and recent changes.</p>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
