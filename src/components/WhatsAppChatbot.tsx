import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  time: string;
}

interface QuickReply {
  label: string;
  value: string;
}

const BOT_NAME = "CivicPortal Support";
const BOT_AVATAR = "CP";

const QUICK_REPLIES_INITIAL: QuickReply[] = [
  { label: "How do I log in?", value: "how_login" },
  { label: "I'm a new user", value: "new_user" },
  { label: "I forgot my password", value: "forgot_password" },
  { label: "What ID number do I use?", value: "what_id" },
];

const QUICK_REPLIES_MORE: QuickReply[] = [
  { label: "Admin login help", value: "admin_login" },
  { label: "Account locked", value: "locked" },
  { label: "Talk to a person", value: "human" },
  { label: "Start over", value: "restart" },
];

const BOT_RESPONSES: Record<string, { text: string; followUp?: QuickReply[] }> = {
  how_login: {
    text: "To log in as a citizen:\n\n1️⃣ Click the *Citizen Portal* tab\n2️⃣ Enter your South African *National ID Number*\n3️⃣ Enter your *password*\n4️⃣ Click *Secure Login*\n\nIf your ID hasn't been registered yet, the portal will automatically guide you to create an account.",
    followUp: [
      { label: "I forgot my password", value: "forgot_password" },
      { label: "I'm a new user", value: "new_user" },
    ],
  },
  new_user: {
    text: "Welcome! Registering is easy:\n\n1️⃣ Click *Citizen Portal*\n2️⃣ Enter your *National ID Number* and click Login\n3️⃣ You'll be redirected to the *Registration form*\n4️⃣ Fill in your full name, choose a password, and answer 3 security questions\n5️⃣ Click *Register*\n\nYou'll be logged in automatically after registration. ✅",
    followUp: [
      { label: "What ID number do I use?", value: "what_id" },
      { label: "How do I log in?", value: "how_login" },
    ],
  },
  forgot_password: {
    text: "To recover your password:\n\n1️⃣ On the login form, click *\"Forgot Password?\"*\n2️⃣ Enter your *National ID Number*\n3️⃣ Answer your 3 *security questions* (mother's maiden name, birthplace, first school)\n4️⃣ Set a *new password*\n\n⚠️ After 3 failed attempts, your account is locked and you will need to visit your *Ward Councillor* in person for manual unlock.",
    followUp: [
      { label: "Account locked", value: "locked" },
      { label: "How do I log in?", value: "how_login" },
    ],
  },
  what_id: {
    text: "Use your South African *National Identity Number* — the 13-digit number printed on your green ID book or smart ID card.\n\nExample format: *8001015009087*\n\n🔒 Your ID number is used to securely identify your placement record in the national registry.",
    followUp: [
      { label: "How do I log in?", value: "how_login" },
      { label: "I'm a new user", value: "new_user" },
    ],
  },
  admin_login: {
    text: "To access the *Administrator Console*:\n\n1️⃣ Click the *Administrator* tab on the login screen\n2️⃣ Enter the *admin access code* provided by your system administrator\n3️⃣ Click *Authenticate*\n\nAdmin access is restricted to authorised City of Cape Town officials only.",
    followUp: [
      { label: "How do I log in?", value: "how_login" },
      { label: "Talk to a person", value: "human" },
    ],
  },
  locked: {
    text: "If your account is locked after too many failed recovery attempts:\n\n👤 You must visit your *Ward Councillor* in person with valid identification to request a manual unlock.\n\nWard office details are available on the City of Cape Town website. We apologise for the inconvenience — this policy protects your identity.",
    followUp: [
      { label: "Talk to a person", value: "human" },
      { label: "Start over", value: "restart" },
    ],
  },
  human: {
    text: "To speak to a human support agent:\n\n📞 *City of Cape Town Call Centre:* 0860 103 089\n🕐 *Hours:* Mon–Fri, 08:00–16:30\n📧 *Email:* socialdevelopment@capetown.gov.za\n\nFor urgent placement assistance, visit your nearest Thusong Service Centre.",
    followUp: [
      { label: "Start over", value: "restart" },
    ],
  },
  restart: {
    text: "Of course! How can I help you today? 😊",
    followUp: QUICK_REPLIES_INITIAL,
  },
};

