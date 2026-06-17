import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Volume2,
  Type,
  Sparkles,
  HelpCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
} from "lucide-react";
import coctLogo from "@/assets/imgs/coct-logo.png";

interface AccessibilityBarProps {
  fontSize: "normal" | "large" | "huge";
  setFontSize: (size: "normal" | "large" | "huge") => void;
  contrast: "city" | "high";
  setContrast: (contrast: "city" | "high") => void;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  dyslexicFont: boolean;
  setDyslexicFont: (enabled: boolean) => void;
  transcript: string;
  setTranscript: (text: string) => void;
}

export default function AccessibilityBar({
  fontSize,
  setFontSize,
  contrast,
  setContrast,
  speechEnabled,
  setSpeechEnabled,
  dyslexicFont,
  setTranscript,
  transcript,
}: AccessibilityBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Announcement helper
  const announceText = (text: string) => {
    setTranscript(text);
    if (speechEnabled && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices[2];
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis blocked or not supported:", err);
      }
    }
  };

  // Announce major toggle changes
  const handleToggleSpeech = () => {
    const nextVal = !speechEnabled;
    setSpeechEnabled(nextVal);
    if (nextVal) {
      setTimeout(() => {
        announceText(
          "Audio guidance enabled. Hover or tap buttons, notifications, or jobs to hear descriptions.",
        );
      }, 100);
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setTranscript("Audio guidance muted.");
    }
  };

  const handleToggleContrast = () => {
    const nextVal = contrast === "city" ? "high" : "city";
    setContrast(nextVal);
    announceText(
      nextVal === "high"
        ? "High contrast dark mode activated."
        : "City of Cape Town official colors theme activated.",
    );
  };

  const handleToggleFont = (size: "normal" | "large" | "huge") => {
    setFontSize(size);
    announceText(`Font scale size adjusted to ${size} text mode.`);
  };

  // Listen to custom clicks to read text safely
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if (!speechEnabled) return;
      const target = e.target as HTMLElement;

      // Look for data-accessibility-announce or text structure
      const textToSpeak =
        target.getAttribute("data-announce") ||
        (target.tagName === "BUTTON" && target.innerText) ||
        (target.tagName === "H4" && target.innerText) ||
        (target.tagName === "H5" && target.innerText);

      if (textToSpeak && textToSpeak.length < 200) {
        // Prevent continuous repeating by adding a small timeout/check
        const lastAnnounced = sessionStorage.getItem("last_announced");
        if (lastAnnounced !== textToSpeak) {
          announceText(textToSpeak.trim());
          sessionStorage.setItem("last_announced", textToSpeak);
        }
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [speechEnabled]);

  // Initial greeting
  useEffect(() => {
    setTimeout(() => {
      announceText(
        "Welcome to Cape Town CivicPortal. Explore municipal jobs and track application milestones.",
      );
    }, 1500);
  }, []);

  const isHigh = contrast === "high";

  return (
    <div className="w-full z-50" id="captionBanner">
      {/* Dynamic Subtitles / Transcript Bar at the topmost header */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`w-full py-2 px-4 text-center font-bold text-xs flex items-center justify-center space-x-2 border-b transition-all ${
              isHigh
                ? "bg-black text-coct-yellow border-coct-yellow"
                : "bg-white text-black border-white/15"
            }`}
          >
            <span className="shrink-0 animate-pulse inline-block h-2.5 w-2.5 rounded-full bg-coct-yellow" />
            <span className="font-mono uppercase tracking-wider text-[10px] shrink-0 font-extrabold">
              Live Captions & Audio Overlay:
            </span>
            <span className="italic truncate max-w-xl font-semibold">
              "{transcript}"
            </span>
            <button
              type="button"
              onClick={() => setTranscript("")}
              className={`font-bold hover:underline pl-2 text-[10px] ${isHigh ? "text-slate-400 hover:text-white" : "text-red/60 hover:text-black"}`}
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bar */}
      <div
        id="accessibilityBanner"
        className={`border-b transition-all ${
          isHigh
            ? "bg-black border-slate-800 text-white"
            : "text-coct-magenta border-white/10"
        }`}
      >
        <div className=" heighmax-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-y-2">
          {/* Brand Shield & Motto */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-white text-coct-blue shrink-0 font-black text-base shadow-sm">
              <img src={coctLogo} alt="City of Cape Town Logo" sizes="xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs uppercase tracking-widest text-white drop-shadow-xs">
                  CITY OF CAPE TOWN
                </span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                  IDP 2022-2027
                </span>
              </div>
              <p className="text-[10px] text-white/90 font-medium leading-none drop-shadow-xs">
                City of Hope for All &bull; Isixeko Sasekapa &bull; Stad
                Kaapstad
              </p>
            </div>
          </div>

          {/* Quick Access Actions */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            {/* Visual Indicators Summary */}
            <span className="text-[10px] font-bold text-white/80 hidden sm:block">
              Accessibility Center:
            </span>

            {/* Font Control Multi-Button */}
            <div className="flex items-center bg-white/15 rounded-xl p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => handleToggleFont("normal")}
                className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${
                  fontSize === "normal"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleToggleFont("large")}
                className={`px-2 py-1 text-[11px] font-black rounded-lg transition-all ${
                  fontSize === "large"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
                title="Large Font Size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => handleToggleFont("huge")}
                className={`px-2 py-1 text-[13px] font-black rounded-lg transition-all ${
                  fontSize === "huge"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
                title="Huge Font Size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 font-bold text-[10px] ${
                isHigh
                  ? "bg-coct-yellow text-black border-white"
                  : "bg-white/15 hover:bg-white/25 text-white border-white/20"
              }`}
              title="Toggle High Contrast Theme"
            >
              <Eye size={13} />
              <span>
                {isHigh ? "High Contrast Mode ON" : "Contrast Assist"}
              </span>
            </button>

            {/* Speech Synthesis Guidance Toggle */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 font-bold text-[10px] ${
                speechEnabled
                  ? "bg-coct-green/90 text-white border-white animate-pulse"
                  : "bg-white/15 hover:bg-white/25 text-white border-white/20"
              }`}
              title="Toggle Audio/Voice Guidance"
            >
              <Volume2 size={13} />
              <span>
                {speechEnabled ? " Guidance Enabled" : "Auditory Guidance"}
              </span>
            </button>

            {/* More options panel toggler */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 cursor-pointer text-white"
            >
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Controls Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`transition-all border-b shadow-lg overflow-hidden ${
              isHigh
                ? "bg-slate-950 border-slate-800 text-white"
                : "bg-white border-coct-navy/20 text-slate-900"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Visual Disability Support Details */}
              <div className="space-y-2">
                <h4
                  className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${isHigh ? "text-coct-yellow" : "text-coct-blue"}`}
                >
                  <Eye size={15} />
                  Visual Assistance Features
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Tailored layout tools designed to support citizens with minor,
                  strong, or complete cataracts, colorblindness, or dyslexia:
                </p>
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 dark:bg-black/10 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Large Zoom Typography</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-coct-magenta dark:text-white px-1.5 py-0.5 rounded">
                      {fontSize === "normal"
                        ? "100% standard"
                        : fontSize === "large"
                          ? "125% scales"
                          : "150% maximum"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Text contrast multiplier</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-coct-magenta dark:text-white px-1.5 py-0.5 rounded">
                      {isHigh ? "7:1 Active Ratio" : "Normal Ratio"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auditory Vetting Features */}
              <div className="space-y-2">
                <h4
                  className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${isHigh ? "text-coct-yellow" : "text-coct-magenta"}`}
                >
                  <Volume2 size={15} />
                  Auditory Assistance Guidance
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Support for both visually impaired (audio screen narrative
                  playback) and hearing impaired (full visual subtitles captions
                  framework):
                </p>

                <div className="p-3 bg-white hover:bg-slate-100 transition-all cursor-pointer rounded-xl border border-slate-200 dark:bg-black/10 dark:border-slate-800 space-y-1">
                  <span className="font-extrabold block text-[10px] text-coct-magenta">
                    🗣️ Interactive Screen narrative
                  </span>
                  <p className="text-[10px] leading-relaxed text-slate-500 font-semibold">
                    Hover over any job post description or timeline milestones
                    below. Our synthesized City Guide voice will speak the text
                    out loud automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      announceText(
                        "This test vocal check confirms the City of Cape Town screen narrative features are active.",
                      )
                    }
                    className="mt-1 text-[9px] font-bold text-white bg-coct-magenta hover:bg-coct-magenta/90 px-2 py-1 rounded-md inline-flex items-center gap-1"
                  >
                    <Play size={10} /> Test Auditory voice
                  </button>
                </div>
              </div>

              {/* General Policy Info */}
              <div className="space-y-2  text-white bg-coct-navy p-4 rounded-2xl border">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[10px] text-black dark:text-white">
                  <HelpCircle size={14} className="text-white shrink-0" />
                  IDP Inclusive City Policy Notice
                </span>
                <p className="text-[10.5px] text-indigo-900/80 dark:text-slate-400 font-semibold leading-relaxed">
                  In compliance with the Cape Town{" "}
                  <strong>Integrated Development Plan (2022-2027)</strong>,
                  visual, physical, and sensory assistance services are
                  standardized for public service placements. Compensation
                  packages are calculated strictly index-linked to{" "}
                  <strong>South African Rands (R)</strong>, ensuring equitable
                  opportunity and fair pay indexes for our diverse community.
                </p>
                <div className="pt-2 flex justify-between items-center text-[9px] font-extrabold font-mono text-slate-400 uppercase">
                  <span>CT-IDP SECTION VII</span>
                  <span className="text-coct-lime">ACTIVE DEPLOYMENT</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
