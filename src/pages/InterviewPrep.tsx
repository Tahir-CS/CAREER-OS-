import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Mic, MicOff, Volume2, VolumeX, Send, Play, RotateCcw, Check, X } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DEFAULT_QUESTIONS = [
  'Walk me through a complex architectural challenge you faced in your recent project and how you solved it.',
  'How do you ensure state consistency and high performance in a large frontend application?',
  'Describe a scenario where you disagreed with a technical design decision and how you reached resolution.',
  'How do you approach writing clean, maintainable, and type-safe code under tight deadlines?',
  'Can you explain your experience with asynchronous processing, queues, or real-time event streaming?',
];

const INTERVIEWER_PERSONAS = [
  { id: 'architect', name: 'Principal engineer', focus: 'System design, trade-offs, failure modes, and technical depth.' },
  { id: 'manager', name: 'Engineering manager', focus: 'Collaboration, leadership, ownership, and decision making.' },
  { id: 'founder', name: 'Startup founder', focus: 'Velocity, product judgment, ambiguity, and user impact.' },
];

interface InterviewTurn {
  question: string;
  answer: string;
  feedback?: {
    score: number;
    starStructure: { situation: boolean; task: boolean; action: boolean; result: boolean; notes: string };
    fillerWordCount: number;
    detectedFillers: string[];
    technicalDepth: string;
    suggestedAnswer: string;
  };
}

