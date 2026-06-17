import { useState, useEffect } from "react";
import { initializeStorage } from "./data/mockData";
import {
  Job,
  Citizen,
  Application,
  Interview,
  SystemNotification,
} from "./types";
import RoleSelector from "./components/RoleSelector";
import AdminDashboard from "./components/AdminDashboard";
import CitizenDashboard from "./components/CitizenDashboard";
import AccessibilityBar from "./components/AccessibilityBar";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: "admin" | "citizen";
    citizen?: Citizen;
  } | null>(null);

  // Core Db States loaded from local storage
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allCitizens, setAllCitizens] = useState<Citizen[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [allInterviews, setAllInterviews] = useState<Interview[]>([]);
  const [allNotifications, setAllNotifications] = useState<
    SystemNotification[]
  >([]);

  // Accessibility global states
  const [fontSize, setFontSize] = useState<"normal" | "large" | "huge">(
    "normal",
  );
  const [contrast, setContrast] = useState<"city" | "high">("city");
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Scale the html root font-size so rem-based Tailwind classes actually respond
  useEffect(() => {
    const scales = { normal: "100%", large: "115%", huge: "130%" };
    document.documentElement.style.fontSize = scales[fontSize];
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [fontSize]);

  // Initialize and load
  useEffect(() => {
    // Seeding mock database if empty
    initializeStorage();

    try {
      setAllJobs(JSON.parse(localStorage.getItem("cp_jobs") || "[]"));
      setAllCitizens(JSON.parse(localStorage.getItem("cp_citizens") || "[]"));
      setAllApplications(
        JSON.parse(localStorage.getItem("cp_applications") || "[]"),
      );
      setAllInterviews(
        JSON.parse(localStorage.getItem("cp_interviews") || "[]"),
      );
      setAllNotifications(
        JSON.parse(localStorage.getItem("cp_notifications") || "[]"),
      );
    } catch (e) {
      console.error("Error loading registers from Storage", e);
    }
  }, []);

  // Citizen Login (dynamic register if new)
  const handleLoginCitizen = (fullName: string, idNumber: string) => {
    let existingCitizens = [...allCitizens];
    try {
      existingCitizens = JSON.parse(
        localStorage.getItem("cp_citizens") || "[]",
      );
    } catch {}

    let citizenRecord = existingCitizens.find((c) => c.idNumber === idNumber);

    if (!citizenRecord) {
      // Dynamic onboarding registration
      const newCitizen: Citizen = {
        fullName,
        idNumber,
        registeredDate: new Date().toISOString().split("T")[0],
        skills: [],
        phone: "",
        email: "",
      };

      existingCitizens = [newCitizen, ...existingCitizens];
      setAllCitizens(existingCitizens);
      localStorage.setItem("cp_citizens", JSON.stringify(existingCitizens));
      citizenRecord = newCitizen;

      // Add audit notification
      const initialWelcomeNotification: SystemNotification = {
        id: `notif-${Date.now()}`,
        citizenIdNumber: idNumber,
        title: "Registry Cleared!",
        message: `Welcome ${fullName}. Your national placement credential index has been successfully mapped. Explore vacancies to seek placement clearances.`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        isRead: false,
        type: "success",
      };

      try {
        const storedNotif = JSON.parse(
          localStorage.getItem("cp_notifications") || "[]",
        );
        localStorage.setItem(
          "cp_notifications",
          JSON.stringify([initialWelcomeNotification, ...storedNotif]),
        );
        setAllNotifications([initialWelcomeNotification, ...allNotifications]);
      } catch {}
    } else {
      // Update Name if slightly modified (e.g. capitalized)
      citizenRecord.fullName = fullName;
      const updated = existingCitizens.map((c) =>
        c.idNumber === idNumber ? citizenRecord! : c,
      );
      setAllCitizens(updated);
      localStorage.setItem("cp_citizens", JSON.stringify(updated));
    }

    setCurrentUser({
      role: "citizen",
      citizen: citizenRecord,
    });
  };

  // Admin login
  const handleLoginAdmin = () => {
    setCurrentUser({ role: "admin" });
  };

  // Logout reset
  const handleLogout = () => {
    setCurrentUser(null);
    // Reload databases in case changes were stateful
    try {
      setAllJobs(JSON.parse(localStorage.getItem("cp_jobs") || "[]"));
      setAllCitizens(JSON.parse(localStorage.getItem("cp_citizens") || "[]"));
      setAllApplications(
        JSON.parse(localStorage.getItem("cp_applications") || "[]"),
      );
      setAllInterviews(
        JSON.parse(localStorage.getItem("cp_interviews") || "[]"),
      );
      setAllNotifications(
        JSON.parse(localStorage.getItem("cp_notifications") || "[]"),
      );
    } catch {}
  };

  return (
    <div
      className={`${
        contrast === "high"
          ? "contrast-high bg-slate-950 text-white"
          : "bg-coct-navy text-white"
      } min-h-screen antialiased transition-all duration-200`}
      style={{
        fontFamily: dyslexicFont
          ? "'Open Dyslexic', 'Space Grotesk', sans-serif"
          : undefined,
      }}
    >
      <AccessibilityBar
        fontSize={fontSize}
        setFontSize={setFontSize}
        contrast={contrast}
        setContrast={setContrast}
        speechEnabled={speechEnabled}
        setSpeechEnabled={setSpeechEnabled}
        dyslexicFont={dyslexicFont}
        setDyslexicFont={setDyslexicFont}
        transcript={transcript}
        setTranscript={setTranscript}
      />

      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RoleSelector
              onLoginCitizen={handleLoginCitizen}
              onLoginAdmin={handleLoginAdmin}
              contrast={contrast}
            />
          </motion.div>
        ) : currentUser.role === "admin" ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AdminDashboard
              allJobs={allJobs}
              setAllJobs={setAllJobs}
              allCitizens={allCitizens}
              setAllCitizens={setAllCitizens}
              allApplications={allApplications}
              setAllApplications={setAllApplications}
              allInterviews={allInterviews}
              setAllInterviews={setAllInterviews}
              onLogout={handleLogout}
              contrast={contrast}
            />
          </motion.div>
        ) : currentUser.citizen ? (
          <motion.div
            key="citizen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CitizenDashboard
              citizen={currentUser.citizen}
              allJobs={allJobs}
              allApplications={allApplications}
              setAllApplications={setAllApplications}
              allInterviews={allInterviews}
              allNotifications={allNotifications}
              setAllNotifications={setAllNotifications}
              onLogout={handleLogout}
              setAllCitizens={setAllCitizens}
              allCitizens={allCitizens}
              contrast={contrast}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
