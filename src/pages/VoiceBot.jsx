import { useState, useEffect, useRef } from "react";
import { User, Loader2, Pipette, Pause, HospitalIcon } from "lucide-react";
import { Card } from "@/components/ui/shadcn/card";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { useDispatch, useSelector } from "react-redux";
import { initiateChat } from "../store/voicebotSlice";
import "regenerator-runtime/runtime";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
  CancellationReason,
} from "microsoft-cognitiveservices-speech-sdk";

// iOS Detection - Apple forces all browsers to use WebKit
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

export default function VoiceBot() {
  const [language, setLanguage] = useState("gu-IN");
  const [messages, setMessages] = useState([]);
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const dispatch = useDispatch();
  const { response, audioUrl, loading, error } = useSelector(
    (state) => state.voicebot,
  );

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognizerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isUserStartedRef = useRef(false);
  const isConversationActive = useRef(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const shouldIgnoreInputRef = useRef(false);
  const playbackAudioRef = useRef(new Audio());

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Effect to handle new responses from Redux and speak them
  useEffect(() => {
    console.log("📥 ===== REDUX STATE UPDATE =====");
    console.log("📥 Loading:", loading);
    console.log("📥 Response:", response);
    console.log("📥 Audio URL:", audioUrl);
    console.log("📥 Error:", error);
    
    if (!loading && response) {
      const lastMessage = messages[messages.length - 1];

      const isWelcome = messages.length === 0;
      const followsUser = lastMessage?.type === "user";
      const isDuplicate =
        lastMessage?.type === "bot" && lastMessage.text === response;

      console.log("🔍 ===== MESSAGE ANALYSIS =====");
      console.log("🔍 Is Welcome:", isWelcome);
      console.log("🔍 Follows User:", followsUser);
      console.log("🔍 Is Duplicate:", isDuplicate);
      console.log("🔍 Message Count:", messages.length);
      console.log("🔍 Last Message Type:", lastMessage?.type);

      if ((isWelcome || followsUser) && !isDuplicate) {
        console.log("✅ Adding bot message to chat");
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
      } else {
        console.log("⏭️ Skipping message (duplicate or invalid state)");
      }
    }

    // Lock input during API loading
    if (loading) {
      console.log("🔒 Input LOCKED - API is loading");
      shouldIgnoreInputRef.current = true;
    }
  }, [response, audioUrl, loading]);

  const playAudioResponse = (audioUrl, text) => {
    console.log("🔊 ===== AUDIO PLAYBACK START =====");
    console.log("🔊 Speaking message:", text);
    console.log("🔊 Audio URL:", audioUrl);
    console.log("🔊 Current time:", new Date().toISOString());
    
    setIsPlayingAudio(true);
    shouldIgnoreInputRef.current = true;
    console.log("🔒 Input LOCKED - Bot is speaking");

    // Clear any lingering transcript from before audio started
    setTranscript("");

    if (!audioUrl) {
      console.error("❌ No audio URL provided for response:", text);
      setIsPlayingAudio(false);
      shouldIgnoreInputRef.current = false;
      console.log("🔓 Input UNLOCKED - No audio URL");
      return;
    }

    const audio = playbackAudioRef.current;
    audio.src = audioUrl;
    console.log("🔊 Audio source set:", audioUrl);
    console.log("🔊 Audio element state:", {
      readyState: audio.readyState,
      paused: audio.paused,
      ended: audio.ended,
    });

    // Define the handler so we can remove it later
    const handleEnded = () => {
      console.log("🔊 ===== AUDIO PLAYBACK ENDED =====");
      console.log("🔊 Speaker OFF - Audio playback completed");
      console.log("🔊 End time:", new Date().toISOString());
      setIsPlayingAudio(false);

      // Small delay before re-enabling input to avoid picking up end of audio
      setTimeout(() => {
        shouldIgnoreInputRef.current = false;
        console.log("🔓 Input UNLOCKED - Ready for user speech");
        console.log("🎤 Microphone is now actively listening for user input");
        console.log("🔓 Unlock time:", new Date().toISOString());
      }, 300);

      // Remove listeners
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };

    const handleError = (e) => {
      console.error("❌ ===== AUDIO PLAYBACK ERROR =====");
      console.error("❌ Error event:", e);
      console.error("❌ Error details:", e.message || e);
      console.error("❌ Audio element state:", {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        error: audio.error,
      });
      console.log("🔊 Speaker OFF (Error)");
      setIsPlayingAudio(false);
      shouldIgnoreInputRef.current = false;
      console.log("🔓 Input UNLOCKED - Audio error occurred");
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };

    // Add listeners
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    console.log("▶️ Starting audio playback...");
    audio.play()
      .then(() => {
        console.log("✅ Audio playback started successfully");
        console.log("✅ Audio duration:", audio.duration, "seconds");
      })
      .catch((e) => {
        console.error("❌ Audio play() promise rejected:", e);
        handleError(e);
      });
  };

  const handleLanguageSelect = async (selectedLang) => {
    console.log("🌍 ===== LANGUAGE SELECTION START =====");
    console.log("🌍 Selected language:", selectedLang);
    console.log("🌍 Device is iOS:", isIOS());
    console.log("🌍 User agent:", navigator.userAgent);
    console.log("🌍 Time:", new Date().toISOString());
    
    // Unlock AudioContext for iOS immediately on user interaction
    const unlockAudio = () => {
      console.log("🔓 Attempting to unlock audio for iOS/Safari...");
      const audio = playbackAudioRef.current;
      const silentAudioData = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjYwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAADFMYXZjNTYuMAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAD/84TTOHWWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEz2ZMmMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg==";
      
      audio.src = silentAudioData;
      console.log("🔓 Silent audio source set");

      audio.play()
        .then(() => {
          console.log("✅ Audio unlocked successfully");
          audio.pause();
          audio.currentTime = 0;
          console.log("✅ Audio context ready for playback");
        })
        .catch((e) => {
          console.warn("⚠️ Audio unlock failed:", e.message || e);
          console.warn("⚠️ This is OK on desktop browsers");
        });
    };
    unlockAudio();

    setLanguage(selectedLang);
    setIsLanguageSelected(true);
    isConversationActive.current = true;
    isUserStartedRef.current = true;

    const shortLang = selectedLang.split("-")[0];
    console.log("🌍 Short language code for API:", shortLang);

    // Start listening FIRST to secure the stream
    console.log("🎤 Starting microphone before chat initiation...");
    await startListening(selectedLang);

    // Then initiate chat (which might play welcome audio)
    console.log("💬 Initiating chat with backend...");
    console.log("💬 Dispatch payload:", { start: true, language: shortLang });
    dispatch(initiateChat({ start: true, language: shortLang }));
    console.log("🌍 ===== LANGUAGE SELECTION COMPLETE =====");
  };

  const handleSendMessage = (text) => {
    console.log("📤 ===== SENDING MESSAGE =====");
    console.log("📤 Message text:", text);
    console.log("📤 Text length:", text?.length);
    console.log("📤 Time:", new Date().toISOString());
    
    if (!text.trim()) {
      console.log("⏭️ Empty message, skipping");
      return;
    }

    // LOCK INPUT IMMEDIATELY
    shouldIgnoreInputRef.current = true;
    console.log("🔒 Input LOCKED - Sending message to API");

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      console.log("📤 Current messages count:", prev.length);
      console.log("📤 Adding user message:", newMessage);
      return [...prev, newMessage];
    });
    console.log("✅ User message added to chat");

    console.log("🚀 Dispatching message to Redux...");
    console.log("🚀 Dispatch payload:", { text });
    dispatch(initiateChat({ text }));
    setTranscript("");
    console.log("📤 ===== MESSAGE SENT =====");
  };

  const startListening = async (forceLanguage) => {
    console.log("🎤 ===== START LISTENING =====");
    console.log("🎤 Force language:", forceLanguage);
    console.log("🎤 Current language:", language);
    console.log("🎤 Time:", new Date().toISOString());
    
    // Clean up existing recognizer
    if (recognizerRef.current) {
      console.log("🧹 Cleaning up existing recognizer...");
      try {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
        console.log("✅ Old recognizer cleaned up");
      } catch (e) {
        console.warn("⚠️ Error cleaning up old recognizer:", e);
      }
      recognizerRef.current = null;
    }

    // Azure Configuration
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

    console.log("🔑 ===== AZURE CREDENTIALS CHECK =====");
    console.log("🔑 Speech Key exists:", !!speechKey);
    console.log("🔑 Speech Key length:", speechKey?.length || 0);
    console.log("🔑 Speech Key preview:", speechKey ? `${speechKey.substring(0, 8)}...` : "NONE");
    console.log("🔑 Speech Region:", speechRegion);

    if (!speechKey || !speechRegion) {
      console.error("❌ ===== AZURE CREDENTIALS MISSING =====");
      console.error("❌ VITE_AZURE_SPEECH_KEY:", speechKey ? "EXISTS" : "MISSING");
      console.error("❌ VITE_AZURE_SPEECH_REGION:", speechRegion ? "EXISTS" : "MISSING");
      console.error("❌ Check your .env file!");
      console.error("❌ Required format:");
      console.error("   VITE_AZURE_SPEECH_KEY=your_key_here");
      console.error("   VITE_AZURE_SPEECH_REGION=your_region_here");
      setErrorMessage("Azure configuration missing. Please check .env file.");
      return;
    }

    try {
      const currentLang = forceLanguage || language;
      console.log("🌍 Using language:", currentLang);
      
      console.log("⚙️ Creating SpeechConfig...");
      const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
      speechConfig.speechRecognitionLanguage = currentLang;
      console.log("⚙️ Speech recognition language set to:", currentLang);
      
      // Add timeout settings
      console.log("⚙️ Setting timeout configurations...");
      speechConfig.setProperty(
        "SpeechServiceConnection_InitialSilenceTimeoutMs",
        "15000"
      );
      speechConfig.setProperty(
        "SpeechServiceConnection_EndSilenceTimeoutMs",
        "15000"
      );
      console.log("⚙️ Initial silence timeout: 15000ms");
      console.log("⚙️ End silence timeout: 15000ms");
      console.log("✅ SpeechConfig created successfully");

      console.log("🎙️ Creating AudioConfig from default microphone...");
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      console.log("✅ AudioConfig created successfully");

      console.log("🎤 Creating SpeechRecognizer...");
      const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;
      console.log("✅ SpeechRecognizer instance created");
      console.log("✅ Recognizer object:", recognizer);

      // Event Handlers
      console.log("📋 ===== SETTING UP EVENT HANDLERS =====");
      
      recognizer.recognizing = (s, e) => {
        const timestamp = new Date().toISOString();
        const isIgnored = shouldIgnoreInputRef.current;
        console.log("🎤 ===== RECOGNIZING EVENT =====");
        console.log("🎤 Time:", timestamp);
        console.log("🎤 Text:", e.result.text);
        console.log("🎤 Is Ignored:", isIgnored);
        console.log("🎤 Reason:", e.result.reason);
        console.log("🎤 Result ID:", e.result.resultId);
        
        if (shouldIgnoreInputRef.current) {
          console.log("🔇 ❌ INPUT IGNORED - Bot is busy");
          console.log("🔇 Ignored text:", e.result.text);
          return;
        }
        console.log(`🎤 ✅ RECOGNIZING ACCEPTED: ${e.result.text}`);
        setTranscript(e.result.text);
      };

      recognizer.recognized = (s, e) => {
        const timestamp = new Date().toISOString();
        const isIgnored = shouldIgnoreInputRef.current;
        console.log("✅ ===== RECOGNIZED EVENT =====");
        console.log("✅ Time:", timestamp);
        console.log("✅ Text:", e.result.text);
        console.log("✅ Reason:", e.result.reason);
        console.log("✅ Reason String:", ResultReason[e.result.reason]);
        console.log("✅ Is Ignored:", isIgnored);
        console.log("✅ Result ID:", e.result.resultId);

        if (shouldIgnoreInputRef.current) {
          console.log("🔇 ❌ RECOGNIZED IGNORED - Bot is busy");
          console.log("🔇 Ignored text:", e.result.text);
          return;
        }

        if (e.result.reason === ResultReason.RecognizedSpeech) {
          console.log(`✅ ✅ SPEECH RECOGNIZED SUCCESSFULLY`);
          console.log("✅ Final text:", e.result.text);
          if (e.result.text && e.result.text.trim()) {
            console.log("📤 Sending recognized text to backend...");
            handleSendMessage(e.result.text);
            console.log("🎤 Microphone remains ON for continuous conversation");
          } else {
            console.log("⏭️ Empty recognized text, skipping");
          }
        } else if (e.result.reason === ResultReason.NoMatch) {
          console.log("❌ ===== NO MATCH =====");
          console.log("❌ Speech could not be recognized");
          console.log("❌ NoMatch reason:", e.result.reason);
          console.log("❌ Result details:", e.result);
          setTranscript("");
        }
      };

      recognizer.canceled = (s, e) => {
        console.log("⚠️ ===== CANCELED EVENT =====");
        console.log("⚠️ Time:", new Date().toISOString());
        console.log("⚠️ Cancellation Reason:", e.reason);
        console.log("⚠️ Cancellation Reason String:", CancellationReason[e.reason]);
        console.log("⚠️ Error Code:", e.errorCode);
        console.log("⚠️ Error Details:", e.errorDetails);
        console.log("⚠️ Session ID:", e.sessionId);
        console.log("⚠️ Full Event Object:", e);
        
        if (e.reason === CancellationReason.Error) {
          console.error("❌ ===== SPEECH RECOGNITION ERROR =====");
          console.error("❌ Error Code:", e.errorCode);
          console.error("❌ Error Details:", e.errorDetails);
          
          // Check for specific error types
          if (e.errorDetails?.includes("Quota exceeded")) {
            console.error("🚨 ===== QUOTA EXCEEDED =====");
            console.error("🚨 Your Azure Speech Service quota has been exceeded");
            console.error("🚨 Solutions:");
            console.error("   1. Upgrade to S0 Standard tier (Recommended)");
            console.error("   2. Wait for quota reset (Free tier only)");
            console.error("   3. Create new resource (Temporary)");
            setErrorMessage("Azure Speech quota exceeded. Please upgrade to Standard tier.");
          } else if (e.errorDetails?.includes("authentication")) {
            console.error("🔐 ===== AUTHENTICATION ERROR =====");
            console.error("🔐 Check your Azure Speech Key");
            console.error("🔐 Check your Azure Region");
            setErrorMessage("Authentication failed. Please check Azure credentials.");
          } else if (e.errorDetails?.includes("network")) {
            console.error("🌐 ===== NETWORK ERROR =====");
            console.error("🌐 Check your internet connection");
            console.error("🌐 Check firewall settings");
            setErrorMessage("Network connection failed. Please check your connection.");
          } else {
            console.error("❓ ===== UNKNOWN ERROR =====");
            console.error("❓ Error details:", e.errorDetails);
            setErrorMessage(`Speech error: ${e.errorDetails || "Unknown error"}`);
          }
          
          console.error("❌ Possible causes:");
          console.error("   - Invalid Azure credentials");
          console.error("   - Network/CORS issues");
          console.error("   - Microphone permission denied");
          console.error("   - Region mismatch");
          console.error("   - Service quota exceeded");
        }
        setListening(false);
      };

      recognizer.sessionStarted = (s, e) => {
        console.log("🎙️ ===== SESSION STARTED =====");
        console.log("🎙️ Time:", new Date().toISOString());
        console.log("🎙️ Session ID:", e.sessionId);
        console.log("🎙️ Mic is ON and ready to listen");
        console.log("🎙️ Language:", language);
        console.log("🎙️ Region:", speechRegion);
        setListening(true);
        setErrorMessage("");
        isUserStartedRef.current = true;
        isConversationActive.current = true;
      };

      recognizer.sessionStopped = (s, e) => {
        console.log("🛑 ===== SESSION STOPPED =====");
        console.log("🛑 Time:", new Date().toISOString());
        console.log("🛑 Session ID:", e.sessionId);
        console.log("🛑 Mic is OFF");
        setListening(false);
      };

      recognizer.speechStartDetected = (s, e) => {
        console.log("🗣️ ===== SPEECH START DETECTED =====");
        console.log("🗣️ Time:", new Date().toISOString());
        console.log("🗣️ User started speaking");
        console.log("🗣️ Offset:", e.offset);
      };

      recognizer.speechEndDetected = (s, e) => {
        console.log("🤫 ===== SPEECH END DETECTED =====");
        console.log("🤫 Time:", new Date().toISOString());
        console.log("🤫 User stopped speaking");
        console.log("🤫 Offset:", e.offset);
      };

      console.log("📋 All event handlers set up successfully");

      // Start continuous recognition
      console.log("▶️ ===== STARTING CONTINUOUS RECOGNITION =====");
      console.log("▶️ Time:", new Date().toISOString());
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log("✅ ===== RECOGNITION STARTED SUCCESSFULLY =====");
          console.log("✅ Time:", new Date().toISOString());
          console.log("✅ Microphone is now actively listening");
          console.log("✅ Language:", currentLang);
          console.log("✅ Region:", speechRegion);
          console.log("✅ Session is ready for speech input");
        },
        (err) => {
          console.error("❌ ===== FAILED TO START RECOGNITION =====");
          console.error("❌ Time:", new Date().toISOString());
          console.error("❌ Error:", err);
          console.error("❌ Error Type:", typeof err);
          console.error("❌ Error String:", String(err));
          console.error("❌ Please check:");
          console.error("   - Microphone permissions");
          console.error("   - Azure credentials");
          console.error("   - Internet connection");
          setErrorMessage("Failed to start microphone. Please try again.");
        },
      );
    } catch (error) {
      console.error("❌ ===== EXCEPTION IN START LISTENING =====");
      console.error("❌ Time:", new Date().toISOString());
      console.error("❌ Error:", error);
      console.error("❌ Error Name:", error.name);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Error Stack:", error.stack);
      setErrorMessage(`Failed to initialize: ${error.message}`);
    }
  };

  const stopListening = (disableConversation = true) => {
    console.log("🛑 ===== STOP LISTENING =====");
    console.log("🛑 Time:", new Date().toISOString());
    console.log("🛑 Disable conversation:", disableConversation);
    console.log("🛑 Stopping microphone...");
    
    if (disableConversation) {
      isConversationActive.current = false;
      console.log("🛑 Conversation marked as inactive");
    }

    if (recognizerRef.current) {
      console.log("🛑 Stopping continuous recognition...");
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        console.log("✅ Recognition stopped successfully");
        console.log("✅ Time:", new Date().toISOString());
        setListening(false);
      });
    } else {
      console.log("⚠️ No recognizer to stop");
    }

    // Also stop audio if playing
    if (playbackAudioRef.current) {
      console.log("🛑 Stopping audio playback...");
      playbackAudioRef.current.pause();
      playbackAudioRef.current.currentTime = 0;
      console.log("✅ Audio stopped");
    }
    
    setIsPlayingAudio(false);
    shouldIgnoreInputRef.current = false;
    setTranscript("");
    console.log("🔓 Input UNLOCKED - Stop button pressed");
    console.log("🛑 ===== STOP COMPLETE =====");
  };

  // Log component mount
  useEffect(() => {
    console.log("🎬 ===== VOICEBOT COMPONENT MOUNTED =====");
    console.log("🎬 Time:", new Date().toISOString());
    console.log("🎬 Initial language:", language);
    console.log("🎬 Device info:", {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isIOS: isIOS(),
      language: navigator.language,
      languages: navigator.languages,
    });
    console.log("🎬 Environment check:");
    console.log("   - VITE_AZURE_SPEECH_KEY:", import.meta.env.VITE_AZURE_SPEECH_KEY ? "SET" : "NOT SET");
    console.log("   - VITE_AZURE_SPEECH_REGION:", import.meta.env.VITE_AZURE_SPEECH_REGION || "NOT SET");
    
    return () => {
      console.log("🎬 ===== VOICEBOT COMPONENT UNMOUNTING =====");
      console.log("🎬 Time:", new Date().toISOString());
      if (recognizerRef.current) {
        console.log("🧹 Cleaning up recognizer on unmount...");
        try {
          recognizerRef.current.stopContinuousRecognitionAsync();
          recognizerRef.current.close();
          console.log("✅ Recognizer cleaned up successfully");
        } catch (e) {
          console.warn("⚠️ Error during cleanup:", e);
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative">
      <Card className="w-full max-w-2xl h-[85vh] md:h-[800px] flex flex-col border-blue-600 overflow-hidden bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-400 p-2 md:p-4 flex items-center justify-between bg-blue-600 z-10">
          <h1 className="text-md md:text-xl font-bold flex gap-2 text-white">
            Dr. Sapan Shah's AI Voice Bot
          </h1>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {listening && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">
                  {isPlayingAudio ? "Bot Speaking" : "Listening"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-1 md:p-2 space-y-6 scroll-smooth relative">
          {!isLanguageSelected ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <HospitalIcon size={50} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Welcome to Dr. Sapan Shah's AI Voicebot
                </h2>
                <p className="text-slate-500">
                  Please select your preferred language to start chatting.
                </p>
              </div>

              <div className="grid grid-cols-1 w-full max-w-xs gap-4">
                <Button
                  onClick={() => {
                    console.log("🌍 English button clicked");
                    handleLanguageSelect("en-IN");
                  }}
                  variant="outline"
                  className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8"
                >
                  English
                </Button>
                <Button
                  onClick={() => {
                    console.log("🌍 Gujarati button clicked");
                    handleLanguageSelect("gu-IN");
                  }}
                  variant="outline"
                  className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8"
                >
                  ગુજરાતી
                </Button>

                <Button
                  onClick={() => {
                    console.log("🌍 Hindi button clicked");
                    handleLanguageSelect("hi-IN");
                  }}
                  variant="outline"
                  className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8"
                >
                  हिंदी
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
                      {msg.type === "bot" ? (
                        <HospitalIcon className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div
                      className={`border p-2 rounded-xl text-sm md:text-base ${
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
                  <Avatar className="h-8 w-8 mt-1 border justify-center items-center border-slate-200">
                    <HospitalIcon className="h-4 w-4 text-blue-600" />
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

              {/* Visualizer / Transcript Preview */}
              {listening && !isPlayingAudio && !loading && (
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

              {/* Bot speaking indicator */}
              {isPlayingAudio && (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="text-sm text-blue-600 font-medium">
                    🔊 Bot is speaking...
                  </div>
                  <div className="text-xs text-slate-400">
                    (Microphone active, waiting for response to finish)
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer Controls */}
        {isLanguageSelected && (
          <div className="py-2 border-t border-slate-400 flex items-center justify-center gap-8">
            {errorMessage && (
              <div className="absolute left-4 bottom-20 bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm max-w-md">
                {errorMessage}
              </div>
            )}

            <Button
              size="lg"
              onClick={() => {
                console.log("🎤 ===== SPEAK BUTTON CLICKED =====");
                console.log("🎤 Time:", new Date().toISOString());
                isConversationActive.current = true;
                startListening();
              }}
              disabled={listening || loading}
              className={`w-36 h-12 text-base text-white font-medium border-2 border-white transition-all ${
                listening
                  ? "opacity-50 cursor-not-allowed bg-green-600"
                  : "bg-green-600 hover:bg-white hover:text-green-600 hover:border hover:border-green-600 cursor-pointer"
              }`}
            >
              <Pipette className="mr-2 h-5 w-5" />
              Speak
            </Button>

            <Button
              size="lg"
              onClick={() => {
                console.log("🛑 ===== STOP BUTTON CLICKED =====");
                console.log("🛑 Time:", new Date().toISOString());
                stopListening();
              }}
              disabled={!listening}
              className={`w-36 h-12 text-base font-medium border-2 border-white transition-all ${
                !listening
                  ? "opacity-50 cursor-not-allowed bg-red-600 text-white"
                  : "bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border hover:border-red-600 cursor-pointer"
              }`}
            >
              <Pause className="mr-2 h-5 w-5 fill-current" /> Stop
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { User, Loader2, Pipette, Pause, HospitalIcon } from "lucide-react";
// import { Card } from "@/components/ui/shadcn/card";
// import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
// import { Button } from "@/components/ui/shadcn/button";
// import { useDispatch, useSelector } from "react-redux";
// import { initiateChat } from "../store/voicebotSlice";
// import "regenerator-runtime/runtime";
// import {
//   SpeechConfig,
//   AudioConfig,
//   SpeechRecognizer,
//   ResultReason,
//   CancellationReason,
// } from "microsoft-cognitiveservices-speech-sdk";

// // iOS Detection - Apple forces all browsers to use WebKit
// const isIOS = () => {
//   return (
//     /iPad|iPhone|iPod/.test(navigator.userAgent) ||
//     (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
//   );
// };

// export default function VoiceBot() {
//   const [language, setLanguage] = useState("gu-IN");
//   const [messages, setMessages] = useState([]);

//   const [isLanguageSelected, setIsLanguageSelected] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [permissionGranted, setPermissionGranted] = useState(false);

//   const dispatch = useDispatch();
//   const { response, audioUrl, loading, error } = useSelector(
//     (state) => state.voicebot,
//   );

//   const [transcript, setTranscript] = useState("");
//   const [listening, setListening] = useState(false);
//   const recognizerRef = useRef(null);

//   const messagesEndRef = useRef(null);
//   const isUserStartedRef = useRef(false);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, loading]);

//   // Effect to handle new responses from Redux and speak them
//   useEffect(() => {
//     console.log("📥 Redux State Update:", { loading, response, audioUrl });
    
//     if (!loading && response) {
//       const lastMessage = messages[messages.length - 1];

//       const isWelcome = messages.length === 0;
//       const followsUser = lastMessage?.type === "user";
//       const isDuplicate =
//         lastMessage?.type === "bot" && lastMessage.text === response;

//       console.log("🔍 Message Analysis:", {
//         isWelcome,
//         followsUser,
//         isDuplicate,
//         messageCount: messages.length,
//         lastMessageType: lastMessage?.type,
//       });

//       if ((isWelcome || followsUser) && !isDuplicate) {
//         console.log("✅ Adding bot message to chat");
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: Date.now().toString(),
//             type: "bot",
//             text: response,
//             timestamp: new Date(),
//           },
//         ]);

//         playAudioResponse(audioUrl, response);
//       } else {
//         console.log("⏭️ Skipping message (duplicate or invalid state)");
//       }
//     }

//     // Lock input during API loading
//     if (loading) {
//       console.log("🔒 Input LOCKED - API is loading");
//       shouldIgnoreInputRef.current = true;
//     }
//   }, [response, audioUrl, loading]);

//   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

//   // Ref to track if we should ignore input (API loading OR Bot speaking)
//   const shouldIgnoreInputRef = useRef(false);

//   const playAudioResponse = (audioUrl, text) => {
//     console.log("🔊 ===== AUDIO PLAYBACK START =====");
//     console.log("🔊 Speaking message:", text);
//     console.log("🔊 Audio URL:", audioUrl);
    
//     setIsPlayingAudio(true);
//     shouldIgnoreInputRef.current = true;
//     console.log("🔒 Input LOCKED - Bot is speaking");

//     // Clear any lingering transcript from before audio started
//     setTranscript("");

//     if (!audioUrl) {
//       console.error("❌ No audio URL provided for response:", text);
//       setIsPlayingAudio(false);
//       shouldIgnoreInputRef.current = false;
//       console.log("🔓 Input UNLOCKED - No audio URL");
//       return;
//     }

//     const audio = playbackAudioRef.current;
//     audio.src = audioUrl;
//     console.log("🔊 Audio source set:", audioUrl);

//     // Define the handler so we can remove it later
//     const handleEnded = () => {
//       console.log("🔊 ===== AUDIO PLAYBACK ENDED =====");
//       console.log("🔊 Speaker OFF - Audio playback completed");
//       setIsPlayingAudio(false);

//       // Small delay before re-enabling input to avoid picking up end of audio
//       setTimeout(() => {
//         shouldIgnoreInputRef.current = false;
//         console.log("🔓 Input UNLOCKED - Ready for user speech");
//         console.log("🎤 Microphone is now actively listening for user input");
//       }, 300);

//       // Remove listeners
//       audio.removeEventListener("ended", handleEnded);
//       audio.removeEventListener("error", handleError);
//     };

//     const handleError = (e) => {
//       console.error("❌ ===== AUDIO PLAYBACK ERROR =====");
//       console.error("❌ Error details:", e);
//       console.error("❌ Audio element:", audio);
//       console.log("🔊 Speaker OFF (Error)");
//       setIsPlayingAudio(false);
//       shouldIgnoreInputRef.current = false;
//       console.log("🔓 Input UNLOCKED - Audio error occurred");
//       audio.removeEventListener("ended", handleEnded);
//       audio.removeEventListener("error", handleError);
//     };

//     // Add listeners
//     audio.addEventListener("ended", handleEnded);
//     audio.addEventListener("error", handleError);

//     console.log("▶️ Starting audio playback...");
//     audio.play()
//       .then(() => {
//         console.log("✅ Audio playback started successfully");
//       })
//       .catch((e) => {
//         console.error("❌ Audio play() failed:", e);
//         handleError(e);
//       });
//   };

//   // Create a persistent Audio object for iOS compatibility
//   const playbackAudioRef = useRef(new Audio());

//   const handleLanguageSelect = async (selectedLang) => {
//     console.log("🌍 ===== LANGUAGE SELECTION =====");
//     console.log("🌍 Selected language:", selectedLang);
//     console.log("🌍 Device is iOS:", isIOS());
    
//     // Unlock AudioContext for iOS immediately on user interaction
//     const unlockAudio = () => {
//       console.log("🔓 Attempting to unlock audio for iOS...");
//       const audio = playbackAudioRef.current;
//       audio.src =
//         "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjYwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAADFMYXZjNTYuMAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAD/84TTOHWWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEz2ZMmMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg==";

//       audio
//         .play()
//         .then(() => {
//           console.log("✅ Audio unlocked successfully");
//           audio.pause();
//           audio.currentTime = 0;
//         })
//         .catch((e) => {
//           console.warn("⚠️ Audio unlock failed:", e);
//         });
//     };
//     unlockAudio();

//     setLanguage(selectedLang);
//     setIsLanguageSelected(true);
//     isConversationActive.current = true;
//     isUserStartedRef.current = true;

//     const shortLang = selectedLang.split("-")[0];
//     console.log("🌍 Short language code for API:", shortLang);

//     // Start listening FIRST to secure the stream
//     console.log("🎤 Starting microphone before chat initiation...");
//     await startListening(selectedLang);

//     // Then initiate chat (which might play welcome audio)
//     console.log("💬 Initiating chat with backend...");
//     dispatch(initiateChat({ start: true, language: shortLang }));
//   };

//   const handleSendMessage = (text) => {
//     console.log("📤 ===== SENDING MESSAGE =====");
//     console.log("📤 Message text:", text);
    
//     if (!text.trim()) {
//       console.log("⏭️ Empty message, skipping");
//       return;
//     }

//     // LOCK INPUT IMMEDIATELY
//     shouldIgnoreInputRef.current = true;
//     console.log("🔒 Input LOCKED - Sending message to API");

//     setMessages((prev) => [
//       ...prev,
//       {
//         id: Date.now().toString(),
//         type: "user",
//         text: text,
//         timestamp: new Date(),
//       },
//     ]);
//     console.log("✅ User message added to chat");

//     console.log("🚀 Dispatching message to Redux...");
//     dispatch(initiateChat({ text }));
//     setTranscript("");
//   };

//   const isConversationActive = useRef(false);

//   const startListening = async (forceLanguage) => {
//     console.log("🎤 ===== START LISTENING =====");
//     console.log("🎤 Force language:", forceLanguage);
//     console.log("🎤 Current language:", language);
    
//     // Clean up existing recognizer
//     if (recognizerRef.current) {
//       console.log("🧹 Cleaning up existing recognizer...");
//       try {
//         recognizerRef.current.stopContinuousRecognitionAsync();
//         recognizerRef.current.close();
//         console.log("✅ Old recognizer cleaned up");
//       } catch (e) {
//         console.warn("⚠️ Error cleaning up old recognizer:", e);
//       }
//       recognizerRef.current = null;
//     }

//     // Azure Configuration
//     const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
//     const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

//     console.log("🔑 ===== AZURE CREDENTIALS CHECK =====");
//     console.log("🔑 Speech Key exists:", !!speechKey);
//     console.log("🔑 Speech Key length:", speechKey?.length || 0);
//     console.log("🔑 Speech Region:", speechRegion);

//     if (!speechKey || !speechRegion) {
//       console.error("❌ Azure Speech credentials missing!");
//       console.error("❌ VITE_AZURE_SPEECH_KEY:", speechKey ? "EXISTS" : "MISSING");
//       console.error("❌ VITE_AZURE_SPEECH_REGION:", speechRegion ? "EXISTS" : "MISSING");
//       setErrorMessage("Azure configuration missing. Please check .env file.");
//       return;
//     }

//     try {
//       const currentLang = forceLanguage || language;
//       console.log("🌍 Using language:", currentLang);
      
//       console.log("⚙️ Creating SpeechConfig...");
//       const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
//       speechConfig.speechRecognitionLanguage = currentLang;
      
//       // Add timeout settings
//       console.log("⚙️ Setting timeout configurations...");
//       speechConfig.setProperty(
//         "SpeechServiceConnection_InitialSilenceTimeoutMs",
//         "15000"
//       );
//       speechConfig.setProperty(
//         "SpeechServiceConnection_EndSilenceTimeoutMs",
//         "15000"
//       );
//       console.log("✅ SpeechConfig created successfully");

//       console.log("🎙️ Creating AudioConfig from default microphone...");
//       const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
//       console.log("✅ AudioConfig created successfully");

//       console.log("🎤 Creating SpeechRecognizer...");
//       const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
//       recognizerRef.current = recognizer;
//       console.log("✅ SpeechRecognizer created successfully");

//       // Event Handlers
//       console.log("📋 Setting up event handlers...");
      
//       recognizer.recognizing = (s, e) => {
//         const isIgnored = shouldIgnoreInputRef.current;
//         console.log("🎤 RECOGNIZING Event:", {
//           text: e.result.text,
//           isIgnored,
//           reason: e.result.reason,
//         });
        
//         if (shouldIgnoreInputRef.current) {
//           console.log("🔇 ❌ Ignored input (Bot busy):", e.result.text);
//           return;
//         }
//         console.log(`🎤 ✅ RECOGNIZING (accepted): ${e.result.text}`);
//         setTranscript(e.result.text);
//       };

//       recognizer.recognized = (s, e) => {
//         const isIgnored = shouldIgnoreInputRef.current;
//         console.log("✅ RECOGNIZED Event:", {
//           text: e.result.text,
//           reason: e.result.reason,
//           isIgnored,
//           reasonCode: ResultReason[e.result.reason],
//         });

//         if (shouldIgnoreInputRef.current) {
//           console.log("🔇 ❌ Ignored recognized (Bot busy):", e.result.text);
//           return;
//         }

//         if (e.result.reason === ResultReason.RecognizedSpeech) {
//           console.log(`✅ ✅ RECOGNIZED (accepted): ${e.result.text}`);
//           if (e.result.text && e.result.text.trim()) {
//             console.log("📤 Sending recognized text to backend...");
//             handleSendMessage(e.result.text);
//             // Mic stays ON - we don't stop listening
//           } else {
//             console.log("⏭️ Empty recognized text, skipping");
//           }
//         } else if (e.result.reason === ResultReason.NoMatch) {
//           console.log("❌ NOMATCH: Speech could not be recognized");
//           console.log("❌ NoMatch Details:", e.result);
//           setTranscript("");
//         }
//       };

//       recognizer.canceled = (s, e) => {
//         console.log("⚠️ ===== CANCELED EVENT =====");
//         console.log("⚠️ Cancellation Reason:", e.reason);
//         console.log("⚠️ Cancellation Reason String:", CancellationReason[e.reason]);
//         console.log("⚠️ Error Code:", e.errorCode);
//         console.log("⚠️ Error Details:", e.errorDetails);
//         console.log("⚠️ Full Event:", e);
        
//         if (e.reason === CancellationReason.Error) {
//           console.error("❌ ===== SPEECH RECOGNITION ERROR =====");
//           console.error("❌ Error Code:", e.errorCode);
//           console.error("❌ Error Details:", e.errorDetails);
//           console.error("❌ Possible causes:");
//           console.error("   - Invalid Azure credentials");
//           console.error("   - Network/CORS issues");
//           console.error("   - Microphone permission denied");
//           console.error("   - Region mismatch");
//           setErrorMessage(`Speech error: ${e.errorDetails || "Unknown error"}`);
//         }
//         setListening(false);
//       };

//       recognizer.sessionStarted = (s, e) => {
//         console.log("🎙️ ===== SESSION STARTED =====");
//         console.log("🎙️ Session ID:", e.sessionId);
//         console.log("🎙️ Mic is ON and ready to listen");
//         setListening(true);
//         setErrorMessage("");
//         isUserStartedRef.current = true;
//         isConversationActive.current = true;
//       };

//       recognizer.sessionStopped = (s, e) => {
//         console.log("🛑 ===== SESSION STOPPED =====");
//         console.log("🛑 Session ID:", e.sessionId);
//         console.log("🛑 Mic is OFF");
//         setListening(false);
//       };

//       recognizer.speechStartDetected = (s, e) => {
//         console.log("🗣️ Speech start detected - User started speaking");
//       };

//       recognizer.speechEndDetected = (s, e) => {
//         console.log("🤫 Speech end detected - User stopped speaking");
//       };

//       // Start continuous recognition
//       console.log("▶️ Starting continuous Azure Speech Recognition...");
//       recognizer.startContinuousRecognitionAsync(
//         () => {
//           console.log("✅ ===== RECOGNITION STARTED SUCCESSFULLY =====");
//           console.log("✅ Microphone is now actively listening");
//           console.log("✅ Language:", currentLang);
//           console.log("✅ Region:", speechRegion);
//         },
//         (err) => {
//           console.error("❌ ===== FAILED TO START RECOGNITION =====");
//           console.error("❌ Error:", err);
//           console.error("❌ Error Type:", typeof err);
//           console.error("❌ Error String:", String(err));
//           setErrorMessage("Failed to start microphone. Please try again.");
//         },
//       );
//     } catch (error) {
//       console.error("❌ ===== EXCEPTION IN START LISTENING =====");
//       console.error("❌ Error:", error);
//       console.error("❌ Error Message:", error.message);
//       console.error("❌ Error Stack:", error.stack);
//       setErrorMessage(`Failed to initialize: ${error.message}`);
//     }
//   };

//   const stopListening = (disableConversation = true) => {
//     console.log("🛑 ===== STOP LISTENING =====");
//     console.log("🛑 Disable conversation:", disableConversation);
//     console.log("🛑 Stopping microphone...");
    
//     if (disableConversation) {
//       isConversationActive.current = false;
//       console.log("🛑 Conversation marked as inactive");
//     }

//     if (recognizerRef.current) {
//       console.log("🛑 Stopping continuous recognition...");
//       recognizerRef.current.stopContinuousRecognitionAsync(() => {
//         console.log("✅ Recognition stopped successfully");
//         setListening(false);
//       });
//     }

//     // Also stop audio if playing
//     if (playbackAudioRef.current) {
//       console.log("🛑 Stopping audio playback...");
//       playbackAudioRef.current.pause();
//       playbackAudioRef.current.currentTime = 0;
//       console.log("✅ Audio stopped");
//     }
    
//     setIsPlayingAudio(false);
//     shouldIgnoreInputRef.current = false;
//     setTranscript("");
//     console.log("🔓 Input UNLOCKED - Stop button pressed");
//     console.log("🛑 ===== STOP COMPLETE =====");
//   };

//   // Log component mount
//   useEffect(() => {
//     console.log("🎬 ===== VOICEBOT COMPONENT MOUNTED =====");
//     console.log("🎬 Initial language:", language);
//     console.log("🎬 Device info:", {
//       userAgent: navigator.userAgent,
//       platform: navigator.platform,
//       isIOS: isIOS(),
//     });
    
//     return () => {
//       console.log("🎬 ===== VOICEBOT COMPONENT UNMOUNTING =====");
//       if (recognizerRef.current) {
//         console.log("🧹 Cleaning up recognizer on unmount...");
//         recognizerRef.current.stopContinuousRecognitionAsync();
//         recognizerRef.current.close();
//       }
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative">
//       <Card className="w-full max-w-2xl h-[85vh] md:h-[800px] flex flex-col border-blue-600 overflow-hidden bg-white">
//         {/* Header */}
//         <div className="border-b border-slate-400 p-2 md:p-4 flex items-center justify-between bg-blue-600 z-10">
//           <h1 className="text-md md:text-xl font-bold flex gap-2 text-white">
//             Dr.Sapan Shah's AI Voice Bot
//           </h1>

//           {/* Status Indicator */}
//           <div className="flex items-center gap-2">
//             {listening && (
//               <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-xs font-medium text-green-700">
//                   {isPlayingAudio ? "Bot Speaking" : "Listening"}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Chat Area */}
//         <div className="flex-1 overflow-y-auto bg-slate-50/30 p-1 md:p-2 space-y-6 scroll-smooth relative">
//           {!isLanguageSelected ? (
//             <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
//               <div className="text-center space-y-4">
//                 <div className="flex justify-center mb-4">
//                   <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
//                     <HospitalIcon size={50} />
//                   </div>
//                 </div>
//                 <h2 className="text-2xl font-bold text-slate-800">
//                   Welcome to Dr.Sapan Shah's AI Voicebot
//                 </h2>
//                 <p className="text-slate-500">
//                   Please select your preferred language to start chatting.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 w-full max-w-xs gap-4">
//                 <Button
//                   onClick={() => handleLanguageSelect("en-IN")}
//                   variant="outline"
//                   className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8 "
//                 >
//                   English
//                 </Button>
//                 <Button
//                   onClick={() => handleLanguageSelect("gu-IN")}
//                   variant="outline"
//                   className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8 "
//                 >
//                   ગુજરાતી
//                 </Button>

//                 <Button
//                   onClick={() => handleLanguageSelect("hi-IN")}
//                   variant="outline"
//                   className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8 "
//                 >
//                   हिंदी
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <>
//               {messages.map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`flex gap-1 max-w-[85%] md:max-w-[75%] ${
//                     msg.type === "user" ? "ml-auto flex-row-reverse" : ""
//                   }`}
//                 >
//                   <Avatar className="h-8 w-8 mt-1 border border-slate-200">
//                     <AvatarFallback
//                       className={`${
//                         msg.type === "bot"
//                           ? "bg-white text-blue-600"
//                           : "bg-blue-600 text-white"
//                       } text-xs shadow-sm`}
//                     >
//                       {msg.type === "bot" ? (
//                         <HospitalIcon className="h-4 w-4" />
//                       ) : (
//                         <User className="h-4 w-4" />
//                       )}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col gap-2">
//                     <div
//                       className={`border p-2 rounded-xl text-sm md:text-base ${
//                         msg.type === "bot"
//                           ? "bg-white border-slate-100 rounded-tl-sm text-slate-700"
//                           : "bg-blue-600 border-blue-600 rounded-tr-sm text-white"
//                       }`}
//                     >
//                       {msg.text}
//                     </div>
//                     <div className="text-[10px] text-slate-400 px-1">
//                       {msg.timestamp.toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {loading && (
//                 <div className="flex gap-4 max-w-[85%]">
//                   <Avatar className="h-8 w-8 mt-1 border justify-center items-center border-slate-200">
//                     <HospitalIcon className="h-4 w-4 text-blue-600" />
//                   </Avatar>
//                   <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
//                     <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
//                     <span className="text-sm text-slate-500">Thinking...</span>
//                   </div>
//                 </div>
//               )}

//               {error && (
//                 <div className="flex justify-center">
//                   <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
//                     {error}
//                   </div>
//                 </div>
//               )}

//               {/* Visualizer / Transcript Preview - Always show when listening and not during bot response */}
//               {listening && !isPlayingAudio && !loading && (
//                 <div className="flex flex-col items-center py-4 gap-2">
//                   <div className="text-sm text-slate-500 italic animate-pulse font-medium">
//                     {transcript || "Listening..."}
//                   </div>
//                   <div className="flex items-center gap-1.5 h-8">
//                     {[...Array(5)].map((_, i) => (
//                       <div
//                         key={i}
//                         className="w-1.5 bg-blue-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"
//                         style={{
//                           height: `${Math.random() * 20 + 10}px`,
//                           animationDelay: `${i * 0.1}s`,
//                         }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Bot speaking indicator */}
//               {isPlayingAudio && (
//                 <div className="flex flex-col items-center py-4 gap-2">
//                   <div className="text-sm text-blue-600 font-medium">
//                     🔊 Bot is speaking...
//                   </div>
//                   <div className="text-xs text-slate-400">
//                     (Microphone active, waiting for response to finish)
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </>
//           )}
//         </div>

//         {/* Footer Controls */}
//         {isLanguageSelected && (
//           <div className="py-2 border-t border-slate-400 flex items-center justify-center gap-8">
//             {errorMessage && (
//               <div className="absolute left-4 bottom-20 bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm">
//                 {errorMessage}
//               </div>
//             )}

//             <Button
//               size="lg"
//               onClick={() => {
//                 console.log("🎤 Speak button clicked");
//                 isConversationActive.current = true;
//                 startListening();
//               }}
//               disabled={listening || loading}
//               className={`w-36 h-12 text-base text-white font-medium border-2 border-white transition-all ${
//                 listening
//                   ? "opacity-50 cursor-not-allowed bg-green-600"
//                   : "bg-green-600 hover:bg-white hover:text-green-600 hover:border hover:border-green-600 cursor-pointer"
//               }`}
//             >
//               <Pipette className="mr-2 h-5 w-5" />
//               {"Speak"}
//             </Button>

//             <Button
//               size="lg"
//               onClick={() => {
//                 console.log("🛑 Stop button clicked");
//                 stopListening();
//               }}
//               disabled={!listening}
//               className={`w-36 h-12 text-base font-medium border-2 border-white transition-all ${
//                 !listening
//                   ? "opacity-50 cursor-not-allowed bg-red-600 text-white"
//                   : "bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border hover:border-red-600 cursor-pointer"
//               }`}
//             >
//               <Pause className="mr-2 h-5 w-5 fill-current" /> Stop
//             </Button>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }