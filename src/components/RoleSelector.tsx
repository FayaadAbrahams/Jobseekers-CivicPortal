import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  User,
  Landmark,
  Fingerprint,
  LogIn,
  Sparkles,
  UserPlus,
  HelpCircle,
  Key,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Lock,
  Building2,
  LockKeyhole,
} from "lucide-react";
import { Citizen } from "../types";

interface RoleSelectorProps {
  onLoginCitizen: (fullName: string, idNumber: string) => void;
  onLoginAdmin: () => void;
  contrast?: "city" | "high";
}

export default function RoleSelector({
  onLoginCitizen,
  onLoginAdmin,
  contrast = "city",
}: RoleSelectorProps) {
  const [activeTab, setActiveTab] = useState<"citizen" | "admin">("citizen");

  // Login standard credential states
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");

  // Registration flow state variables
  const [fullName, setFullName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regQ1, setRegQ1] = useState("");
  const [regQ2, setRegQ2] = useState("");
  const [regQ3, setRegQ3] = useState("");

  // Forgot password states
  const [recoveryId, setRecoveryId] = useState("");
  const [recoveryCitizen, setRecoveryCitizen] = useState<Citizen | null>(null);
  const [ans1, setAns1] = useState("");
  const [ans2, setAns2] = useState("");
  const [ans3, setAns3] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Sub-modes for security citizen view
  // 'login' | 'register' | 'forgot_id' | 'forgot_questions' | 'forgot_reset' | 'failed_lockout'
  const [subMode, setSubMode] = useState<
    | "login"
    | "register"
    | "forgot_id"
    | "forgot_questions"
    | "forgot_reset"
    | "failed_lockout"
  >("login");

  const [adminCode, setAdminCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  // Reload local state-directory for calculations
  const getLatestCitizens = (): Citizen[] => {
    try {
      return JSON.parse(localStorage.getItem("cp_citizens") || "[]");
    } catch {
      return [];
    }
  };

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    const trimmedId = idNumber.trim().replace(/\s/g, "");
    if (!trimmedId) {
      setLoginError("Please supply your National ID Number.");
      return;
    }

    const citizenList = getLatestCitizens();
    const citizen = citizenList.find((c) => c.idNumber === trimmedId);

    if (!citizen) {
      // ID not registered. Shift to register subMode pre-filling current fields
      setSubMode("register");
      setFullName("");
      setRegPassword("");
      setLoginError(
        "National ID is not registered yet. Complete registration to onboard.",
      );
      return;
    }

    // Checking password
    const correctPassword = citizen.password || "password123"; // fallback for seed data
    if (password !== correctPassword) {
      setLoginError(
        "Incorrect ID or password. If you forgot your password, utilize the Secure Recovery wizard.",
      );
      return;
    }

    // Success login
    onLoginCitizen(citizen.fullName, citizen.idNumber);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const trimmedId = idNumber.trim().replace(/\s/g, "");
    const trimmedName = fullName.trim();

    if (
      !trimmedId ||
      !trimmedName ||
      !regPassword ||
      !regQ1 ||
      !regQ2 ||
      !regQ3
    ) {
      setLoginError(
        "Please complete all fields, including the 3 security questions.",
      );
      return;
    }

    if (trimmedId.length < 6 || trimmedId.length > 15) {
      setLoginError("ID Number must be between 6 and 15 characters.");
      return;
    }

    const citizenList = getLatestCitizens();
    if (citizenList.some((c) => c.idNumber === trimmedId)) {
      setLoginError("An account with this ID Number is already registered.");
      return;
    }

    // Build new citizen
    const newCitizen: Citizen = {
      fullName: trimmedName,
      idNumber: trimmedId,
      registeredDate: new Date().toISOString().split("T")[0],
      skills: [],
      phone: "",
      email: "",
      password: regPassword,
      recoveryAnswers: {
        q1: regQ1.trim(),
        q2: regQ2.trim(),
        q3: regQ3.trim(),
      },
    };

    // Save
    const updatedList = [newCitizen, ...citizenList];
    localStorage.setItem("cp_citizens", JSON.stringify(updatedList));

    // Sign in directly
    onLoginCitizen(trimmedName, trimmedId);
  };

  // Trigger forgot verification password lookup
  const handleForgotIdCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const trimmedId = recoveryId.trim().replace(/\s/g, "");
    if (!trimmedId) {
      setLoginError("Provide a registered National ID Number.");
      return;
    }

    const citizenList = getLatestCitizens();
    const citizen = citizenList.find((c) => c.idNumber === trimmedId);

    if (!citizen) {
      setLoginError(
        "No matching registered client folder found mapping to this National ID.",
      );
      return;
    }

    setRecoveryCitizen(citizen);
    setAns1("");
    setAns2("");
    setAns3("");
    setSubMode("forgot_questions");
  };

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!recoveryCitizen) return;

    // Get answers on record (fallback validation with default for seed profiles)
    const recordQ1 = (
      recoveryCitizen.recoveryAnswers?.q1 ||
      (recoveryCitizen.fullName.includes("Thabo") ? "Khumalo" : "Naidoo")
    )
      .trim()
      .toLowerCase();
    const recordQ2 = (
      recoveryCitizen.recoveryAnswers?.q2 ||
      (recoveryCitizen.fullName.includes("Thabo") ? "Soweto" : "Durban")
    )
      .trim()
      .toLowerCase();
    const recordQ3 = (
      recoveryCitizen.recoveryAnswers?.q3 ||
      (recoveryCitizen.fullName.includes("Thabo")
        ? "Main Street Primary"
        : "Ocean View High")
    )
      .trim()
      .toLowerCase();

    const inputQ1 = ans1.trim().toLowerCase();
    const inputQ2 = ans2.trim().toLowerCase();
    const inputQ3 = ans3.trim().toLowerCase();

    if (inputQ1 === recordQ1 && inputQ2 === recordQ2 && inputQ3 === recordQ3) {
      // Security pass successful
      setSubMode("forgot_reset");
    } else {
      // Failed attempts count
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);

      if (nextFailed >= 3) {
        setSubMode("failed_lockout");
      } else {
        setLoginError(
          `Security verification answers are incorrect. Failed Security Attempts: ${nextFailed}/3.`,
        );
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!recoveryCitizen || !newPassword) return;

    const citizenList = getLatestCitizens();
    const updatedList = citizenList.map((c) => {
      if (c.idNumber === recoveryCitizen.idNumber) {
        return {
          ...c,
          password: newPassword,
        };
      }
      return c;
    });

    localStorage.setItem("cp_citizens", JSON.stringify(updatedList));
    setLoginSuccess(
      "Password successfully secure! Sign in using your new credentials.",
    );

    // Reset inputs
    setIdNumber(recoveryCitizen.idNumber);
    setPassword(newPassword);
    setSubMode("login");
    setFailedAttempts(0);
    setRecoveryCitizen(null);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (adminCode === "admin" || adminCode === "1234" || adminCode === "") {
      onLoginAdmin();
    } else {
      setLoginError(
        "Invalid Administrator access credentials. Enter standard blank or (admin).",
      );
    }
  };

  const isHigh = contrast === "high";

  return (
    <div
      className={`min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isHigh ? "bg-black text-white" : "bg-coct-navy text-white"}`}
    >
      {/* Upper Brand Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          className={`inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border mb-6 uppercase ${
            isHigh
              ? "bg-black text-coct-yellow border-coct-yellow"
              : "bg-white/15 text-white border-white/25"
          }`}
        >
          <Landmark size={14} />
          <span>City of Cape Town | Official Registry</span>
        </div>
        <h2
          className={`text-4xl font-black tracking-tight sm:text-5xl ${isHigh ? "text-coct-yellow" : "text-coct-yellow"}`}
        >
          CivicPortal
        </h2>
        <h2
          className={`text-4xl font-black tracking-tight sm:text-5xl ${isHigh ? "text-coct-yellow" : "text-coct-yellow"}`}
        >
          Job Seekers
        </h2>
        <p
          className={`mt-3 text-sm font-medium ${isHigh ? "text-slate-300" : "text-white/75"}`}
        >
          Secure placement and development portal aligned with the Cape Town IDP
          (2022-2027) directives.
        </p>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`py-8 px-6 rounded-4xl border sm:px-10 ${
            isHigh
              ? "bg-black border-coct-yellow/50 shadow-none"
              : "bg-white border-white/20 shadow-2xl shadow-black/30"
          }`}
        >
          {/* Dual Tabs for Citizen vs Admin */}
          {subMode === "login" && (
            <div
              className={`flex p-1.5 rounded-2xl mb-8 ${isHigh ? "bg-slate-900" : "bg-slate-100"}`}
            >
              <button
                id="citizen-auth-tab"
                onClick={() => {
                  setActiveTab("citizen");
                  setLoginError("");
                  setLoginSuccess("");
                }}
                className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "citizen"
                    ? isHigh
                      ? "bg-coct-yellow text-black font-extrabold shadow-md"
                      : "bg-coct-blue text-white shadow-lg shadow-coct-blue/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User size={16} className="mr-2" />
                Citizen Portal
              </button>
              <button
                id="admin-auth-tab"
                onClick={() => {
                  setActiveTab("admin");
                  setLoginError("");
                  setLoginSuccess("");
                }}
                className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "admin"
                    ? isHigh
                      ? "bg-coct-yellow text-black font-extrabold shadow-md"
                      : "bg-coct-magenta text-white shadow-lg shadow-coct-magenta/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Shield size={16} className="mr-2" />
                Administrator
              </button>
            </div>
          )}

          {/* Citizen Tab Workflows */}
          {activeTab === "citizen" ? (
            <AnimatePresence mode="wait">
              {/* SUBMODE: LOGIN */}
              {subMode === "login" && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleCitizenSubmit}
                  className="space-y-5"
                >
                  {loginSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-150 flex items-center gap-2 font-bold select-none mb-2">
                      <CheckCircle
                        size={16}
                        className="text-emerald-600 shrink-0"
                      />
                      <span>{loginSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="idnumber"
                      className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${isHigh ? "text-coct-yellow" : "text-slate-600"}`}
                    >
                      National ID Number
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Fingerprint size={18} />
                      </div>
                      <input
                        id="idnumber"
                        name="idnumber"
                        type="text"
                        required
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="e.g. 9504125193084"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl font-medium sm:text-sm tracking-widest transition-all focus:outline-hidden focus:ring-2 ${
                          isHigh
                            ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                            : "border-slate-200 text-slate-900 focus:ring-coct-blue focus:border-coct-blue"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label
                        htmlFor="password"
                        className={`block text-xs font-extrabold uppercase tracking-widest ${isHigh ? "text-coct-yellow" : "text-slate-600"}`}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSubMode("forgot_id");
                          setLoginError("");
                          setLoginSuccess("");
                        }}
                        className={`text-xs font-bold hover:underline cursor-pointer ${
                          isHigh
                            ? "text-coct-yellow hover:text-white"
                            : "text-coct-blue hover:text-coct-blue/80"
                        }`}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl font-medium sm:text-sm transition-all focus:outline-hidden focus:ring-2 ${
                          isHigh
                            ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                            : "border-slate-200 text-slate-900 focus:ring-coct-blue focus:border-coct-blue"
                        }`}
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-100 flex items-start gap-2 font-bold">
                      <AlertTriangle
                        size={16}
                        className="text-rose-500 shrink-0 mt-0.5"
                      />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full flex items-center justify-center py-3.5 px-4 rounded-full text-sm font-bold transition-all cursor-pointer ${
                      isHigh
                        ? "bg-coct-yellow text-black hover:bg-white"
                        : "text-white bg-coct-blue hover:bg-coct-blue/90 shadow-lg shadow-coct-blue/10 hover:shadow-xl hover:shadow-coct-blue/20"
                    }`}
                  >
                    <LogIn size={16} className="mr-2" />
                    Access My Vault
                  </button>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      ID not in the database?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setSubMode("register");
                          setLoginError("");
                          setLoginSuccess("");
                        }}
                        className={`font-extrabold hover:underline cursor-pointer ${
                          isHigh
                            ? "text-coct-yellow hover:text-white"
                            : "text-coct-blue hover:text-coct-blue/90"
                        }`}
                      >
                        Register New Account
                      </button>
                    </p>
                  </div>
                </motion.form>
              )}

              {/* SUBMODE: REGISTER */}
              {subMode === "register" && (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSubMode("login");
                        setLoginError("");
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">
                        New Account Creation
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Map your ID and secure recovery coordinates.
                      </p>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-amber-50 text-amber-850 text-[11px] rounded-xl border border-amber-150 flex items-center font-bold">
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                        National ID Number
                      </label>
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="e.g. 9823-55-1011"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 sm:text-xs transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Marcus Rodriguez"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 sm:text-xs transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-[10px] font-extrabold uppercase tracking-widest mb-1.5 ${isHigh ? "text-coct-yellow" : "text-slate-600"}`}
                    >
                      Create Vault Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Specify a strong password"
                      className={`block w-full px-3 py-2.5 border rounded-xl font-semibold placeholder-slate-400 focus:outline-hidden focus:ring-2 sm:text-xs transition-all ${
                        isHigh
                          ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                          : "border-slate-200 text-slate-900 focus:ring-coct-blue"
                      }`}
                    />
                  </div>

                  <div
                    className={`pt-2 border-t -mx-6 px-6 py-4 space-y-3 ${isHigh ? "border-slate-800 bg-slate-900/40" : "border-slate-100 bg-slate-50"}`}
                  >
                    <span
                      className={`block text-[10px] font-extrabold uppercase tracking-wider items-center gap-1.5 ${isHigh ? "text-coct-yellow" : "text-coct-blue"}`}
                    >
                      <HelpCircle
                        size={14}
                        className={
                          isHigh ? "text-coct-yellow" : "text-coct-blue"
                        }
                      />
                      Step 2: Account Recovery Safety Settings
                    </span>
                    <p
                      className={`text-[10px] leading-normal mb-1 ${isHigh ? "text-slate-300" : "text-slate-400"}`}
                    >
                      Specify precise answers to these three recovery queries.
                      These will unlock your profile if your password is
                      forgotten.
                    </p>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1">
                        1. What is your mother's maiden name?
                      </label>
                      <input
                        type="text"
                        required
                        value={regQ1}
                        onChange={(e) => setRegQ1(e.target.value)}
                        placeholder="e.g. Rodriguez"
                        className={`block w-full px-3 py-1.5 border rounded-lg text-xs transition-all ${
                          isHigh
                            ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                            : "border-slate-200 text-slate-900 bg-white focus:ring-1 focus:ring-coct-blue"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1">
                        2. In which city or town were you born?
                      </label>
                      <input
                        type="text"
                        required
                        value={regQ2}
                        onChange={(e) => setRegQ2(e.target.value)}
                        placeholder="e.g. Durban"
                        className={`block w-full px-3 py-1.5 border rounded-lg text-xs transition-all ${
                          isHigh
                            ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                            : "border-slate-200 text-slate-900 bg-white focus:ring-1 focus:ring-coct-blue"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1">
                        3. What was the name of your first school?
                      </label>
                      <input
                        type="text"
                        required
                        value={regQ3}
                        onChange={(e) => setRegQ3(e.target.value)}
                        placeholder="e.g. West End High School"
                        className={`block w-full px-3 py-1.5 border rounded-lg text-xs transition-all ${
                          isHigh
                            ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                            : "border-slate-200 text-slate-900 bg-white focus:ring-1 focus:ring-coct-blue"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider ${
                      isHigh
                        ? "bg-coct-yellow text-black hover:bg-white border-2 border-white"
                        : "text-white bg-coct-blue hover:bg-slate-900 shadow-md"
                    }`}
                  >
                    <UserPlus size={15} className="mr-2" />
                    Register National Placement Index
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubMode("login");
                      setLoginError("");
                    }}
                    className="w-full text-center text-xs text-slate-400 font-bold hover:underline"
                  >
                    Return to Login
                  </button>
                </motion.form>
              )}

              {/* SUBMODE: FORGOT ID ENTER */}
              {subMode === "forgot_id" && (
                <motion.form
                  key="forgot-id-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleForgotIdCheck}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100 font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setSubMode("login");
                        setLoginError("");
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">
                        Password Recovery Wizard
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Step 1: Locate your national index file.
                      </p>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-amber-50 text-amber-850 text-[11px] rounded-xl border border-amber-150 font-bold">
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                      Verify Your National ID Number
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Fingerprint size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={recoveryId}
                        onChange={(e) => setRecoveryId(e.target.value)}
                        placeholder="e.g. 9504125193084"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl font-medium sm:text-sm tracking-widest transition-all focus:outline-hidden focus:ring-2 ${
                          isHigh
                            ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
                            : "border-slate-200 text-slate-900 focus:ring-coct-blue focus:border-coct-blue"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full flex items-center justify-center py-3.5 px-4 rounded-full text-sm font-bold transition-all cursor-pointer uppercase tracking-wider ${
                      isHigh
                        ? "bg-coct-yellow text-black hover:bg-white border-2 border-white"
                        : "text-white bg-coct-blue hover:bg-coct-blue/90 shadow-md shadow-coct-blue/15"
                    }`}
                  >
                    Lookup Register &rarr;
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubMode("login");
                      setLoginError("");
                    }}
                    className="w-full text-center text-xs text-slate-400 font-bold hover:underline"
                  >
                    Cancel Verification
                  </button>
                </motion.form>
              )}

              {/* SUBMODE: FORGOT SEC QUESTIONS */}
              {subMode === "forgot_questions" && recoveryCitizen && (
                <motion.form
                  key="forgot-questions-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSecurityCheck}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-black px-2 py-0.5 rounded-full uppercase">
                        File Identified
                      </span>
                      <h3 className="text-sm font-black text-slate-800 mt-1">
                        Hello, {recoveryCitizen.fullName}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Answer the security coordinates on record to unlock
                        access.
                      </p>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-100 font-bold">
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-3 pt-2 bg-slate-50 -mx-6 px-6 py-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        1. Mother's maiden name?
                      </label>
                      <input
                        type="text"
                        required
                        value={ans1}
                        onChange={(e) => setAns1(e.target.value)}
                        placeholder="Your answer"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        2. Place of birth (city or town)?
                      </label>
                      <input
                        type="text"
                        required
                        value={ans2}
                        onChange={(e) => setAns2(e.target.value)}
                        placeholder="Your answer"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        3. What was the name of your first school?
                      </label>
                      <input
                        type="text"
                        required
                        value={ans3}
                        onChange={(e) => setAns3(e.target.value)}
                        placeholder="Your answer"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3 px-4 rounded-full text-xs font-black text-white bg-indigo-600 hover:bg-indigo-750 shadow-md transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Submit Answers
                  </button>

                  <div className="text-center pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Security attempts:{" "}
                      <strong className="text-rose-600">
                        {failedAttempts} / 3
                      </strong>
                    </span>
                  </div>
                </motion.form>
              )}

              {/* SUBMODE: RESET NEW PASSWORD */}
              {subMode === "forgot_reset" && recoveryCitizen && (
                <motion.form
                  key="forgot-reset-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <div className="text-center py-2">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <LockKeyhole size={24} />
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      Security Clearance Passed
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Specify a new secure vault password below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                      New Vault Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Specify new secure password"
                      className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-950 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3 px-4 rounded-full text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 cursor-pointer"
                  >
                    Reset Password & Sign In
                  </button>
                </motion.form>
              )}

              {/* SUBMODE: LOCKED OUT / REFER TO WARD COUNCILLOR */}
              {subMode === "failed_lockout" && (
                <motion.div
                  key="failed-lockout-alert"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5 text-center"
                >
                  <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-2 animate-bounce">
                    <AlertTriangle size={32} />
                  </div>

                  <div className="border-t border-b border-rose-100 py-4 px-2 space-y-2 select-none">
                    <h3 className="text-lg font-black text-rose-700 uppercase tracking-wide">
                      Access Denied
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-bold">
                      Failed recovery question matching (3/3 incorrect
                      attempts). For safety protocols, digital key mapping has
                      been locked.
                    </p>
                  </div>

                  <div className="bg-slate-50 border-2 border-indigo-150 rounded-[20px] p-5 text-left">
                    <span className="inline-flex items-center gap-1.5 text-xs text-indigo-900 font-extrabold uppercase tracking-wide mb-2">
                      <Building2 size={16} />
                      Ward Councillor Referral
                    </span>
                    <p className="text-xs text-slate-600 leading-normal mb-3">
                      Please physically schedule a support audit with your local{" "}
                      <strong>Ward Councillor</strong>. You must present:
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-5 font-semibold">
                      <li>Your printed physical National ID Card</li>
                      <li>Registered Placement Number</li>
                      <li>Official Utility Bill / Proof of Address</li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-slate-150 text-[10px] text-slate-400 text-center font-mono uppercase">
                      clearinghouse municipal case ID: CP-
                      {Math.floor(1000 + Math.random() * 9000)}-VERIFY
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubMode("login");
                      setFailedAttempts(0);
                      setIdNumber("");
                      setPassword("");
                      setLoginError("");
                    }}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Return to Portal Entrance
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* ADMIN TAB FORM */
            <form
              onSubmit={handleAdminSubmit}
              className="space-y-5"
              id="admin-login-form"
            >
              <div>
                <label
                  htmlFor="admincode"
                  className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-1.5"
                >
                  Administrative Credentials
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Shield size={18} />
                  </div>
                  <input
                    id="admincode"
                    name="admincode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter access code (or keep empty)"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm tracking-widest transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400 font-medium">
                  Leave completely blank or type{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">
                    admin
                  </code>{" "}
                  for prompt login.
                </p>
              </div>

              {loginError && (
                <div
                  id="admin-login-error"
                  className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-150 font-bold"
                >
                  <span>{loginError}</span>
                </div>
              )}

              <button
                id="admin-auth-submit"
                type="submit"
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-full text-sm font-bold text-white bg-slate-950 hover:bg-slate-900 focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Shield size={16} className="mr-2" />
                Access Admin Control
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50 -mx-6 -mb-8 px-6 py-4 rounded-b-4xl">
                <span className="font-bold text-slate-500">
                  Authorized Personnel Only
                </span>
                <span className="font-extrabold text-slate-800">
                  Gov.Sec V2
                </span>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mt-8">
        <p
          className={`text-xs leading-relaxed ${isHigh ? "text-slate-400" : "text-white/50"}`}
        >
          National Job Placement Clearinghouse &bull; Department of Social
          Development &bull; All data treated in accordance with National
          Security Protocols.
        </p>
      </div>
    </div>
  );
}