function now() {
  return new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

const GREETING: Message = {
  id: "greeting",
  from: "bot",
  text: "👋 Hi! I'm the *CivicPortal* support assistant.\n\nI can help you log in, register, or recover your account. What do you need help with?",
  time: now(),
};

interface WhatsAppChatbotProps {
  contrast?: "city" | "high";
}

export default function WhatsAppChatbot({ contrast = "city" }: WhatsAppChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(QUICK_REPLIES_INITIAL);
  const [showMore, setShowMore] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const handleQuickReply = (reply: QuickReply) => {
    const userMsg: Message = {
      id: makeId(),
      from: "user",
      text: reply.label,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuickReplies([]);
    setShowMore(false);
    setTyping(true);

    setTimeout(() => {
      const response = BOT_RESPONSES[reply.value];
      if (response) {
        const botMsg: Message = {
          id: makeId(),
          from: "bot",
          text: response.text,
          time: now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setQuickReplies(response.followUp || QUICK_REPLIES_INITIAL);
      }
      setTyping(false);
    }, 900);
  };

  const renderText = (text: string) =>
    text.split("\n").map((line, i) => {
      const parts = line.split(/\*(.*?)\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });

  const isHigh = contrast === "high";

  const allReplies = showMore
    ? [...quickReplies, ...QUICK_REPLIES_MORE.filter((r) => !quickReplies.some((q) => q.value === r.value))]
    : quickReplies;

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer focus:outline-none"
        style={{ background: isHigh ? "#FFD700" : "#25D366" }}
        aria-label="Open WhatsApp support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={26} color={isHigh ? "#000" : "#fff"} />
            </motion.span>
          ) : (
            <motion.span key="wa" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
              {/* WhatsApp icon SVG */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill={isHigh ? "#000" : "#fff"} xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ height: "520px", maxHeight: "calc(100vh - 120px)" }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: isHigh ? "#000" : "#128C7E" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: isHigh ? "#FFD700" : "#25D366", color: isHigh ? "#000" : "#fff" }}
              >
                {BOT_AVATAR}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{BOT_NAME}</p>
                <p className="text-green-200 text-[11px] font-medium">Online | typically replies instantly or message this no. +27 123 456 7890</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1 cursor-pointer"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Background watermark pattern */}
            <div
              className="flex-1 overflow-y-auto flex flex-col gap-2 p-3 pb-2"
              style={{
                background: isHigh
                  ? "#111"
                  : "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2325D366' fill-opacity='0.05'%3E%3Cpath d='M30 30m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\") #ECE5DD",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm"
                    style={{
                      background:
                        msg.from === "user"
                          ? isHigh ? "#FFD700" : "#DCF8C6"
                          : isHigh ? "#222" : "#fff",
                      color:
                        msg.from === "user"
                          ? isHigh ? "#000" : "#111"
                          : isHigh ? "#fff" : "#111",
                      borderRadius:
                        msg.from === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                    }}
                  >
                    {renderText(msg.text)}
                    <div
                      className="text-right mt-1 text-[10px]"
                      style={{ color: msg.from === "user" ? (isHigh ? "#555" : "#6B8E6B") : (isHigh ? "#666" : "#999") }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3 shadow-sm"
                    style={{ background: isHigh ? "#222" : "#fff", borderRadius: "18px 18px 18px 4px" }}
                  >
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: isHigh ? "#FFD700" : "#25D366" }}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {!typing && quickReplies.length > 0 && (
              <div
                className="flex-shrink-0 px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t"
                style={{
                  background: isHigh ? "#000" : "#fff",
                  borderColor: isHigh ? "#333" : "#e5e7eb",
                }}
              >
                {allReplies.map((qr) => (
                  <button
                    key={qr.value}
                    onClick={() => handleQuickReply(qr)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer transition-all hover:opacity-80"
                    style={{
                      background: isHigh ? "#FFD700" : "#E7F8EE",
                      color: isHigh ? "#000" : "#128C7E",
                      borderColor: isHigh ? "#FFD700" : "#25D366",
                    }}
                  >
                    {qr.label}
                  </button>
                ))}
                {!showMore && QUICK_REPLIES_MORE.some((r) => !quickReplies.some((q) => q.value === r.value)) && (
                  <button
                    onClick={() => setShowMore(true)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer flex items-center gap-1 transition-all hover:opacity-80"
                    style={{
                      background: "transparent",
                      color: isHigh ? "#FFD700" : "#888",
                      borderColor: isHigh ? "#555" : "#ddd",
                    }}
                  >
                    More <ChevronDown size={10} />
                  </button>
                )}
              </div>
            )}

            {/* Footer hint */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
              style={{ background: isHigh ? "#000" : "#f0f0f0", borderTop: `1px solid ${isHigh ? "#333" : "#e5e7eb"}` }}
            >
              <Send size={14} style={{ color: isHigh ? "#666" : "#bbb" }} />
              <span className="text-[11px]" style={{ color: isHigh ? "#666" : "#aaa" }}>
                Select a quick reply above to get help
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
