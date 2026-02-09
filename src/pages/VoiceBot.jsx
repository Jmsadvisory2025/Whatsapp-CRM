import { useState, useEffect, useRef } from "react";
import { User, Loader2,  Pipette, Pause } from "lucide-react";
import { Card } from "@/components/ui/shadcn/card";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { useDispatch, useSelector } from "react-redux";
import { initiateChat } from "../store/voicebotSlice";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// Ensure `webkitSpeechRecognition` is available as `window.SpeechRecognition` in browsers that use the prefixed API
if (typeof window !== "undefined" && !window.SpeechRecognition && window.webkitSpeechRecognition) {
  window.SpeechRecognition = window.webkitSpeechRecognition;
}

export default function VoiceBot() {
  const [language, setLanguage] = useState("gu-IN");
  const [messages, setMessages] = useState([
    // {
    //   id: "welcome",
    //   type: "bot",
    //   text: "Hello! I am Dr. Sapan Shah's AI Assistant. Please select your language and press Start to begin chatting.",
    //   timestamp: new Date(),
    // },
  ]);

  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  // UI / runtime states for speech behavior
  const [continuous, setContinuous] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const dispatch = useDispatch();
  const { response, audioUrl, loading, error } = useSelector(
    (state) => state.voicebot,
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const messagesEndRef = useRef(null);
  const isUserStartedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, transcript]);

  // Effect to handle new responses from Redux and speak them
  useEffect(() => {
    if (!loading && response) {
      // Check if we need to add the bot message
      const lastMessage = messages[messages.length - 1];

      // If we have a response, we should add it if:
      // 1. It's the very first message (Welcome message after start)
      // 2. The last message was from the user (Reply to user query)
      // 3. To avoid duplicates, check if the last message is NOT the same bot response already

      const isWelcome = messages.length === 0;
      const followsUser = lastMessage?.type === "user";
      const isDuplicate =
        lastMessage?.type === "bot" && lastMessage.text === response;

      if ((isWelcome || followsUser) && !isDuplicate) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "bot",
            text: response,
            timestamp: new Date(),
          },
        ]);

        playAudioResponse(audioUrl, response);
      }
    }
  }, [response, audioUrl, loading]);

  // Handle Speech-to-Text completion
  useEffect(() => {
    if (!listening && transcript && isUserStartedRef.current) {
      handleSendMessage(transcript);
      isUserStartedRef.current = false;
    }
  }, [listening, transcript]);

  // Manual silence detection (Fix for iOS/Non-English languages not auto-stopping)
  // Manual silence detection (Fix for iOS/Non-English languages not auto-stopping)
  useEffect(() => {
    if (!listening) return;

    // 1. Initial Silence Timeout: If no speech detected within 4 seconds of starting
    if (!transcript) {
      const initialSilenceTimer = setTimeout(() => {
        // Handle silence: Repeat last response
        SpeechRecognition.stopListening();

        // Find last bot message or use default
        const lastBotMessage = [...messages]
          .reverse()
          .find((m) => m.type === "bot");
        const textToRepeat =
          lastBotMessage?.text || "I'm listening, please go ahead.";

        // If we have the original audio URL cached in Redux for this response, we should use it.
        // However, currently we only have the VERY LAST response's audio URL in `audioUrl`.
        // If `lastBotMessage` is indeed the last response, we can use `audioUrl`.
        let audioToPlay = null;
        if (response && lastBotMessage?.text === response) {
          audioToPlay = audioUrl;
        }

        // Ensure conversation stays active so it restarts after speaking
        isConversationActive.current = true;

        if (audioToPlay) {
           playAudioResponse(audioToPlay, textToRepeat);
        } else {
           // If we don't have audio to replay, just restart listening quietly
           // or maybe play a generic "I didn't hear you" sound if you had one.
           // For now, just restart listening.
           startListening();
        }
      }, 4000);

      return () => clearTimeout(initialSilenceTimer);
    }

    // 2. End-of-Speech Timeout: If speech pauses for 2.5 seconds
    const pauseTimer = setTimeout(() => {
      SpeechRecognition.stopListening();
    }, 2500);

    return () => clearTimeout(pauseTimer);
  }, [transcript, listening, messages]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playAudioResponse = (audioUrl, text) => {
    // STRICT: Ensure Mic is OFF before playing
    console.log("Mic OFF");
    SpeechRecognition.stopListening();
    
    console.log("Speaking message:", text);
    setIsPlayingAudio(true);

    if (!audioUrl) {
      console.error("No audio URL provided for response:", text);
      setIsPlayingAudio(false);
      // Wait a moment before restarting listening so it doesn't loop instantly on error
      setTimeout(() => {
        if (isConversationActive.current) {
          startListening();
        }
      }, 1000);
      return;
    }

    const audio = playbackAudioRef.current;
    audio.src = audioUrl;

    // Define the handler so we can remove it later
    const handleEnded = () => {
      console.log("Speaker OFF");
      setIsPlayingAudio(false);
      // Remove listener to avoid stacking
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      
      // Force start listening after audio ends - THE CONTINUOUS LOOP
      if (isConversationActive.current) {
        startListening();
      }
    };

    const handleError = (e) => {
      console.error("Error playing audio:", e);
      console.log("Speaker OFF (Error)");
      setIsPlayingAudio(false);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      
      // If audio fails, just restart listening
      if (isConversationActive.current) {
          startListening();
      }
    };

    // Add listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audio.play().catch((e) => {
      handleError(e);
    });
  };

  // Create a persistent Audio object for iOS compatibility
  // This is required because iOS blocks dynamic audio creation
  const playbackAudioRef = useRef(new Audio());

  const handleLanguageSelect = (selectedLang) => {
    // Unlock AudioContext for iOS immediately on user interaction
    const unlockAudio = () => {
      const audio = playbackAudioRef.current;
      audio.src =
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjYwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAADFMYXZjNTYuNjAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAD/84TTOHWWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEz2ZMmMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg=="; // Silent MP3 for better compatibility
      
      // Play and immediately pause to "unlock" the audio element on iOS
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch((e) => console.log("Audio unlock failed", e));
    };
    unlockAudio();

    setLanguage(selectedLang);
    setIsLanguageSelected(true);

    // Enable conversation so audio playback triggers listening on completion
    isConversationActive.current = true;
    isUserStartedRef.current = true;

    // Convert full language code to short code for API if needed
    // 'gu-IN' -> 'gu', 'hi-IN' -> 'hi', 'en-IN' -> 'en'
    const shortLang = selectedLang.split("-")[0];

    dispatch(initiateChat({ start: true, language: shortLang }));
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: text,
        timestamp: new Date(),
      },
    ]);

    dispatch(initiateChat({ text }));
    resetTranscript();
  };

  const isConversationActive = useRef(false);

  const startListening = () => {
    // STRICT: Ensure Audio is OFF before listening
    playbackAudioRef.current.pause();
    playbackAudioRef.current.currentTime = 0;
    setIsPlayingAudio(false);

    // iOS Safari requires a user interaction to unlock speech synthesis.
    // We play a silent utterance when the user manually clicks "Start".
    // This allows subsequent programmatic speech (from the bot) to work.
    console.log("start button pressed");
    // Removed legacy speech synthesis hack because we use persistent Audio object now.

    resetTranscript();
    isUserStartedRef.current = true;
    isConversationActive.current = true;
    setErrorMessage("");
    console.log("Mic ON");
    try {
      SpeechRecognition.startListening({ continuous: continuous, language: language });
    } catch (e) {
      console.error("startListening failed:", e);
      setErrorMessage(
        "Could not start speech recognition. Check microphone permissions or try a Chromium-based browser."
      );
    }
  };

  const stopListening = () => {
    console.log("Mic OFF (Manual Stop)");
    isConversationActive.current = false;
    SpeechRecognition.stopListening();
    
    // Also stop audio if playing
    playbackAudioRef.current.pause();
    playbackAudioRef.current.currentTime = 0;
    setIsPlayingAudio(false);

    // If stopped manually and no transcript was captured
    if (isUserStartedRef.current && !transcript) {
      isUserStartedRef.current = false;
      // Optional: You could show a toast here, but the alert in useEffect might be enough
      // keeping it clean for manual stops to avoid double alerts if the timer also fired
    }
  };

  const requestMicPermission = async () => {
    setErrorMessage("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("getUserMedia not supported by this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop tracks — this was only to trigger the permission prompt
      stream.getTracks().forEach((t) => t.stop());
      setPermissionGranted(true);
      // Optionally start listening right away
      startListening();
    } catch (err) {
      console.error("Microphone permission denied", err);
      setErrorMessage("Microphone permission denied. Please allow microphone access.");
      setPermissionGranted(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative">
      <Card className="w-full max-w-2xl h-[85vh] md:h-[800px] flex flex-col border-slate-400 overflow-hidden bg-white">
        {/* Header */}
        <div className="border-b border-slate-400 p-2 md:p-4 flex items-center justify-between bg-gray-200 z-10">
          <h1 className="text-xl font-bold flex gap-2 text-slate-900">
   Dr.Sapan ios test 2
          </h1>
          <p>
             {listening && !isPlayingAudio && (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="text-sm text-slate-500 italic animate-pulse font-medium">
                    {transcript || "Listening..."}
                  </div>
                  <div className="flex items-center gap-1.5 h-8">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-blue-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
          </p>

          <div className="flex items-center gap-3"></div>
        </div>

        {/* Chat Area */}
        <div className="flex-1  overflow-y-auto bg-slate-50/30 p-1 md:p-2 space-y-6 scroll-smooth relative">
          {!isLanguageSelected ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                   
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Welcome to Dr. Sapan Shah's AI Voicebot
                </h2>
                <p className="text-slate-500">
                  Please select your preferred language to start chatting
                </p>
              </div>

              <div className="grid grid-cols-1 w-full max-w-xs gap-4">
                <Button
                  onClick={() => handleLanguageSelect("gu-IN")}
                  variant="outline"
                  className="h-16 text-lg font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all justify-start px-8 shadow-sm"
                >
                  <span className="mr-4 text-2xl">🇮🇳</span>
                  Gujarati (ગુજરાતી)
                </Button>

                <Button
                  onClick={() => handleLanguageSelect("hi-IN")}
                  variant="outline"
                  className="h-16 text-lg font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all justify-start px-8 shadow-sm"
                >
                  <span className="mr-4 text-2xl">🇮🇳</span>
                  Hindi (हिंदी)
                </Button>

                <Button
                  onClick={() => handleLanguageSelect("en-IN")}
                  variant="outline"
                  className="h-16 text-lg font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all justify-start px-8 shadow-sm"
                >
                  <span className="mr-4 text-2xl"></span>
                  English
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-1 max-w-[85%] md:max-w-[75%] ${
                    msg.type === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-1 border border-slate-200">
                    <AvatarFallback
                      className={`${
                        msg.type === "bot"
                          ? "bg-white text-blue-600"
                          : "bg-blue-600 text-white"
                      } text-xs shadow-sm`}
                    >
                      {msg.type === "bot" ? "AI" : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div
                      className={`border p-2 rounded-xl  text-sm md:text-base ${
                        msg.type === "bot"
                          ? "bg-white border-slate-100 rounded-tl-sm text-slate-700"
                          : "bg-blue-600 border-blue-600 rounded-tr-sm text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-[10px] text-slate-400 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 max-w-[85%]">
                  <Avatar className="h-8 w-8 mt-1 border border-slate-200">
                    <AvatarFallback className="bg-white text-blue-600 text-xs shadow-sm">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                </div>
              )}

              {/* Visualizer / Transcript Preview - Hide if playing audio to avoid confusion */}
              {/* {listening && !isPlayingAudio && (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="text-sm text-slate-500 italic animate-pulse font-medium">
                    {transcript || "Listening..."}
                  </div>
                  <div className="flex items-center gap-1.5 h-8">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-blue-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )} */}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer Controls - Only show when language is selected */}
        {isLanguageSelected && (
          <div className="py-2  border-t border-slate-400 flex items-center justify-center gap-8">
            {/* Error / Permission message */}
            {errorMessage && (
              <div className="absolute left-4 bottom-20 bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm">
                {errorMessage}
              </div>
            )}
            <Button
              size="lg"
              onClick={startListening}
              disabled={listening || loading}
              className={`w-36 h-12 text-base text-white font-medium border-2 border-white  transition-all ${
                listening
                  ? "opacity-50"
                  : "bg-green-600 hover:bg-white hover:text-green-600 hover:border hover:border-green-600 cursor-pointer"
              }`}
            >
              <Pipette className="mr-2 h-5 w-5" /> Start
            </Button>

            <Button
              size="lg"
              onClick={stopListening}
              disabled={!listening || loading}
              className={`w-36 h-12 text-base bg-red-600 text-white font-medium border-2 border-white  transition-all ${
                !listening
                  ? "opacity-50"
                  : "bg-red-600 hover:bg-white hover:text-red-600 hover:border hover:border-red-600 cursor-pointer"
              }`}
            >
              <Pause className="mr-2 h-5 w-5 fill-current" /> Stop
            </Button>

            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Continuous</label>
                <Button
                  size="sm"
                  onClick={() => setContinuous((c) => !c)}
                  variant={continuous ? "default" : "ghost"}
                  className={`h-8 ${continuous ? 'bg-green-600 text-white' : 'bg-white text-slate-700'} px-3`}
                >
                  {continuous ? "On" : "Off"}
                </Button>
              </div>

              {!permissionGranted && (
                <Button size="sm" onClick={requestMicPermission} className="h-8 bg-yellow-500 text-white px-3">
                  Allow Microphone
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
