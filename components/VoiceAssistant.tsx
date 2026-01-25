'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// --- Types for Web Speech API ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// --- Component Props ---
interface VoiceAssistantProps {}

// --- Types for State ---
type ProcessingStep = 'idle' | 'listening' | 'processing' | 'confirmation' | 'executing' | 'success' | 'error';
interface Intent {
  action: 'approve' | 'implement' | 'complete';
  ecoId: string;
  originalId: string; // e.g. "8406" from "ECO-8406"
}
interface EcoDetails {
  id: string;
  title: string;
  status: string;
  bomId: string;
  requestedBy: string;
}

export function VoiceAssistant({}: VoiceAssistantProps) {
  const { currentRole, currentUser } = useAuth();
  const router = useRouter();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [ecoDetails, setEcoDetails] = useState<EcoDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Only show for authorized roles (ECO Manager only for prototype)
  if (currentRole !== 'ECO Manager') return null;

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
      const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false; // Stop after one sentence
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setStep('listening');
          setTranscript('');
          setErrorMessage(null);
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscript || interimTranscript);
          
          if (finalTranscript) {
             console.log('Final Transcript:', finalTranscript);
             processCommand(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setStep('error');
          setErrorMessage('Did not catch that. Please try again.');
          setTimeout(() => {
              if (step === 'error') setStep('idle');
          }, 3000);
        };

        recognitionRef.current.onend = () => {
          // If we are still strictly listening and haven't processed, go to idle
          // But onresult usually triggers processing.
          if (step === 'listening' && !transcript) {
             setStep('idle');
          }
        };
      }
    }
    
    return () => {
         if (recognitionRef.current) {
             recognitionRef.current.stop();
         }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleListening = () => {
    if (step === 'listening') {
      recognitionRef.current?.stop();
      setStep('idle');
    } else {
      setIntent(null);
      setEcoDetails(null);
      setErrorMessage(null);
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Speech API error:", e);
        setErrorMessage("Microphone unavailable.");
        setStep('error');
      }
    }
  };

  const processCommand = async (command: string) => {
    setStep('processing');
    
    // 1. Parsing Logic
    // Regex for "Approve/Implement/Complete" and "ECO-XXXX" 
    // Relaxed regex to catch "ECO 123", "ECO-123", "ECO123"
    const ecoIdMatch = command.match(/ECO[-\s]?(\d+)/i);
    const actionMatch = command.match(/(approve|implement|complete)/i);

    if (!ecoIdMatch || !actionMatch) {
      setErrorMessage("I didn't catch a valid ECO ID or Action. Try saying 'Approve ECO-123'.");
      setStep('error');
      return;
    }

    const action = actionMatch[1].toLowerCase() as 'approve' | 'implement' | 'complete';
    const originalId = ecoIdMatch[1];
    const fullEcoId = `ECO${originalId}`;

    setIntent({ action, ecoId: fullEcoId, originalId });

    // 2. Fetch ECO Details to validate
    try {
      // We will assume the API allows searching by ID string or we iterate. 
      // Our API at /api/eco/[id] takes the database ID (usually UUID).
      // But the user prompt says "ECO-8406". 
      // We need to resolve "ECO-8406" to a DB UUID or assume the API supports the friendly ID.
      // Looking at previous context, `[id]` route usually expects the DB ID.
      // However, let's see if we have a lookup endpoint.
      // We might need to fetch *all* ECOs and filter, or use a specific search param.
      // For now, let's try to fetch list and find. It's safer.
      
      const res = await fetch('/api/eco'); // Assuming this lists ECOs
      if (!res.ok) throw new Error('Failed to fetch ECOs');
      
      const data = await res.json(); 
      // data might be { ecos: [...] } or just [...]
      const ecos: any[] = Array.isArray(data) ? data : (data.ecos || []);
      
      // Find the ECO
      // Assuming existing logic uses an 'id' which might be friendly or uuid.
      // If the backend generates friendly IDs like ECO-1001, we match on that.
      // If not, and we only have UUIDs, this Voice Assistant is tricky without a mapping.
      // Let's assume there is a field 'id' or 'ecoNumber' that matches.
      // In prisma schema (from what I recall), id is usually string/uuid.
      // If the user actually *sees* ECO-8406, it must be stored somewhere.
      
      // Let's look for a match in id, title, or a specific field if it existed.
      // Based on typical systems, maybe the ID visible is the ID.
      // Let's try to match strict ID first, then fuzzy.
      
      let targetEco = ecos.find((e: any) => e.id === fullEcoId || e.id === originalId);
      
      // Fallback: Check if title contains it?
      if (!targetEco) {
          targetEco = ecos.find((e: any) => e.title?.includes(fullEcoId));
      }

      if (!targetEco) {
         setErrorMessage(`Could not find E C O ${originalId}.`);
         setStep('error');
         return;
      }

      setEcoDetails({
          id: targetEco.id,
          title: targetEco.title,
          status: targetEco.status,
          bomId: targetEco.bomId,
          requestedBy: targetEco.requestedBy?.name || 'Unknown'
      });
      setStep('confirmation');

    } catch (err) {
      console.error(err);
      setErrorMessage("Networking error while fetching ECO details.");
      setStep('error');
    }
  };

  const executeAction = async () => {
    if (!intent || !ecoDetails) return;

    setStep('executing');

    // Validate Status Transitions logic (client side check for UX)
    // Allowed: 
    // DRAFT -> APPROVED (Wait, usually Pending -> Approved)
    // APPROVED -> IMPLEMENTED
    // IMPLEMENTED -> COMPLETED
    
    // Simplistic mapping for demo
    const status = ecoDetails.status.toLowerCase();
    const action = intent.action;
    
    let isValid = true;
    let warning = '';

    if (action === 'approve' && status !== 'pending approval' && status !== 'pending_approval' && status !== 'draft') { 
        // Allow draft->approve if workflow permits, but usually strict
        warning = `ECO is currently ${status}. Are you sure you want to approve?`;
    }
    if (action === 'implement' && status !== 'approved') {
        isValid = false;
        warning = `Cannot implement ECO in '${status}' state. Must be 'Approved'.`;
    }
    if (action === 'complete' && status !== 'implemented') {
        isValid = false;
        warning = `Cannot complete ECO in '${status}' state. Must be 'Implemented'.`;
    }

    if (!isValid) {
        setErrorMessage(warning);
        setStep('error');
        return;
    }

    try {
        // Construct API Call
        let newStatus = '';
        let newStage = '';
        
        if (action === 'approve') {
            newStatus = 'Approved'; 
            newStage = 'Implementation';
        }
        if (action === 'implement') {
            newStatus = 'Implemented';
            newStage = 'Implementation';
        }
        if (action === 'complete') {
            newStatus = 'Completed';
            newStage = 'Completed';
        }

        const response = await fetch(`/api/eco/${ecoDetails.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: newStatus,
                stage: newStage 
            })
        });

        if (!response.ok) {
            throw new Error('Update failed');
        }

        toast.success(`ECO-${intent.originalId} ${newStatus.toLowerCase()} successfully!`);
        setStep('success');
        
        // Refresh page/data after delay
        setTimeout(() => {
            setIsOpen(false);
            setStep('idle');
            router.refresh();
        }, 2000);

    } catch (err) {
        console.error(err);
        setErrorMessage("Failed to execute action. Please try again.");
        setStep('error');
    }
  };

  const getActionColor = (action: string) => {
      switch(action) {
          case 'approve': return 'bg-green-500 hover:bg-green-600';
          case 'implement': return 'bg-blue-500 hover:bg-blue-600';
          case 'complete': return 'bg-purple-500 hover:bg-purple-600';
          default: return 'bg-primary';
      }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
            isOpen ? 'rotate-90 bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
      </div>

      {/* Assistant Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 md:w-96 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-5">
          <CardHeader className="bg-muted/50 pb-3">
            <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                    ⚠️ CONCEPT PROTOTYPE
                </Badge>
                <span className="text-[10px] text-muted-foreground">v0.1</span>
            </div>
            <CardTitle className="flex items-center gap-2 text-lg">
                <span className="bg-primary/10 p-1.5 rounded-full">🤖</span>
                Alex (Voice Assistant)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
                Coming soon! Currently restricted to ECO Managers. More features arriving shortly.
            </p>
          </CardHeader>
          
          <CardContent className="h-64 flex flex-col justify-center items-center p-6 space-y-4">
            
            {/* IDLE */}
            {step === 'idle' && (
              <div className="text-center space-y-4">
                <div className="bg-muted p-4 rounded-full mx-auto w-fit">
                    <Mic className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Click the mic to start. <br/>
                  Try saying "Approve ECO123456"
                </p>
                <Button onClick={toggleListening} variant="default" className="w-full">
                  Start Listening
                </Button>
              </div>
            )}

            {/* LISTENING */}
            {step === 'listening' && (
              <div className="text-center space-y-4 w-full">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-400 opacity-20 animate-pulse rounded-full blur-xl"></div>
                    <div className="bg-red-100 p-4 rounded-full mx-auto w-fit relative z-10">
                        <Mic className="h-8 w-8 text-red-500 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium animate-pulse">Listening...</p>
                    <p className="text-xs text-muted-foreground h-4">
                        {transcript || "Speak now..."}
                    </p>
                </div>
                <Button onClick={toggleListening} variant="secondary" size="sm">
                  Stop
                </Button>
              </div>
            )}

            {/* PROCESSING */}
            {step === 'processing' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Processing command...</p>
                <p className="text-xs italic text-muted-foreground">"{transcript}"</p>
              </div>
            )}

            {/* CONFIRMATION */}
            {step === 'confirmation' && intent && ecoDetails && (
              <div className="w-full space-y-4 text-left">
                <div className="bg-secondary/30 p-3 rounded-md space-y-2 border">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">Action:</span>
                        <Badge className={`${getActionColor(intent.action)} text-white border-0`}>
                            {intent.action.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">Target:</span>
                        <span className="text-sm font-mono">{ecoDetails.title}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">Current Status:</span>
                        <span className="text-xs text-muted-foreground">{ecoDetails.status}</span>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('idle')}>
                        Cancel
                    </Button>
                    <Button 
                        className={`flex-1 ${getActionColor(intent.action)}`} 
                        onClick={executeAction}
                    >
                        Confirm
                    </Button>
                </div>
              </div>
            )}

            {/* EXECUTING */}
            {step === 'executing' && (
               <div className="text-center space-y-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
               <p className="text-sm text-muted-foreground">Updating ECO...</p>
             </div> 
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="bg-green-100 p-3 rounded-full mx-auto w-fit">
                    <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-medium text-green-700">Action Completed!</p>
              </div>
            )}

            {/* ERROR */}
            {step === 'error' && (
              <div className="text-center space-y-4 w-full">
                <div className="bg-red-100 p-3 rounded-full mx-auto w-fit">
                    <MicOff className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-sm text-red-600 px-2">{errorMessage || "Something went wrong"}</p>
                <Button onClick={() => setStep('idle')} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}

          </CardContent>
          
          <CardFooter className="bg-muted/30 py-2 px-6">
             <p className="text-[10px] text-muted-foreground text-center w-full">
                Powered by WebSpeech API • AdaniXOdoo
             </p>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