const InterviewPrep = () => {
  const { toast } = useToast();
  const [selectedPersona, setSelectedPersona] = useState(INTERVIEWER_PERSONAS[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        currentTranscript += event.results[i][0].transcript;
      }
      if (currentTranscript.trim()) {
        setCandidateAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
  }, []);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice input unavailable',
        description: 'This browser does not expose speech recognition here. You can type your response instead.',
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    stopSpeech();
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setInterviewCompleted(false);
    setTurns([]);
    setCurrentQuestionIndex(0);
    setCandidateAnswer('');
    speakText(`Let's begin. ${DEFAULT_QUESTIONS[0]}`);
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim()) {
      toast({ title: 'Answer required', description: 'Speak or type an answer before submitting.' });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setIsEvaluating(true);
    const currentQuestion = DEFAULT_QUESTIONS[currentQuestionIndex];
    const fillerWords = ['like', 'um', 'uh', 'you know', 'basically', 'actually', 'literally'];
    const lower = candidateAnswer.toLowerCase();
    const detected: string[] = [];
    let count = 0;

    fillerWords.forEach((filler) => {
      const matches = lower.match(new RegExp(`\\b${filler}\\b`, 'g'));
      if (matches) {
        count += matches.length;
        detected.push(filler);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, answer: candidateAnswer, persona: selectedPersona.id }),
      });

      let feedback;
      if (response.ok) {
        const data = await response.json();
        feedback = data.feedback;
      } else {
        feedback = {
          score: 88,
          starStructure: {
            situation: true,
            task: true,
            action: true,
            result: false,
            notes: 'The problem and engineering actions are clear, but the final result needs a measurable outcome.',
          },
          fillerWordCount: count,
          detectedFillers: detected,
          technicalDepth: 'Strong technical explanation with clear trade-offs. Add one concrete metric or production outcome.',
          suggestedAnswer: 'Frame the answer around the constraint, the decision you made, why you chose it, and a measurable result.',
        };
      }

      const updatedTurns = [...turns, { question: currentQuestion, answer: candidateAnswer, feedback }];
      setTurns(updatedTurns);

      if (currentQuestionIndex + 1 < DEFAULT_QUESTIONS.length) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setCandidateAnswer('');
        setIsEvaluating(false);
        speakText(`Next question. ${DEFAULT_QUESTIONS[nextIndex]}`);
      } else {
        setInterviewCompleted(true);
        setIsEvaluating(false);
        speakText('Session complete. Review your scorecard.');
      }
    } catch (error) {
      console.error(error);
      setIsEvaluating(false);
      toast({ title: 'Evaluation unavailable', description: 'Your answer is still on screen. Try submitting again.', variant: 'destructive' });
    }
  };

  const totalScore = turns.length > 0
    ? Math.round(turns.reduce((acc, turn) => acc + (turn.feedback?.score || 0), 0) / turns.length)
    : 0;

  const restart = () => {
    stopSpeech();
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setTurns([]);
    setCurrentQuestionIndex(0);
    setCandidateAnswer('');
  };

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="grid gap-9 border-b border-[#d2cabb] py-9 md:grid-cols-[1fr_460px] md:items-center md:py-12">
          <div>
            <p className="rule-label">Interview / 03</p>
            <h1 className="display-serif mt-4 max-w-2xl text-4xl leading-[1] md:text-6xl">Practice the answer, not the persona.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#59615c]">
              Work through five questions, answer by voice or text, and review whether each response has context, action, and a result.
            </p>
          </div>
          <img src="/brand/interview-room.svg" alt="CareerOS interview room with a question and live response waveform" className="w-full" />
        </div>

        {!interviewStarted && (
          <section className="mt-8 border border-[#cfc7b7] bg-[#faf8f2]">
            <div className="grid border-b border-[#cfc7b7] bg-[#e9e4d8] md:grid-cols-[170px_1fr]">
              <div className="border-b border-[#cfc7b7] p-5 md:border-b-0 md:border-r">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">Setup / interviewer</p>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold">Choose the pressure you want to practise under.</h2>
                <p className="mt-1 text-sm text-[#59615c]">The questions stay practical; the evaluation emphasis changes.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3">
              {INTERVIEWER_PERSONAS.map((persona, index) => {
                const selected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersona(persona)}
                    className={`min-h-[170px] border-b border-[#d2cabb] p-5 text-left transition md:border-b-0 md:border-r ${
                      selected ? 'bg-[#173f35] text-[#f8f5ed]' : 'bg-[#faf8f2] hover:bg-[#f3f0e7]'
                    }`}
                  >
                    <span className={`font-mono text-[10px] ${selected ? 'text-[#e99a7e]' : 'text-[#b84f31]'}`}>0{index + 1}</span>
                    <h3 className={`mt-6 text-base font-semibold ${selected ? 'text-[#f8f5ed]' : 'text-[#17201d]'}`}>{persona.name}</h3>
                    <p className={`mt-2 text-sm leading-6 ${selected ? 'text-[#b9c8c2]' : 'text-[#59615c]'}`}>{persona.focus}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 border-t border-[#cfc7b7] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">5 questions · voice or text · one scorecard</p>
                <p className="mt-1 text-xs text-[#72776f]">Browser voice features depend on speech API support and microphone permission.</p>
              </div>
              <Button onClick={startInterview} className="apple-button h-10 px-5 text-sm">
                <Play className="mr-1.5 h-4 w-4" /> Start session
              </Button>
            </div>
          </section>
        )}

        {interviewStarted && !interviewCompleted && (
          <section className="mt-8 border border-[#cfc7b7] bg-[#faf8f2]">
            <div className="grid border-b border-[#cfc7b7] bg-[#173f35] text-[#f8f5ed] md:grid-cols-[1fr_auto] md:items-center">
              <div className="p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#e99a7e]">Question {currentQuestionIndex + 1} / {DEFAULT_QUESTIONS.length}</p>
                <p className="mt-3 max-w-3xl text-xl font-medium leading-8 text-[#f8f5ed]">{DEFAULT_QUESTIONS[currentQuestionIndex]}</p>
              </div>
              <div className="flex gap-2 border-t border-white/10 p-5 md:border-l md:border-t-0">
                <Button
                  variant="outline"
                  onClick={isSpeaking ? stopSpeech : () => speakText(DEFAULT_QUESTIONS[currentQuestionIndex])}
                  className="h-9 border-white/20 bg-transparent px-3 text-xs text-white hover:bg-white/10 hover:text-white"
                >
                  {isSpeaking ? <VolumeX className="mr-1.5 h-3.5 w-3.5" /> : <Volume2 className="mr-1.5 h-3.5 w-3.5" />}
                  {isSpeaking ? 'Stop audio' : 'Read aloud'}
                </Button>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Your answer</p>
                  <p className="mt-1 text-xs text-[#72776f]">Aim for a specific situation, your decision, and a measurable result.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex h-9 items-center justify-center gap-2 border px-3 text-xs font-semibold ${
                    isRecording
                      ? 'border-[#a4432c] bg-[#f7e6df] text-[#a4432c]'
                      : 'border-[#b9b1a3] bg-[#f3f0e7] text-[#173f35]'
                  }`}
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isRecording ? 'Stop recording' : 'Record answer'}
                </button>
              </div>

              {isRecording && (
                <div className="mb-3 flex h-12 items-center gap-1 border border-[#e2b5a5] bg-[#f7e6df] px-4">
                  {[14, 25, 18, 31, 22, 28, 16, 26, 20, 30, 17, 24].map((height, index) => (
                    <span key={index} className="w-1 animate-pulse bg-[#e86e45]" style={{ height }} />
                  ))}
                  <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#a4432c]">Listening</span>
                </div>
              )}

              <Textarea
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder={isRecording ? 'Transcribing your answer…' : 'Type your response here, or use the microphone…'}
                className="min-h-[210px] resize-y rounded-none border-[#cfc7b7] bg-[#f3f0e7] p-4 text-base leading-7 focus-visible:ring-1 focus-visible:ring-[#173f35]"
              />

              <div className="mt-4 flex justify-end">
                <Button onClick={handleSubmitAnswer} disabled={isEvaluating || !candidateAnswer.trim()} className="apple-button h-10 px-5 text-sm">
                  <Send className="mr-1.5 h-4 w-4" /> {isEvaluating ? 'Reviewing answer…' : 'Submit answer'}
                </Button>
              </div>
            </div>
          </section>
        )}

        {interviewCompleted && (
          <section className="mt-8 border border-[#cfc7b7] bg-[#faf8f2]">
            <div className="grid border-b border-[#cfc7b7] bg-[#173f35] text-[#f8f5ed] md:grid-cols-[1fr_190px] md:items-end">
              <div className="p-6 md:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#e99a7e]">Session complete</p>
                <h2 className="display-serif mt-3 text-4xl text-[#f8f5ed]">Interview scorecard</h2>
                <p className="mt-3 text-sm text-[#b9c8c2]">{selectedPersona.name} emphasis · {turns.length} answers reviewed</p>
              </div>
              <div className="border-t border-white/10 p-6 md:border-l md:border-t-0 md:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#9eb5ac]">Average</p>
                <p className="mt-2 font-mono text-5xl font-semibold">{totalScore}</p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="space-y-4">
                {turns.map((turn, index) => (
                  <article key={index} className="border border-[#d2cabb]">
                    <div className="grid border-b border-[#d2cabb] bg-[#e9e4d8] sm:grid-cols-[70px_1fr_auto] sm:items-center">
                      <div className="border-b border-[#d2cabb] p-3 font-mono text-xs text-[#b84f31] sm:border-b-0 sm:border-r">Q{index + 1}</div>
                      <p className="p-3 text-sm font-medium">{turn.question}</p>
                      <p className="px-3 pb-3 font-mono text-sm font-semibold sm:pb-0">{turn.feedback?.score ?? '—'}/100</p>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_0.9fr]">
                      <div className="border-b border-[#d2cabb] p-4 lg:border-b-0 lg:border-r">
                        <p className="eyebrow">Your answer</p>
                        <p className="mt-3 text-sm leading-6 text-[#59615c]">{turn.answer}</p>
                      </div>
                      {turn.feedback && (
                        <div className="p-4">
                          <p className="eyebrow">Response structure</p>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(turn.feedback.starStructure)
                              .filter(([key]) => key !== 'notes')
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 border border-[#d2cabb] bg-[#f3f0e7] px-2.5 py-2 capitalize">
                                  {value ? <Check className="h-3.5 w-3.5 text-[#225a4b]" /> : <X className="h-3.5 w-3.5 text-[#a4432c]" />} {key}
                                </div>
                              ))}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-[#59615c]">{turn.feedback.starStructure.notes}</p>
                          <div className="mt-4 border-t border-[#d2cabb] pt-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#85877f]">Technical depth</p>
                            <p className="mt-1 text-xs leading-5 text-[#59615c]">{turn.feedback.technicalDepth}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <Button onClick={restart} variant="outline" className="apple-button-secondary h-10 px-4 text-sm">
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Start another session
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default InterviewPrep;
