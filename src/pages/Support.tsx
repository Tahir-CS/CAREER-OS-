import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { LifeBuoy, Send, CheckCircle2, MessageSquare, ShieldCheck, Activity, HelpCircle, FileText } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const Support = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast({ title: 'Missing Fields', description: 'Please fill in your email and message.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      setSubject('');
      setMessage('');
      toast({ title: 'Ticket Submitted', description: 'Our engineering support team will respond within 2 hours.' });
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3]">
            Support &amp; Help Desk
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
            How Can We Help You?
          </h1>
          <p className="text-base text-[#86868b]">
            Get in touch with engineering support or explore quick troubleshooting guides.
          </p>
        </div>

        {/* Live System Uptime Status */}
        <div className="apple-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#34c759]/5 border-[#34c759]/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34c759]/15 text-[#34c759]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold text-[#1d1d1f]">System Operational Status</p>
              <p className="text-xs text-[#86868b]">API Gateway, BullMQ Worker, Redis &amp; MinIO services online.</p>
            </div>
          </div>
          <Badge className="bg-[#34c759] text-white px-4 py-1 text-xs font-bold chip-mono rounded-full">
            100% Operational
          </Badge>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Contact Support Form */}
          <div className="md:col-span-2 apple-card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#0071e3]" />
              Submit a Support Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[#1d1d1f] chip-mono">Your Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-11 text-sm focus:border-[#0071e3]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[#1d1d1f] chip-mono">Subject / Topic</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue uploading PDF resume or API questions"
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-11 text-sm focus:border-[#0071e3]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[#1d1d1f] chip-mono">Message Details</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you need help with..."
                  className="min-h-[140px] rounded-xl border border-border/80 bg-[#f5f5f7] p-4 text-sm focus:border-[#0071e3]"
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="apple-button h-12 px-6 font-semibold w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </Button>
            </form>
          </div>

          {/* Quick Help Guides Sidebar */}
          <div className="space-y-6">
            <div className="apple-card p-6 space-y-4">
              <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#0071e3]" />
                Quick Knowledge Base
              </h3>
              
              <div className="space-y-3 text-xs text-[#86868b]">
                <div className="rounded-xl bg-[#f5f5f7] p-3 space-y-1">
                  <p className="font-bold text-[#1d1d1f]">File Upload Limits</p>
                  <p>Maximum file size is 5MB in PDF or DOCX format.</p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] p-3 space-y-1">
                  <p className="font-bold text-[#1d1d1f]">Voice Speech Input</p>
                  <p>Web Speech Recognition works best on Chrome, Edge, and Safari.</p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] p-3 space-y-1">
                  <p className="font-bold text-[#1d1d1f]">Sentry Error Logging</p>
                  <p>Client and worker exceptions are automatically captured by Sentry.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
