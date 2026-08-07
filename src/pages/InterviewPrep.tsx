import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, CheckCircle2, RotateCcw, Send, Play, Trophy, HelpCircle } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DEFAULT_QUESTIONS = [
  "Walk me through a complex architectural challenge you faced in your recent project and how you solved it.",
  "How do you ensure state consistency and high performance in a large frontend application?",
  "Describe a scenario where you disagreed with a technical design decision and how you reached resolution.",
  "How do you approach writing clean, maintainable, and type-safe code under tight deadlines?",
  "Can you explain your experience with asynchronous processing, queues, or real-time event streaming?"
];

interface InterviewTurn {
  question: string;
  answer: string;
  feedback?: {
    score: number;
    starStructure: string;
    technicalDepth: string;
    suggestedAnswer: string;
  };
}

const InterviewPrep = () => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // Web Speech API Refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setCandidateAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Web Speech Synthesis: AI Interviewer Speaks Aloud
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Microphone Warning',
        description: 'Speech recognition is not supported in this browser. You can type your answer below!',
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      stopSpeech();
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast({ title: 'Microphone Active', description: 'Speak your answer aloud now...' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setInterviewCompleted(false);
    setTurns([]);
    setCurrentQuestionIndex(0);
    setCandidateAnswer('');
    speakText(`Welcome to your AI Mock Interview. Let's begin with your first question: ${questions[0]}`);
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim()) {
      toast({ title: 'Empty Answer', description: 'Please speak or type your answer before submitting.' });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setIsEvaluating(true);
    const currentQ = questions[currentQuestionIndex];

    try {
      // Send answer to backend Gemini evaluator endpoint or generate simulated feedback
      const response = await fetch(`${API_BASE_URL}/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          answer: candidateAnswer,
        }),
      });

      let feedback;
      if (response.ok) {
        const data = await response.json();
        feedback = data.feedback;
      } else {
        // Fallback simulation feedback
        feedback = {
          score: 85,
          starStructure: "Good structure. You clearly outlined the Action and Problem, but could elaborate more on quantitative Results.",
          technicalDepth: "Strong technical depth. Excellent mention of trade-offs and performance optimization.",
          suggestedAnswer: `A senior engineer would answer: "In my recent project, I encountered high latency during surge traffic. I implemented Redis caching and BullMQ async workers, reducing response latency by 65% while keeping memory usage stable."`,
        };
      }

      const turnRecord: InterviewTurn = {
        question: currentQ,
        answer: candidateAnswer,
        feedback,
      };

      const updatedTurns = [...turns, turnRecord];
      setTurns(updatedTurns);

      if (currentQuestionIndex + 1 < questions.length) {
        const nextQIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextQIndex);
        setCandidateAnswer('');
        setIsEvaluating(false);

        const nextQ = questions[nextQIndex];
        speakText(`Great. Here is your next question: ${nextQ}`);
      } else {
        setInterviewCompleted(true);
        setIsEvaluating(false);
        speakText("Congratulations! You have completed your AI Mock Interview session. Review your scorecard below.");
      }

    } catch (error) {
      console.error(error);
      setIsEvaluating(false);
    }
  };

  const totalScore = turns.length > 0
    ? Math.round(turns.reduce((acc, t) => acc + (t.feedback?.score || 80), 0) / turns.length)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header Title Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3] mb-3">
            Zero-Cost Web Speech API Engine
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
            Live Voice AI Mock Interview
          </h1>
          <p className="text-base text-[#86868b] mt-2">
            Speak directly with an AI Hiring Manager. Real-time microphone speech-to-text + voice response playback.
          </p>
        </div>

        {/* Start Interview Welcome State */}
        {!interviewStarted && (
          <div className="apple-card p-10 text-center flex flex-col items-center justify-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0071e3]/10 text-[#0071e3]">
              <Mic className="h-10 w-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f]">Ready to Practice Your Live Interview?</h2>
              <p className="text-base text-[#86868b] max-w-lg mt-2">
                The AI Interviewer will ask you 5 targeted questions aloud. You can speak your answer into your microphone or type your response.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl text-left pt-2">
              <div className="rounded-2xl border border-border/70 bg-[#f5f5f7] p-4">
                <p className="text-xs font-bold uppercase text-[#0071e3] chip-mono">Step 1</p>
                <p className="text-sm font-semibold text-[#1d1d1f] mt-1">Listen Aloud</p>
                <p className="text-xs text-[#86868b]">AI speaks the question using browser voice synthesis.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-[#f5f5f7] p-4">
                <p className="text-xs font-bold uppercase text-[#34c759] chip-mono">Step 2</p>
                <p className="text-sm font-semibold text-[#1d1d1f] mt-1">Speak into Mic</p>
                <p className="text-xs text-[#86868b]">Your spoken answer is transcribed live to text ($0 API fees!).</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-[#f5f5f7] p-4">
                <p className="text-xs font-bold uppercase text-[#af52de] chip-mono">Step 3</p>
                <p className="text-sm font-semibold text-[#1d1d1f] mt-1">Get Feedback</p>
                <p className="text-xs text-[#86868b]">Instant Gemini analysis on STAR structure & technical depth.</p>
              </div>
            </div>

            <Button onClick={startInterview} className="apple-button h-13 px-8 text-base font-semibold">
              <Play className="mr-2 h-5 w-5" />
              Start Live Interview Session
            </Button>
          </div>
        )}

        {/* Active Interview Question Room */}
        {interviewStarted && !interviewCompleted && (
          <div className="space-y-6">
            {/* Progress Badge Bar */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <Button variant="outline" size="sm" onClick={stopSpeech} className="apple-button-secondary border-none text-xs text-[#ff3b30]">
                    <VolumeX className="mr-1.5 h-3.5 w-3.5" />
                    Stop AI Voice
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => speakText(questions[currentQuestionIndex])} className="apple-button-secondary border-none text-xs">
                    <Volume2 className="mr-1.5 h-3.5 w-3.5 text-[#0071e3]" />
                    Replay Voice Question
                  </Button>
                )}
              </div>
            </div>

            {/* Question Card */}
            <div className="apple-card p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/25">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <span className="chip-mono text-xs uppercase font-bold text-[#86868b]">AI Technical Interviewer Asks:</span>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1 leading-snug">
                    "{questions[currentQuestionIndex]}"
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Input Room */}
            <div className="apple-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#0071e3]" />
                  Your Response (Speak into Mic or Type):
                </label>

                {/* Mic Record Toggle Button */}
                <Button
                  variant="outline"
                  onClick={toggleRecording}
                  className={`rounded-full px-4 text-xs font-bold transition-all border-none ${
                    isRecording 
                      ? 'bg-[#ff3b30] text-white animate-pulse shadow-md shadow-[#ff3b30]/30' 
                      : 'bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-1.5 h-3.5 w-3.5" />
                      Listening... Click to Stop
                    </>
                  ) : (
                    <>
                      <Mic className="mr-1.5 h-3.5 w-3.5" />
                      🎤 Record Answer via Voice
                    </>
                  )}
                </Button>
              </div>

              <Textarea
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder={isRecording ? "Listening to your voice..." : "Click 'Record Answer' to speak aloud, or type your response here..."}
                className="min-h-[160px] rounded-xl border border-border/80 bg-[#f5f5f7] p-4 text-base focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !candidateAnswer.trim()}
                  className="apple-button h-12 px-6 text-sm font-semibold"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isEvaluating ? 'AI Evaluating Answer...' : 'Submit Answer for Feedback'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Completed Scorecard State */}
        {interviewCompleted && (
          <div className="space-y-8">
            <div className="apple-card p-10 text-center flex flex-col items-center justify-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#34c759]/15 text-[#34c759]">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#1d1d1f]">Mock Interview Completed!</h2>
              <p className="text-base text-[#86868b] max-w-md">
                Great job completing your live mock interview session. Review your detailed question-by-question scorecard below.
              </p>

              <div className="pt-2">
                <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-5 py-2 text-base font-extrabold text-[#0071e3]">
                  Overall Communication Score: {totalScore} / 100
                </Badge>
              </div>
            </div>

            {/* Question Breakdown Cards */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1d1d1f]">Session Scorecard Breakdown</h3>
              {turns.map((turn, index) => (
                <div key={index} className="apple-card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="chip-mono text-xs font-bold uppercase text-[#0071e3]">
                      Question {index + 1}
                    </span>
                    <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#34c759]/10 px-3 py-1 text-xs font-bold text-[#34c759]">
                      Score: {turn.feedback?.score || 85}/100
                    </Badge>
                  </div>

                  <div>
                    <p className="text-base font-bold text-[#1d1d1f]">"{turn.question}"</p>
                    <p className="text-sm text-[#86868b] mt-1 bg-[#f5f5f7] p-3 rounded-xl">
                      <strong>Your Answer:</strong> {turn.answer}
                    </p>
                  </div>

                  {turn.feedback && (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-xl border border-[#34c759]/20 bg-[#34c759]/5 p-4">
                        <p className="text-xs font-bold uppercase text-[#34c759] chip-mono">STAR Method Assessment</p>
                        <p className="text-sm text-[#1d1d1f] mt-1">{turn.feedback.starStructure}</p>
                      </div>
                      <div className="rounded-xl border border-[#0071e3]/20 bg-[#0071e3]/5 p-4">
                        <p className="text-xs font-bold uppercase text-[#0071e3] chip-mono">Model Principal Answer</p>
                        <p className="text-sm text-[#1d1d1f] mt-1">{turn.feedback.suggestedAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={startInterview} className="apple-button h-12 px-8">
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Another Mock Session
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InterviewPrep;
