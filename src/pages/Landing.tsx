import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Mic, Search, TrendingUp, HelpCircle, ChevronDown, Rocket, Award, Star, Users } from 'lucide-react';
import ResumeUploader, { AnalyzePayload } from '../components/ResumeUploader';

const Landing = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleDemoUpload = (payload: AnalyzePayload) => {
    // Navigate to workspace with file payload
    navigate('/app');
  };

  const faqs = [
    {
      q: "How does CareerOS calculate ATS Compliance & RAG Match Scores?",
      a: "CareerOS converts both candidate resume text and target role requirements into 768-dimensional mathematical vector arrays using Google Gemini's text-embedding-004 model. We then execute a native pgvector Cosine Distance query inside PostgreSQL (1 - (v1 <=> v2)) to compute exact mathematical relevance scores instead of relying on subjective LLM guesses."
    },
    {
      q: "Is the Live Voice AI Mock Interviewer completely free?",
      a: "Yes! By leveraging your browser's native Web Speech Recognition (for speech-to-text mic input) and Web Speech Synthesis (for voice audio playback), candidate voice answers are processed locally in your browser with $0 API audio streaming fees."
    },
    {
      q: "Will my resume data be shared or used to train public AI models?",
      a: "No. All uploaded documents are stored securely in isolated S3-compatible MinIO object storage. We adhere to strict GDPR and SOC2 data privacy guidelines. Your resume is never sold or used for public LLM training."
    },
    {
      q: "Can I export my evaluation reports as PDF?",
      a: "Absolutely. Every generated report can be exported as a clean, professionally formatted PDF document containing score breakdowns, radar charts, targeted interview questions, and bullet point rewrites."
    },
    {
      q: "What file formats does CareerOS support?",
      a: "CareerOS accepts PDF and DOCX document formats up to 5MB in size."
    },
    {
      q: "How do I compare my resume score improvements over time?",
      a: "Every analysis is automatically saved to your Analysis History dashboard (/history). You can view your score trajectory timeline graph or select any 2 reports to view a side-by-side comparison matrix."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-grow space-y-20 pb-16">
        
        {/* 1. HERO SECTION */}
        <section className="container mx-auto px-4 pt-8 md:pt-16">
          <div className="apple-card p-8 md:p-16 text-center max-w-5xl mx-auto relative overflow-hidden bg-gradient-to-b from-white to-[#f5f5f7]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 px-4 py-1.5 text-xs font-bold text-[#0071e3] mb-6">
              <Sparkles className="h-4 w-4" />
              Enterprise Career Intelligence Platform v2.0
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-[#1d1d1f] leading-[1.08] max-w-4xl mx-auto">
              Accelerate Your Career with Vector AI Intelligence.
            </h1>

            <p className="text-lg md:text-2xl text-[#86868b] mt-6 max-w-2xl mx-auto font-normal leading-relaxed">
              Instant ATS compliance checks, mathematical RAG role matching, and zero-cost live voice mock interviews.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button className="apple-button h-14 px-8 text-base font-semibold w-full sm:w-auto">
                  <Rocket className="mr-2 h-5 w-5" /> Launch Workspace Free
                </Button>
              </Link>
              <Link to="/interview">
                <Button variant="outline" className="apple-button-secondary border-none h-14 px-8 text-base font-semibold w-full sm:w-auto">
                  <Mic className="mr-2 h-5 w-5 text-[#0071e3]" /> Try Live Voice Interview
                </Button>
              </Link>
            </div>

            {/* Floating Social Proof Bar */}
            <div className="mt-12 pt-8 border-t border-border/70 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-extrabold text-[#1d1d1f]">50,000+</p>
                <p className="text-xs text-[#86868b] font-medium mt-0.5">Resumes Evaluated</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#34c759]">98%</p>
                <p className="text-xs text-[#86868b] font-medium mt-0.5">ATS Pass Rate</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#0071e3]">&lt; 50ms</p>
                <p className="text-xs text-[#86868b] font-medium mt-0.5">Queue Ingestion Speed</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#af52de]">4.9 / 5</p>
                <p className="text-xs text-[#86868b] font-medium mt-0.5">Candidate Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE DEMO WIDGET */}
        <section className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#1d1d1f]">Try the Analyzer Right Now</h2>
            <p className="text-base text-[#86868b] mt-1">Upload your resume to experience our vector evaluation engine instantly.</p>
          </div>
          <ResumeUploader onAnalyze={handleDemoUpload} />
        </section>

        {/* 3. FEATURE HIGHLIGHTS MATRIX */}
        <section className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3] mb-3">
              Engine Architecture
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1d1d1f]">
              Built for Modern Career Velocity
            </h2>
            <p className="text-base text-[#86868b] mt-2">
              Combining vector embeddings, event queues, and native browser speech engines.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Feature 1 */}
            <div className="apple-card p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">pgvector RAG Semantic Matching</h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Calculates native mathematical cosine distance between candidate resumes and target job descriptions using Google Gemini 768-dimensional float embeddings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="apple-card p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34c759]/10 text-[#34c759]">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">Zero-Cost Live Voice AI Interviewer</h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Practice answering candidate-specific technical interview questions with real-time speech recognition, AI interviewer personas, and STAR checklist scoring.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="apple-card p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#af52de]/10 text-[#af52de]">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">ATS Keyword &amp; Gap Extractor</h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Instantly extract Hard Skills, Tools, and Soft Skills from target postings and copy auto-generated resume bullet point enhancements with one click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="apple-card p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff9500]/10 text-[#ff9500]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">Score Trajectory Analytics</h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Track candidate resume score improvements over time with interactive Recharts timeline graphs and side-by-side report comparison matrices.
              </p>
            </div>
          </div>
        </section>

        {/* 4. PRICING TIERS */}
        <section className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#34c759]/10 px-3.5 py-1 text-xs font-semibold text-[#34c759] mb-3">
              Simple Transparent Pricing
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1d1d1f]">
              Plans Tailored for Every Career Stage
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="apple-card p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="chip-mono border-none bg-[#86868b]/10 text-[#86868b] px-3 py-1">Starter</Badge>
                <h3 className="text-3xl font-extrabold text-[#1d1d1f]">$0 <span className="text-sm font-normal text-[#86868b]">/ forever</span></h3>
                <p className="text-xs text-[#86868b]">Ideal for candidates getting started with resume reviews.</p>
                <ul className="space-y-2.5 text-sm text-[#1d1d1f] pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#34c759]" /> 5 Resume Uploads / Month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#34c759]" /> Basic ATS Compliance Score</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#34c759]" /> ATS Keyword Extractor</li>
                </ul>
              </div>
              <Link to="/app">
                <Button className="apple-button-secondary w-full h-12 border-none">Get Started Free</Button>
              </Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="apple-card p-8 flex flex-col justify-between space-y-6 border-2 border-[#0071e3] shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#0071e3] text-white px-3 py-0.5 text-[10px] font-extrabold uppercase chip-mono">Most Popular</Badge>
              </div>
              <div className="space-y-4">
                <Badge variant="outline" className="chip-mono border-none bg-[#0071e3]/10 text-[#0071e3] px-3 py-1">Pro CareerOS</Badge>
                <h3 className="text-3xl font-extrabold text-[#1d1d1f]">$19 <span className="text-sm font-normal text-[#86868b]">/ month</span></h3>
                <p className="text-xs text-[#86868b]">For active job seekers accelerating interview callbacks.</p>
                <ul className="space-y-2.5 text-sm text-[#1d1d1f] pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#0071e3]" /> Unlimited Resume Uploads</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#0071e3]" /> pgvector RAG Semantic Matching</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#0071e3]" /> Unlimited Voice AI Mock Interviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#0071e3]" /> PDF Export &amp; Score Trajectory</li>
                </ul>
              </div>
              <Link to="/app">
                <Button className="apple-button w-full h-12">Upgrade to Pro</Button>
              </Link>
            </div>

            {/* Executive */}
            <div className="apple-card p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="chip-mono border-none bg-[#af52de]/10 text-[#af52de] px-3 py-1">Executive Suite</Badge>
                <h3 className="text-3xl font-extrabold text-[#1d1d1f]">$49 <span className="text-sm font-normal text-[#86868b]">/ month</span></h3>
                <p className="text-xs text-[#86868b]">For executive candidates &amp; career coaches.</p>
                <ul className="space-y-2.5 text-sm text-[#1d1d1f] pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#af52de]" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#af52de]" /> Priority Queue Execution (&lt;10ms)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#af52de]" /> Custom AI Interviewer Personas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#af52de]" /> 1-on-1 Recruiter Review Credits</li>
                </ul>
              </div>
              <Link to="/app">
                <Button className="apple-button-secondary w-full h-12 border-none">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. FAQ ACCORDION */}
        <section className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1d1d1f]">Frequently Asked Questions</h2>
            <p className="text-base text-[#86868b] mt-1">Everything you need to know about CareerOS.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="apple-card p-6 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-[#1d1d1f]">{faq.q}</h3>
                    <ChevronDown className={`h-5 w-5 text-[#86868b] transition-transform ${isOpen ? 'rotate-180 text-[#0071e3]' : ''}`} />
                  </div>
                  {isOpen && (
                    <p className="mt-3 text-sm text-[#86868b] leading-relaxed border-t border-border/60 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. BOTTOM CTA BANNER */}
        <section className="container mx-auto px-4 max-w-5xl">
          <div className="apple-card p-10 md:p-14 text-center bg-gradient-to-r from-[#0071e3] to-[#5856d6] text-white space-y-6 border-none shadow-xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Ready to Land Your Next Senior Role?</h2>
            <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto font-normal">
              Join 50,000+ candidates using CareerOS to optimize resumes and ace technical interviews.
            </p>
            <div className="pt-2">
              <Link to="/app">
                <Button className="bg-white text-[#0071e3] hover:bg-white/90 h-14 px-8 text-base font-extrabold rounded-full shadow-lg">
                  Launch Free Workspace Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
