import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Building,
  Briefcase,
  Plus,
  Edit,
  Trash,
  Users,
  Search,
  MapPin,
  Clock,
  Filter,
  LogOut,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  SlidersHorizontal,
  Check,
  RefreshCw,
  FileText,
  UserCheck,
  Inbox,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  Job,
  Citizen,
  Application,
  Interview,
  SystemNotification,
} from "../types";

interface AdminDashboardProps {
  onLogout: () => void;
  allJobs: Job[];
  setAllJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  allCitizens: Citizen[];
  setAllCitizens: React.Dispatch<React.SetStateAction<Citizen[]>>;
  allApplications: Application[];
  setAllApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  allInterviews: Interview[];
  setAllInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  contrast?: "city" | "high";
}

export default function AdminDashboard({
  onLogout,
  allJobs,
  setAllJobs,
  allCitizens,
  setAllCitizens,
  allApplications,
  setAllApplications,
  allInterviews,
  setAllInterviews,
  contrast = "city",
}: AdminDashboardProps) {
  const isHigh = contrast === "high";
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    "jobs" | "citizens" | "applications"
  >("jobs");

  // Job Form States
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobType, setJobType] = useState<Job["type"]>("Full-time");
  const [jobCategory, setJobCategory] =
    useState<Job["category"]>("Administration");
  const [jobTarget, setJobTarget] = useState("Open to All Citizens");
  const [jobDeadline, setJobDeadline] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqText, setJobReqText] = useState(""); // comma or newline separated
  const [jobFormError, setJobFormError] = useState("");

  // Search & Filter state
  const [jobQuery, setJobQuery] = useState("");
  const [jobCatFilter, setJobCatFilter] = useState("All");

  const [citizenQuery, setCitizenQuery] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const [appStatusFilter, setAppStatusFilter] = useState<
    | "All"
    | "applied"
    | "reviewing"
    | "interview_scheduled"
    | "action_required"
    | "placed"
    | "rejected"
  >("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Scheduling Interview form states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [intDate, setIntDate] = useState("");
  const [intLocation, setIntLocation] = useState("");
  const [intContact, setIntContact] = useState("");

  // Placement Form details
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placeStartDate, setPlaceStartDate] = useState("");
  const [placeReporting, setPlaceReporting] = useState("");
  const [placeLocation, setPlaceLocation] = useState("");
  const [placeMessage, setPlaceMessage] = useState("");

  // Reset Job form
  const resetJobForm = () => {
    setEditingJobId(null);
    setJobTitle("");
    setJobDept("");
    setJobLocation("");
    setJobSalary("");
    setJobType("Full-time");
    setJobCategory("Administration");
    setJobTarget("Open to All Citizens");
    setJobDeadline("");
    setJobDesc("");
    setJobReqText("");
    setJobFormError("");
  };

  // Submit Job Form
  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !jobTitle ||
      !jobDept ||
      !jobLocation ||
      !jobDeadline ||
      !jobSalary ||
      !jobDesc
    ) {
      setJobFormError("Please fill in all mandatory fields.");
      return;
    }

    const requirements = jobReqText
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (requirements.length === 0) {
      requirements.push("No custom credentials specified.");
    }

    if (editingJobId) {
      // Edit mode
      const updatedJobs = allJobs.map((job) => {
        if (job.id === editingJobId) {
          return {
            ...job,
            title: jobTitle,
            department: jobDept,
            location: jobLocation,
            salaryRange: jobSalary,
            type: jobType,
            category: jobCategory,
            targetAudience: jobTarget,
            deadline: jobDeadline,
            description: jobDesc,
            requirements,
          };
        }
        return job;
      });
      setAllJobs(updatedJobs);
      localStorage.setItem("cp_jobs", JSON.stringify(updatedJobs));
      setShowJobForm(false);
      resetJobForm();
    } else {
      // Create mode
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: jobTitle,
        department: jobDept,
        location: jobLocation,
        salaryRange: jobSalary,
        type: jobType,
        category: jobCategory,
        targetAudience: jobTarget,
        postedDate: new Date().toISOString().split("T")[0],
        deadline: jobDeadline,
        description: jobDesc,
        requirements,
      };

      const updatedJobs = [newJob, ...allJobs];
      setAllJobs(updatedJobs);
      localStorage.setItem("cp_jobs", JSON.stringify(updatedJobs));
      setShowJobForm(false);
      resetJobForm();
    }
  };

  // Trigger editing a job
  const handleEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobDept(job.department);
    setJobLocation(job.location);
    setJobSalary(job.salaryRange);
    setJobType(job.type);
    setJobCategory(job.category);
    setJobTarget(job.targetAudience);
    setJobDeadline(job.deadline);
    setJobDesc(job.description);
    setJobReqText(job.requirements.join("\n"));
    setShowJobForm(true);
  };

  // Delete matching job safely
  const handleDeleteJob = (id: string) => {
    if (
      confirm(
        "Are you absolutely certain you want to remove this job placement vacancy? All existing applications associated with it will remain referenced.",
      )
    ) {
      const remainingJobs = allJobs.filter((j) => j.id !== id);
      setAllJobs(remainingJobs);
      localStorage.setItem("cp_jobs", JSON.stringify(remainingJobs));
    }
  };

  // Update Application Status
  const handleUpdateAppStatus = (
    appId: string,
    status: Application["status"],
    extra?: Partial<Application>,
  ) => {
    const updatedApps = allApplications.map((app) => {
      if (app.id === appId) {
        const modified = { ...app, status, ...extra };
        return modified;
      }
      return app;
    });

    setAllApplications(updatedApps);
    localStorage.setItem("cp_applications", JSON.stringify(updatedApps));

    // Update state selected view
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status, ...extra });
    }

    // Add notification to citizen
    const app = allApplications.find((a) => a.id === appId);
    const job = allJobs.find((j) => j.id === app?.jobId);
    if (app && job) {
      const newNotification: SystemNotification = {
        id: `notif-${Date.now()}`,
        citizenIdNumber: app.citizenIdNumber,
        title: `Application Update: ${job.title}`,
        message:
          status === "reviewing"
            ? `Your application with ${job.department} has been moved to 'Under Review'.`
            : status === "action_required"
              ? `The recruitment bureau requires supplementary documents or qualifications updates for ${job.title}.`
              : status === "rejected"
                ? `Thank you for your application. Unfortunately, you were not selected for the role of ${job.title} at this time.`
                : `Your application status updated to ${status}.`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        isRead: false,
        type: status === "rejected" ? "alert" : "info",
      };

      try {
        const notifs = JSON.parse(
          localStorage.getItem("cp_notifications") || "[]",
        );
        localStorage.setItem(
          "cp_notifications",
          JSON.stringify([newNotification, ...notifs]),
        );
      } catch {}
    }
  };

  // Save Scheduled Interview
  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !intDate || !intLocation || !intContact) return;

    const job = allJobs.find((j) => j.id === selectedApp.jobId);
    if (!job) return;

    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      applicationId: selectedApp.id,
      jobId: job.id,
      jobTitle: job.title,
      citizenIdNumber: selectedApp.citizenIdNumber,
      citizenName: selectedApp.citizenName,
      dateTime: intDate,
      location: intLocation,
      status: "pending",
      contactPerson: intContact,
    };

    // Save Interview
    const updatedInterviews = [newInterview, ...allInterviews];
    setAllInterviews(updatedInterviews);
    localStorage.setItem("cp_interviews", JSON.stringify(updatedInterviews));

    // Update Application Status & note
    handleUpdateAppStatus(selectedApp.id, "interview_scheduled", {
      interviewerNotes: `Interview scheduled on ${intDate.replace("T", " ")}: Location: ${intLocation}. Point of contact: ${intContact}.`,
    });

    // Notify Citizen
    const newNotification: SystemNotification = {
      id: `notif-${Date.now()}`,
      citizenIdNumber: selectedApp.citizenIdNumber,
      title: "Interview Scheduled",
      message: `An official interview has been set up with ${job.department} for ${job.title} on ${intDate.replace("T", " ")}.`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      isRead: false,
      type: "info",
    };
    try {
      const notifs = JSON.parse(
        localStorage.getItem("cp_notifications") || "[]",
      );
      localStorage.setItem(
        "cp_notifications",
        JSON.stringify([newNotification, ...notifs]),
      );
    } catch {}

    setShowInterviewModal(false);
    setIntDate("");
    setIntLocation("");
    setIntContact("");
  };

  // Save Placement Confirmation
  const handlePlacementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedApp ||
      !placeStartDate ||
      !placeReporting ||
      !placeLocation ||
      !placeMessage
    )
      return;

    const job = allJobs.find((j) => j.id === selectedApp.jobId);
    if (!job) return;

    // Save placement parameters on the application
    handleUpdateAppStatus(selectedApp.id, "placed", {
      placementDetails: {
        startDate: placeStartDate,
        reportingTo: placeReporting,
        officeLocation: placeLocation,
        congratulationsMessage: placeMessage,
      },
      interviewerNotes: `Placement finalized. Deployment set for ${placeStartDate}.`,
    });

    // Notify Citizen
    const newNotification: SystemNotification = {
      id: `notif-${Date.now()}`,
      citizenIdNumber: selectedApp.citizenIdNumber,
      title: "Placement Confirmed! 🎉",
      message: `Urgent Promotion: Your placement as ${job.title} has been finalized. Starting date: ${placeStartDate}. View details in your vault!`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      isRead: false,
      type: "success",
    };
    try {
      const notifs = JSON.parse(
        localStorage.getItem("cp_notifications") || "[]",
      );
      localStorage.setItem(
        "cp_notifications",
        JSON.stringify([newNotification, ...notifs]),
      );
    } catch {}

    setShowPlacementModal(false);
    setPlaceStartDate("");
    setPlaceReporting("");
    setPlaceLocation("");
    setPlaceMessage("");
  };

  // Filter Jobs list
  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(jobQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(jobQuery.toLowerCase());
    const matchesCategory =
      jobCatFilter === "All" || job.category === jobCatFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter Citizens directory
  const filteredCitizens = allCitizens.filter((cit) => {
    return (
      cit.fullName.toLowerCase().includes(citizenQuery.toLowerCase()) ||
      cit.idNumber.includes(citizenQuery)
    );
  });

  // Filter Applications lists
  const filteredApps = allApplications.filter((app) => {
    return appStatusFilter === "All" || app.status === appStatusFilter;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isHigh ? "bg-black text-white" : "bg-slate-100 text-slate-800"}`}
    >
      {/* Red Administrative Active Ribbon */}
      <div
        className={`py-1 text-center font-bold font-mono text-[10px] tracking-widest uppercase z-50 shadow-xs ${isHigh ? "bg-yellow-400 text-black" : "bg-[#EF4444] text-white"}`}
      >
        ADMIN CONSOLE ACTIVE • JOB POSTING ENABLED
      </div>

      {/* Admin Header Station */}
      <header
        className={`text-white shadow-md border-b ${isHigh ? "bg-black border-yellow-400" : "bg-coct-navy border-slate-800"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3.5">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-900/45">
              <Building size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  CivicPortal{" "}
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                National Placement Agency Clearinghouse &bull; Authorizing
                Officer Panel
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-4.5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>{t("admin.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Stats Row - Vibrant Design with rounded-4xl bento shapes and bright gradients */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-indigo-600 text-white p-6 rounded-4xl  shadow-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-100">
                Active Jobs
              </p>
              <h3 className="text-4xl font-black mt-2">{allJobs.length}</h3>
            </div>
            <div className="p-3 bg-white/10 text-white rounded-2xl">
              <Briefcase size={24} />
            </div>
          </div>

          <div className="bg-teal-500 text-white p-6 rounded-4xl  shadow-teal-55 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-55">
                Registered Users
              </p>
              <h3 className="text-4xl font-black mt-2">{allCitizens.length}</h3>
            </div>
            <div className="p-3 bg-white/10 text-white rounded-2xl">
              <Users size={24} />
            </div>
          </div>

          <div className="bg-amber-400 text-slate-950 p-6 rounded-4xl  shadow-amber-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-900/60">
                Submissions
              </p>
              <h3 className="text-4xl font-black mt-2">
                {allApplications.length}
              </h3>
            </div>
            <div className="p-3 bg-black/5 text-slate-950 rounded-2xl">
              <Inbox size={24} />
            </div>
          </div>

          <div className="bg-rose-500 text-white p-6 rounded-4xl  shadow-rose-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-100">
                Placements
              </p>
              <h3 className="text-4xl font-black mt-2">
                {allApplications.filter((a) => a.status === "placed").length}
              </h3>
            </div>
            <div className="p-3 bg-white/10 text-white rounded-2xl">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        {/* Dashboard Menu Tabs */}
        <div
          className={`flex border-b mb-8 overflow-x-auto space-x-8 ${isHigh ? "border-yellow-400" : "border-slate-200"}`}
        >
          <button
            id="tab-btn-jobs"
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === "jobs"
                ? isHigh
                  ? "border-yellow-400 text-yellow-400 font-extrabold"
                  : "border-indigo-600 text-indigo-600 font-extrabold"
                : isHigh
                  ? "border-transparent text-slate-400 hover:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase size={18} />
            <span>{t("admin.jobs_tab")}</span>
          </button>
          <button
            id="tab-btn-citizens"
            onClick={() => setActiveTab("citizens")}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === "citizens"
                ? isHigh
                  ? "border-yellow-400 text-yellow-400 font-extrabold"
                  : "border-indigo-600 text-indigo-600 font-extrabold"
                : isHigh
                  ? "border-transparent text-slate-400 hover:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users size={18} />
            <span>{t("admin.citizens_tab")}</span>
          </button>
          <button
            id="tab-btn-applications"
            onClick={() => setActiveTab("applications")}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === "applications"
                ? isHigh
                  ? "border-yellow-400 text-yellow-400 font-extrabold"
                  : "border-indigo-600 text-indigo-600 font-extrabold"
                : isHigh
                  ? "border-transparent text-slate-400 hover:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Inbox size={18} />
            <span>{t("admin.applications_tab")}</span>
          </button>
        </div>

        {/* ==================== TAB 1: JOBS VACANCIES ==================== */}
        {activeTab === "jobs" && (
          <div className="space-y-6" id="admin-jobs-tab">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-5 rounded-4xl border border-slate-150 shadow-xs">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  id="admin-search-jobs"
                  type="text"
                  placeholder="Filter listings by title, department, or location..."
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-slate-900 font-medium"
                />
              </div>

              <div className="flex gap-3 justify-between items-center">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-205 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500">
                  <Filter size={14} />
                  <span>Category:</span>
                  <select
                    id="admin-filter-category"
                    value={jobCatFilter}
                    onChange={(e) => setJobCatFilter(e.target.value)}
                    className="font-bold bg-transparent text-slate-800 focus:outline-hidden border-none p-0 cursor-pointer text-xs"
                  >
                    <option value="All">{t("jobs.category_all")}</option>
                    <option value="Administration">Administration</option>
                    <option value="Technical">Technical</option>
                    <option value="Skilled Labor">Skilled Labor</option>
                    <option value="Community Service">Community Service</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <button
                  id="admin-open-add-job-btn"
                  onClick={() => {
                    resetJobForm();
                    setShowJobForm(true);
                  }}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Plus size={16} />
                  <span>{t("admin.add_job")}</span>
                </button>
              </div>
            </div>

            {/* Floating Form Drawer / Modal */}
            <AnimatePresence>
              {showJobForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md transition-all overflow-hidden"
                  id="job-form-block"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                    <h4 className="text-base font-bold text-slate-900 flex items-center">
                      <Briefcase size={18} className="mr-2 text-blue-600" />
                      {editingJobId
                        ? "Modify Opportunity Parameters"
                        : "Register New Placement Vacancy"}
                    </h4>
                    <button
                      id="close-job-form-btn"
                      onClick={() => {
                        setShowJobForm(false);
                        resetJobForm();
                      }}
                      className="text-slate-400 hover:text-slate-600 text-sm font-semibold hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                    >
                      Dismiss
                    </button>
                  </div>

                  <form
                    onSubmit={handleJobSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Official Title *
                      </label>
                      <input
                        id="form-title"
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Apprentice Electrician"
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Authorizing Department *
                      </label>
                      <input
                        id="form-dept"
                        type="text"
                        required
                        value={jobDept}
                        onChange={(e) => setJobDept(e.target.value)}
                        placeholder="e.g. Department of Infrastructure Services"
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Regional Location *
                      </label>
                      <input
                        id="form-location"
                        type="text"
                        required
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        placeholder="e.g. Durban, KZN"
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Estimated Salary Packages *
                      </label>
                      <input
                        id="form-salary"
                        type="text"
                        required
                        value={jobSalary}
                        onChange={(e) => setJobSalary(e.target.value)}
                        placeholder="e.g. R14,000 - R18,000 / Month"
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Contract Classification
                      </label>
                      <select
                        id="form-type"
                        value={jobType}
                        onChange={(e) =>
                          setJobType(e.target.value as Job["type"])
                        }
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      >
                        <option value="Full-time">Full-time Employee</option>
                        <option value="Part-time">Part-time Associate</option>
                        <option value="Contract">Fixed-Term Contract</option>
                        <option value="Internship">
                          Developmental Internship
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Sector Classification
                      </label>
                      <select
                        id="form-category"
                        value={jobCategory}
                        onChange={(e) =>
                          setJobCategory(e.target.value as Job["category"])
                        }
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      >
                        <option value="Administration">Administration</option>
                        <option value="Technical">Technical & IT</option>
                        <option value="Skilled Labor">
                          Skilled Labor & Trades
                        </option>
                        <option value="Community Service">
                          Community Service
                        </option>
                        <option value="Health">Healthcare Services</option>
                        <option value="Education">Education & Tutoring</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Target Audience Accents
                      </label>
                      <input
                        id="form-target"
                        type="text"
                        value={jobTarget}
                        onChange={(e) => setJobTarget(e.target.value)}
                        placeholder="e.g. Open to All, Youth Focus, Seniors, People with disabilities"
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Submission Deadline *
                      </label>
                      <input
                        id="form-deadline"
                        type="date"
                        required
                        value={jobDeadline}
                        onChange={(e) => setJobDeadline(e.target.value)}
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Detailed Description *
                      </label>
                      <textarea
                        id="form-description"
                        required
                        rows={3}
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        placeholder="Provide details on duties, project goals, shift hours, and potential for permanent placement..."
                        className="p-2.5 border border-slate-250 rounded-lg w-full text-slate-800 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Mandatory Entry Requirements (One per line)
                      </label>
                      <textarea
                        id="form-requirements"
                        rows={2}
                        value={jobReqText}
                        onChange={(e) => setJobReqText(e.target.value)}
                        placeholder="Rule 1: Registered with safety agency&#10;Rule 2: Valid mechanical driver's credentials"
                        className="p-2.5 border border-slate-250 rounded-lg w-full font-mono text-slate-800 text-sm"
                      />
                    </div>

                    {jobFormError && (
                      <div className="md:col-span-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-150">
                        {jobFormError}
                      </div>
                    )}

                    <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
                      <button
                        id="admin-cancel-job-btn"
                        type="button"
                        onClick={() => {
                          setShowJobForm(false);
                          resetJobForm();
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all"
                      >
                        {t("action.cancel")}
                      </button>
                      <button
                        id="admin-submit-job-btn"
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                      >
                        {editingJobId
                          ? t("action.save")
                          : t("admin.add_job")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vacancy Card List */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              id="admin-job-cards-container"
            >
              {filteredJobs.length === 0 ? (
                <div className="col-span-full bg-white text-center py-12 px-6 rounded-4xl border border-slate-155 text-slate-400">
                  <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-slate-700">
                    {t("jobs.no_results")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try relaxing queries, filters, or publish a new opportunity.
                  </p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-6 rounded-4xl border-2 border-transparent hover:border-indigo-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="badge badge-emerald mt-1">
                          {job.category}
                        </span>
                        <div className="flex space-x-1.5">
                          <button
                            title="Edit Listing"
                            id={`edit-job-btn-${job.id}`}
                            onClick={() => handleEditJob(job)}
                            className="p-1 px-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-150 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all"
                          >
                            {t("action.edit")}
                          </button>
                          <button
                            title="Delete Listing"
                            id={`delete-job-btn-${job.id}`}
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1 px-3 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent rounded-lg text-xs font-bold transition-all"
                          >
                            {t("action.delete")}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 mt-3 leading-tight hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold mt-1 flex items-center">
                        <Building
                          size={13}
                          className="mr-1 inline text-indigo-550"
                        />
                        {job.department}
                      </p>

                      <div className="flex flex-wrap gap-2.5 mt-4 text-xs font-semibold text-slate-600">
                        <span className="flex items-center text-slate-500">
                          <MapPin size={13} className="mr-1 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center text-slate-500">
                          {/* <DollarSign
                            size={13}
                            className="mr-1 text-emerald-600"
                          /> */}
                          {job.salaryRange}
                        </span>
                        <span className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          {job.type}
                        </span>
                      </div>

                      <p className="mt-4 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Info highlights */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                          🚨 {job.targetAudience}
                        </span>
                        <span className="text-slate-400 font-bold font-mono">
                          Deadline: {job.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CITIZEN DIRECTORY ==================== */}
        {activeTab === "citizens" && (
          <div className="space-y-6" id="admin-citizens-tab">
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-5 rounded-4xl border border-slate-150 shadow-xs">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  id="admin-search-citizens"
                  type="text"
                  placeholder="Query national database by Name, Skills, or ID Number..."
                  value={citizenQuery}
                  onChange={(e) => setCitizenQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-slate-900 font-medium"
                />
              </div>
              <div className="text-xs text-indigo-800 bg-indigo-50 font-bold px-4 py-2.5 rounded-xl border border-indigo-150 uppercase tracking-wider">
                Registered Residents:{" "}
                <strong className="text-indigo-950">
                  {filteredCitizens.length}
                </strong>
              </div>
            </div>

            {/* List and Grid */}
            <div className="bg-white rounded-4xl border border-slate-150  shadow-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table
                  className="min-w-full divide-y divide-slate-150"
                  id="citizens-directory-table"
                >
                  <thead className="bg-slate-55">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                      >
                        Full Citizen Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                      >
                        ID Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                      >
                        Highest Education
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                      >
                        Regist. Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                      >
                        Contact Specs
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest"
                      >
                        Operations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredCitizens.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 px-4 text-slate-450 text-xs"
                        >
                          <Users
                            size={32}
                            className="mx-auto text-slate-300 mb-2"
                          />
                          No registered individuals found. Complete a login
                          attempt in the user tab to register.
                        </td>
                      </tr>
                    ) : (
                      filteredCitizens.map((cit) => {
                        const citApps = allApplications.filter(
                          (a) => a.citizenIdNumber === cit.idNumber,
                        );
                        return (
                          <tr
                            key={cit.idNumber}
                            className="hover:bg-slate-50/50 transition-all"
                          >
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 bg-slate-100 text-slate-850 flex items-center justify-center rounded-xl font-bold text-sm border border-slate-200">
                                  {cit.fullName.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {cit.fullName}
                                  </div>
                                  <div className="text-xs text-slate-450">
                                    {cit.gender || "Not specified"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-sm font-mono text-slate-700 font-semibold">
                              {cit.idNumber}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-slate-700">
                              {cit.education || "High School Level"}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs font-mono text-slate-500">
                              {cit.registeredDate}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs">
                              <div className="text-slate-800 font-medium">
                                {cit.phone || "+27 General Line"}
                              </div>
                              <div className="text-slate-400">
                                {cit.email || "not.linked@digital.gov"}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-right text-xs font-semibold">
                              <button
                                id={`view-citizen-btn-${cit.idNumber}`}
                                onClick={() => setSelectedCitizen(cit)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 hover:border-blue-200 hover:bg-blue-100 rounded-lg transition-all"
                              >
                                <span>Detail File</span>
                                <ArrowUpRight size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Citizen Folder Modal */}
            <AnimatePresence>
              {selectedCitizen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-w-2xl w-full"
                    id="citizen-details-modal"
                  >
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-600 flex items-center justify-center rounded-xl font-bold border border-blue-500 text-white text-base">
                          {selectedCitizen.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold">
                            {selectedCitizen.fullName}
                          </h3>
                          <p className="text-xs text-slate-400">
                            National ID File: {selectedCitizen.idNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCitizen(null)}
                        className="text-slate-450 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg text-xs"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400 uppercase font-semibold tracking-wider">
                            Mobile Contact
                          </p>
                          <p className="text-slate-850 font-bold mt-0.5">
                            {selectedCitizen.phone || "None Spec."}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold tracking-wider">
                            Digital Mail
                          </p>
                          <p className="text-slate-850 font-bold mt-0.5">
                            {selectedCitizen.email || "None Spec."}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold tracking-wider">
                            Gender Profile
                          </p>
                          <p className="text-slate-850 font-bold mt-0.5">
                            {selectedCitizen.gender || "Not declared"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase font-semibold tracking-wider">
                            Date of First Clearance
                          </p>
                          <p className="text-slate-850 font-mono font-semibold mt-0.5">
                            {selectedCitizen.registeredDate}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5 text-xs">
                        <p className="text-slate-400 uppercase font-semibold tracking-wider mb-2">
                          Capabilities & Skill Accents
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCitizen.skills &&
                          selectedCitizen.skills.length > 0 ? (
                            selectedCitizen.skills.map((s) => (
                              <span
                                key={s}
                                className="bg-slate-100 text-slate-850 font-semibold px-2.5 py-1 rounded-lg border border-slate-200"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">
                              No custom skills specified. Default citizen
                              clearances set.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                          <Inbox size={15} className="mr-1.5 text-blue-500" />
                          Application and Placements Cleared
                        </h4>

                        <div className="space-y-3">
                          {allApplications.filter(
                            (a) =>
                              a.citizenIdNumber === selectedCitizen.idNumber,
                          ).length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-1">
                              This citizen hasn't applied for any vacancies yet.
                            </p>
                          ) : (
                            allApplications
                              .filter(
                                (a) =>
                                  a.citizenIdNumber ===
                                  selectedCitizen.idNumber,
                              )
                              .map((app) => {
                                const job = allJobs.find(
                                  (j) => j.id === app.jobId,
                                );
                                return (
                                  <div
                                    key={app.id}
                                    className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-850">
                                        {job?.title || "Unknown Vacancy"}
                                      </p>
                                      <p className="text-slate-450 text-[11px] font-semibold mt-0.5">
                                        {job?.department}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                        app.status === "placed"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : app.status === "interview_scheduled"
                                            ? "bg-blue-100 text-blue-800"
                                            : app.status === "action_required"
                                              ? "bg-amber-100 text-amber-800 font-bold"
                                              : app.status === "rejected"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {app.status === "interview_scheduled"
                                        ? "Interview Set"
                                        : app.status}
                                    </span>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ==================== TAB 3: PLACEMENT & APPLICATION BUREAU ==================== */}
        {activeTab === "applications" && (
          <div className="space-y-6" id="admin-applications-tab">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-4xl border border-slate-150 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">
                  Enrollment Cleared Submissions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control pipeline states from initial screen to direct
                  employment letters.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "All",
                    "applied",
                    "reviewing",
                    "interview_scheduled",
                    "action_required",
                    "placed",
                    "rejected",
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    id={`app-filter-${tab}`}
                    onClick={() => setAppStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      appStatusFilter === tab
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab === "interview_scheduled"
                      ? "Interview"
                      : tab === "action_required"
                        ? "Docs Needed"
                        : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions Pipeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Applications List */}
              <div className="lg:col-span-1 bg-white rounded-4xl border border-slate-150 shadow-xs p-4 space-y-3 max-h-150 overflow-y-auto">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">
                  Active Pipeline ({filteredApps.length})
                </span>

                {filteredApps.length === 0 ? (
                  <div className="text-center py-10 px-4 text-slate-400 text-xs">
                    <Inbox
                      className="mx-auto mb-2 opacity-30 text-slate-400"
                      size={28}
                    />
                    No application profiles match criteria.
                  </div>
                ) : (
                  filteredApps.map((app) => {
                    const job = allJobs.find((j) => j.id === app.jobId);
                    const isSelected = selectedApp?.id === app.id;
                    return (
                      <button
                        key={app.id}
                        id={`select-app-${app.id}`}
                        onClick={() => setSelectedApp(app)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-500 shadow-xs"
                            : "border-slate-150 bg-slate-50/50 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {app.citizenName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              app.status === "placed"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.status === "interview_scheduled"
                                  ? "bg-indigo-100 text-indigo-900"
                                  : app.status === "action_required"
                                    ? "bg-amber-100 text-amber-900"
                                    : app.status === "rejected"
                                      ? "bg-red-100 text-red-900"
                                      : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {app.status === "interview_scheduled"
                              ? "Scheduled"
                              : app.status === "action_required"
                                ? "Alert Docs"
                                : app.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium mt-1 leading-normal">
                          📍 {job?.title || "Unknown Vacancy"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                          ID:{" "}
                          <span className="font-mono text-slate-600">
                            {app.citizenIdNumber}
                          </span>
                        </p>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Columns: Active Inspector Card */}
              <div className="lg:col-span-2 space-y-4">
                {selectedApp ? (
                  <div
                    className="bg-white rounded-4xl border border-slate-150 shadow-xs p-6"
                    id="app-inspector-card"
                  >
                    {/* Header */}
                    <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-black text-slate-900">
                            {selectedApp.citizenName}
                          </h3>
                          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                            ID: {selectedApp.citizenIdNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Applied: {selectedApp.appliedDate}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {/* Instant Operations Dropdown/Actions */}
                        <button
                          id="btn-action-reviewing"
                          onClick={() =>
                            handleUpdateAppStatus(selectedApp.id, "reviewing")
                          }
                          className={`px-3 py-1.5 border rounded-lg text-xs font-semibold tracking-wide transition-all ${
                            selectedApp.status === "reviewing"
                              ? "bg-slate-800 border-slate-800 text-white"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          Mark Reviewing
                        </button>

                        <button
                          id="btn-action-docs"
                          onClick={() =>
                            handleUpdateAppStatus(
                              selectedApp.id,
                              "action_required",
                            )
                          }
                          className={`px-3 py-1.5 border rounded-lg text-xs font-semibold tracking-wide transition-all ${
                            selectedApp.status === "action_required"
                              ? "bg-amber-600 border-amber-600 text-white font-bold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          Alert Documents
                        </button>
                      </div>
                    </div>

                    {/* Vacancy parameters overview */}
                    <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Targets & Placement Vacancy
                      </h4>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-800 text-sm">
                            {allJobs.find((j) => j.id === selectedApp.jobId)
                              ?.title || "Unknown Job Title"}
                          </strong>
                          <p className="text-slate-450 font-medium mt-0.5">
                            {allJobs.find((j) => j.id === selectedApp.jobId)
                              ?.department || "Unknown Dept"}
                          </p>
                        </div>
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          🚨 Targets:{" "}
                          {
                            allJobs.find((j) => j.id === selectedApp.jobId)
                              ?.targetAudience
                          }
                        </span>
                      </div>
                    </div>

                    {/* Document Uploads Review */}
                    <div className="mt-6 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Document Upload Clearance
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between font-semibold ${
                            selectedApp.documents.idCopy
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                              : "bg-red-50 text-red-800 border-red-100"
                          }`}
                        >
                          <span>National ID Copy</span>
                          {selectedApp.documents.idCopy ? (
                            <Check size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between font-semibold ${
                            selectedApp.documents.cv
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                              : "bg-red-50 text-red-800 border-red-100"
                          }`}
                        >
                          <span>Curriculum Vitae</span>
                          {selectedApp.documents.cv ? (
                            <Check size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between font-semibold ${
                            selectedApp.documents.qualifications
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                              : "bg-red-50 text-red-800 border-red-100"
                          }`}
                        >
                          <span>Qualifications Check</span>
                          {selectedApp.documents.qualifications ? (
                            <Check size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between font-semibold ${
                            selectedApp.documents.proofOfAddress
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                              : "bg-red-50 text-red-800 border-red-100"
                          }`}
                        >
                          <span>Address Clearance</span>
                          {selectedApp.documents.proofOfAddress ? (
                            <Check size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scheduling Details / Interview information if exists */}
                    {allInterviews.some(
                      (i) => i.applicationId === selectedApp.id,
                    ) && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-150 rounded-xl text-xs">
                        <h5 className="font-bold text-blue-900 flex items-center mb-1 bg-blue-100/55 -mx-4 -mt-4 px-4 py-2 rounded-t-xl border-b border-blue-200">
                          <Calendar size={14} className="mr-1.5" />
                          Confirmed Interview Schedule
                        </h5>
                        {allInterviews
                          .filter((i) => i.applicationId === selectedApp.id)
                          .map((int) => (
                            <div
                              key={int.id}
                              className="grid grid-cols-2 gap-4 mt-2 font-medium"
                            >
                              <div>
                                <p className="text-slate-450">Date Time</p>
                                <p className="text-slate-800 font-bold">
                                  {int.dateTime.replace("T", " ")}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-450">
                                  Physical or Digital Location
                                </p>
                                <p className="text-slate-800 font-bold">
                                  {int.location}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-450">
                                  HR Officer in Charge
                                </p>
                                <p className="text-slate-800 font-bold">
                                  {int.contactPerson}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Official Placement Parameters */}
                    {selectedApp.status === "placed" &&
                      selectedApp.placementDetails && (
                        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-xs">
                          <h5 className="font-bold text-emerald-900 flex items-center mb-1.5">
                            <CheckCircle
                              size={14}
                              className="mr-1.5 text-emerald-600"
                            />
                            Final Employment letter Published
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                            <div>
                              <p className="text-emerald-700/80 font-semibold uppercase tracking-wider text-[10px]">
                                Registry Start Date
                              </p>
                              <p className="font-bold text-slate-850">
                                {selectedApp.placementDetails.startDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-emerald-700/80 font-semibold uppercase tracking-wider text-[10px]">
                                Reporting Officer
                              </p>
                              <p className="font-bold text-slate-850">
                                {selectedApp.placementDetails.reportingTo}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-emerald-700/80 font-semibold uppercase tracking-wider text-[10px]">
                                Deployment Physical Location
                              </p>
                              <p className="font-bold text-slate-850">
                                {selectedApp.placementDetails.officeLocation}
                              </p>
                            </div>
                            <div className="md:col-span-2 bg-white/70 p-3 rounded-lg border border-emerald-100">
                              <p className="text-emerald-700/80 font-semibold uppercase tracking-wider text-[10px] mb-1">
                                Official Message
                              </p>
                              <p className="italic text-slate-700">
                                {
                                  selectedApp.placementDetails
                                    .congratulationsMessage
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Interpersonal and Bureau Notes */}
                    <div className="mt-6">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Internal Bureau Notes
                      </label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs italic text-slate-600">
                        {selectedApp.interviewerNotes ||
                          "No custom internal bureau comments added yet."}
                      </div>
                    </div>

                    {/* Advanced Pipeline Operations */}
                    <div className="mt-8 pt-6 border-t border-slate-150 flex flex-wrap gap-3 justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          id="btn-trigger-interview-modal"
                          onClick={() => setShowInterviewModal(true)}
                          className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wide rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          <Calendar size={13} />
                          <span>Schedule Interview</span>
                        </button>

                        <button
                          id="btn-trigger-placement-modal"
                          onClick={() => {
                            // Set defaults for placement modal
                            setPlaceStartDate(
                              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                                .toISOString()
                                .split("T")[0],
                            );
                            const job = allJobs.find(
                              (j) => j.id === selectedApp.jobId,
                            );
                            setPlaceReporting("Direct Line Coordinator");
                            setPlaceLocation(
                              job?.location || "Regional Office",
                            );
                            setPlaceMessage(
                              `Dear ${selectedApp.citizenName}, Your placement is officially authorized. We are absolutely thrilled to welcome you on board.`,
                            );
                            setShowPlacementModal(true);
                          }}
                          className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wide rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          <UserCheck size={13} />
                          <span>Finalize Placement</span>
                        </button>
                      </div>

                      <button
                        id="btn-action-reject"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you authorized to reject this citizen candidacy?",
                            )
                          ) {
                            handleUpdateAppStatus(selectedApp.id, "rejected");
                          }
                        }}
                        className="px-3 py-2 text-red-650 hover:bg-red-50 text-xs font-semibold tracking-wide uppercase rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                      >
                        Decline Application
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-150 shadow-xs p-12 text-center text-slate-400">
                    <Inbox
                      size={42}
                      className="mx-auto mb-3 opacity-30 text-slate-400"
                    />
                    <p className="font-semibold text-slate-700">
                      Submissions Pipeline Inspector
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Select an active profile card on the left panel to execute
                      status adjustments, issue documents calls, specify
                      interview slottings, or dispatch digital hiring
                      credentials.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Modal: Schedule Interview Form */}
            <AnimatePresence>
              {showInterviewModal && selectedApp && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl  max-w-md w-full overflow-hidden border border-slate-200"
                    id="interview-scheduling-modal"
                  >
                    <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                      <h4 className="font-bold text-sm uppercase tracking-wider">
                        Schedule Official Interview
                      </h4>
                      <button
                        onClick={() => setShowInterviewModal(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form
                      onSubmit={handleScheduleInterviewSubmit}
                      className="p-6 space-y-4 text-xs"
                    >
                      <p className="text-slate-500 leading-normal mb-3">
                        Enter scheduled dates to synchronize records. This
                        schedules an online video session or in-office panel
                        directly on the citizen's notification panel.
                      </p>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">
                          Calendar Date & Time *
                        </label>
                        <input
                          id="interview-form-datetime"
                          type="datetime-local"
                          required
                          value={intDate}
                          onChange={(e) => setIntDate(e.target.value)}
                          className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">
                          Location Details *
                        </label>
                        <input
                          id="interview-form-location"
                          type="text"
                          required
                          value={intLocation}
                          onChange={(e) => setIntLocation(e.target.value)}
                          placeholder="e.g. Pretoria Bureau Boardroom 1B, or MS Teams Link"
                          className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">
                          Recruiter / Point of Contact *
                        </label>
                        <input
                          id="interview-form-contact"
                          type="text"
                          required
                          value={intContact}
                          onChange={(e) => setIntContact(e.target.value)}
                          placeholder="e.g. Officer Sipho Sithole (HR Directorate)"
                          className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-850"
                        />
                      </div>

                      <div className="pt-4 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowInterviewModal(false)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          id="interview-form-submit"
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                        >
                          Confirm & Post Interview
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Sub-Modal: Finalize Placement Form */}
            <AnimatePresence>
              {showPlacementModal && selectedApp && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl  max-w-lg w-full overflow-hidden border border-slate-200"
                    id="placement-finalization-modal"
                  >
                    <div className="bg-emerald-950 text-white p-5 flex justify-between items-center border-b border-emerald-900">
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider">
                          Confirm Official Placement
                        </h4>
                        <p className="text-[10px] text-emerald-400 mt-0.5">
                          Publish official hirable letters for the citizen
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPlacementModal(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form
                      onSubmit={handlePlacementSubmit}
                      className="p-6 space-y-4 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">
                            Official Start Date *
                          </label>
                          <input
                            id="place-form-start-date"
                            type="date"
                            required
                            value={placeStartDate}
                            onChange={(e) => setPlaceStartDate(e.target.value)}
                            className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">
                            Reporting Officer / Contact *
                          </label>
                          <input
                            id="place-form-reporting"
                            type="text"
                            required
                            value={placeReporting}
                            onChange={(e) => setPlaceReporting(e.target.value)}
                            placeholder="e.g. Dr Evelyn Peters (Deputy Conservator)"
                            className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-500 font-semibold mb-1">
                            Physical Station / Deployment Address *
                          </label>
                          <input
                            id="place-form-location"
                            type="text"
                            required
                            value={placeLocation}
                            onChange={(e) => setPlaceLocation(e.target.value)}
                            placeholder="e.g. Cape Town Forestry Bureau, Block F, Room 104"
                            className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-500 font-semibold mb-1">
                            Congratulations Message & Requirements instructions
                            *
                          </label>
                          <textarea
                            id="place-form-message"
                            required
                            rows={3}
                            value={placeMessage}
                            onChange={(e) => setPlaceMessage(e.target.value)}
                            className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowPlacementModal(false)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          id="place-form-submit"
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                        >
                          Authorize Placement List
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-850 text-slate-400 py-6 text-center text-xs mt-12">
        <p>
          &copy; 2026 Department of Public Enterprise &amp; Citizen
          Infrastructure Clearinghouse.
        </p>
        <p className="mt-1 text-[10px] text-slate-600">
          Administrative Sandbox &bull; All changes saved client side.
        </p>
      </footer>
    </div>
  );
}
