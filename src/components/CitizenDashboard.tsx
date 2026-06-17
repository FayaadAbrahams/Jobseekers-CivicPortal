import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Calendar, FileText, CheckCircle, Clock, ArrowRight, Lock, 
  UploadCloud, ShieldAlert, Bell, LogOut, MapPin, User, Mail, Phone, 
  ArrowUpRight, Download, Search, Award, Printer, Trash, Filter, AlertCircle, Sparkles, Check,
  Zap, RefreshCw, FileCheck, CheckSquare, Sparkle, AlertTriangle
} from 'lucide-react';
import { Job, Citizen, Application, Interview, SystemNotification } from '../types';

interface CitizenDashboardProps {
  citizen: Citizen;
  allJobs: Job[];
  allApplications: Application[];
  setAllApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  allInterviews: Interview[];
  allNotifications: SystemNotification[];
  setAllNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  onLogout: () => void;
  setAllCitizens: React.Dispatch<React.SetStateAction<Citizen[]>>;
  allCitizens: Citizen[];
  contrast?: 'city' | 'high';
}

export default function CitizenDashboard({
  citizen,
  allJobs,
  allApplications,
  setAllApplications,
  allInterviews,
  allNotifications,
  setAllNotifications,
  onLogout,
  setAllCitizens,
  allCitizens,
  contrast = 'city'
}: CitizenDashboardProps) {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'trackers' | 'documents' | 'notifications'>('vacancies');

  // Query & filters for jobs
  const [jobQuery, setJobQuery] = useState('');
  const [jobCatFilter, setJobCatFilter] = useState('All');

  // Selected Job for Detail modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Application wizard state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyWizardStep, setApplyWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Submitting profile overrides
  const [citizenPhone, setCitizenPhone] = useState(citizen.phone || '');
  const [citizenEmail, setCitizenEmail] = useState(citizen.email || '');
  const [citizenEducation, setCitizenEducation] = useState(citizen.education || 'High School Level');
  const [citizenSkillsSelected, setCitizenSkillsSelected] = useState<string[]>(citizen.skills || []);
  const [newSkillText, setNewSkillText] = useState('');

  // CV Scan state variables
  const [showCvScanner, setShowCvScanner] = useState(false);
  const [cvText, setCvText] = useState('');
  const [isCvScanning, setIsCvScanning] = useState(false);
  const [cvScanStatus, setCvScanStatus] = useState('');
  const [cvScore, setCvScore] = useState<number | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractionAlert, setExtractionAlert] = useState('');

  // Monitoring deadline proximity & creating system notifications on dashboard mount
  useEffect(() => {
    const today = new Date('2026-06-17'); // current date of workspace
    const updatedNotifications = [...allNotifications];
    let hasUpdated = false;

    allJobs.forEach(job => {
      const deadlineDate = new Date(job.deadline);
      const differenceMs = deadlineDate.getTime() - today.getTime();
      const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

      // If the job closes within 45 days soon
      if (differenceDays > 0 && differenceDays <= 45) {
        const key = `deadline-alert-${job.id}-${citizen.idNumber}`;
        const alreadyNotified = updatedNotifications.some(n => n.id === key);

        if (!alreadyNotified) {
          const alertItem: SystemNotification = {
            id: key,
            citizenIdNumber: citizen.idNumber,
            title: `⏳ Placement Closing: ${job.title}`,
            message: `URGENT NOTICE: The application portal for "${job.title}" under ${job.department} closes on ${job.deadline} (${differenceDays} days remaining). Please verify your files and apply for clearances today.`,
            date: '2026-06-17 08:30',
            isRead: false,
            type: 'alert'
          };
          updatedNotifications.unshift(alertItem);
          hasUpdated = true;
        }
      }
    });

    if (hasUpdated) {
      setAllNotifications(updatedNotifications);
      localStorage.setItem('cp_notifications', JSON.stringify(updatedNotifications));
    }
  }, [allJobs, citizen.idNumber]);

  // Preloaded CV mock templates for user testing ease of play
  const CV_TEMPLATES = [
    {
      name: "Community Service & Greening CV",
      text: `THABO KHUMALO
Tel: +27 72 849 2038
Email: thabo.khumalo@sa-gov.za
Location: Cape Town, WC

EDUCATION:
National Diploma in Environmental Studies

CORE SKILLS:
- First Aid certified responder
- Environmental Science Basics ecosystems training
- Public Speaking & Workshop guidance
- Greening campaigns & neighborhood recycling initiatives`
    },
    {
      name: "Administration & Data Office CV",
      text: `PRIYA NAIDOO
Tel: +27 83 912 3045
Email: priya.naidoo@domain.com
Location: Durban, KZN

EDUCATION:
Vocational Certificate in Office Administration

TECHNICAL SKILLS:
- Speedy Data Entry (55 WPM)
- Intermediate Microsoft Excel & Word formats
- Strong Customer Service communication desk hospitality
- High confidentiality & attention to detail standards`
    },
    {
      name: "Artisan Skilled Labor CV",
      text: `SIPHO ZUMA
Tel: +27 71 859 1045
Email: sipho.zuma@artisans.co.za
Location: Pretoria, GP

EDUCATION:
Vocational Certificate in Welding & Engineering

SKILLS:
- Heavy machinery maintenance supervisor
- Professional Welding, fabrication, and boilers
- Health & safety workshop compliance guidance
- 4 years active site workshop experience`
    }
  ];

  const handleCvScanAndExtract = () => {
    if (!cvText.trim()) {
      alert('Please fill in some CV content or select one of our preloaded municipal coordinates to test scans.');
      return;
    }

    setIsCvScanning(true);
    setCvScanStatus('Booting clearance parser...');
    setExtractionAlert('');
    setCvScore(null);

    setTimeout(() => {
      setCvScanStatus('Tracing communication vectors...');
      
      setTimeout(() => {
        setCvScanStatus('Matching credential specifications...');

        setTimeout(() => {
          const text = cvText.toLowerCase();

          // 1. Phone extraction
          let phoneVal = citizenPhone;
          const phoneRegex = /\+?[0-9]{2,3}[-\s]?[0-9]{2,3}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4}/g;
          const matchedPhones = cvText.match(phoneRegex);
          if (matchedPhones && matchedPhones.length > 0) {
            phoneVal = matchedPhones[0].trim();
          }

          // 2. Email extraction
          let emailVal = citizenEmail;
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const matchedEmails = cvText.match(emailRegex);
          if (matchedEmails && matchedEmails.length > 0) {
            emailVal = matchedEmails[0].trim();
          }

          // 3. Education lookup keyword-extraction
          let eduVal = citizenEducation;
          if (text.includes('postgraduate') || text.includes('honours') || text.includes('masters')) {
            eduVal = 'Postgraduate Honours';
          } else if (text.includes('bachelor') || text.includes('degree') || text.includes('university')) {
            eduVal = 'Bachelors Degree';
          } else if (text.includes('diploma')) {
            eduVal = 'Diploma';
          } else if (text.includes('vocational') || text.includes('certificate') || text.includes('trade')) {
            eduVal = 'Vocational Certificate';
          } else {
            eduVal = 'High School Level';
          }

          // 4. Skills scanning map
          const allSystemSkills = [
            'First Aid', 'Environmental Science Basics', 'Public Speaking',
            'Data Entry', 'Microsoft Excel', 'Customer Service',
            'TCP/IP', 'cabling', 'Welding', 'Boiler-making', 'Electrical Maintenance',
            'phonics', 'reading', 'Zulu', 'Xhosa', 'Afrikaans', 'Sotho', 'English',
            'flora', 'greenery', 'workshops', 'typing', 'confidentiality', 'recycling',
            'woodworking', 'plumbing', 'database management', 'accounting', 'office administration'
          ];

          const activeSkillsSet = new Set<string>([...citizenSkillsSelected]);
          const newAdded: string[] = [];

          allSystemSkills.forEach(s => {
            if (text.includes(s.toLowerCase())) {
              if (!activeSkillsSet.has(s)) {
                activeSkillsSet.add(s);
                newAdded.push(s);
              }
            }
          });

          // 5. Compatibility percentage score
          let matchesCount = 0;
          if (selectedJob) {
            selectedJob.requirements.forEach(req => {
              const words = req.toLowerCase().split(/[\s,.-]+/);
              const useful = words.filter(w => w.length > 4);
              const hasMatch = useful.some(word => text.includes(word));
              if (hasMatch) {
                matchesCount++;
              }
            });
          }

          const basePercent = 55 + Math.floor(Math.random() * 15);
          const calculatedScore = Math.min(98, basePercent + (matchesCount * 12));

          // Apply state update overrides
          setCitizenPhone(phoneVal);
          setCitizenEmail(emailVal);
          setCitizenEducation(eduVal);
          setCitizenSkillsSelected(Array.from(activeSkillsSet));
          setUploadedCv(true); // Treat CV checklist item as fulfilled directly on scan!

          setIsCvScanning(false);
          setCvScore(calculatedScore);
          setExtractedSkills(newAdded);
          setExtractionAlert('CV matching scans completed successfully! Your portfolio details are updated below.');
        }, 900);
      }, 700);
    }, 600);
  };

  // Draft documents uploaded
  const [uploadedId, setUploadedId] = useState(true);
  const [uploadedCv, setUploadedCv] = useState(false);
  const [uploadedQuails, setUploadedQuails] = useState(false);
  const [uploadedAddr, setUploadedAddr] = useState(false);

  // Uploaded file names (for display)
  const [uploadedIdFileName, setUploadedIdFileName] = useState<string | null>('National_ID.pdf');
  const [uploadedCvFileName, setUploadedCvFileName] = useState<string | null>(null);
  const [uploadedQuailsFileName, setUploadedQuailsFileName] = useState<string | null>(null);
  const [uploadedAddrFileName, setUploadedAddrFileName] = useState<string | null>(null);

  // Uploading animation state
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Selected Application for thorough timeline tracking
  const [trackingAppId, setTrackingAppId] = useState<string | null>(null);

  // Simulation printable placements letter
  const [printingPlacement, setPrintingPlacement] = useState<Application | null>(null);

  const myApplications = allApplications.filter(app => app.citizenIdNumber === citizen.idNumber);
  const myInterviews = allInterviews.filter(int => int.citizenIdNumber === citizen.idNumber);
  const myNotifications = allNotifications.filter(notif => notif.citizenIdNumber === citizen.idNumber);
  const unreadNotifications = myNotifications.filter(n => !n.isRead);

  // Document upload handler — accepts an optional real file for display
  const simulateUpload = (docType: 'id' | 'cv' | 'qualifications' | 'address', fileName?: string) => {
    setIsUploading(docType);
    setTimeout(() => {
      setIsUploading(null);
      if (docType === 'id') { setUploadedId(true); if (fileName) setUploadedIdFileName(fileName); }
      if (docType === 'cv') { setUploadedCv(true); if (fileName) setUploadedCvFileName(fileName); }
      if (docType === 'qualifications') { setUploadedQuails(true); if (fileName) setUploadedQuailsFileName(fileName); }
      if (docType === 'address') { setUploadedAddr(true); if (fileName) setUploadedAddrFileName(fileName); }
    }, 1200);
  };

  // Read a plain-text file into the CV scanner textarea
  const handleCvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => setCvText(ev.target?.result as string);
      reader.readAsText(file);
    } else {
      alert('Only .txt files can be read automatically. For PDF or image CVs, please paste your text into the field below.');
    }
    e.target.value = '';
  };

  // Submit Application
  const handleFinalSubmitApplication = () => {
    if (!selectedJob) return;

    // 1. Save or update Citizen phone, email, and skills in master directory
    const updatedCitizens = allCitizens.map(cit => {
      if (cit.idNumber === citizen.idNumber) {
        return {
          ...cit,
          phone: citizenPhone,
          email: citizenEmail,
          education: citizenEducation,
          skills: citizenSkillsSelected
        };
      }
      return cit;
    });
    setAllCitizens(updatedCitizens);
    localStorage.setItem('cp_citizens', JSON.stringify(updatedCitizens));

    // Update active session citizen fields indirectly dynamically
    citizen.phone = citizenPhone;
    citizen.email = citizenEmail;
    citizen.education = citizenEducation;
    citizen.skills = citizenSkillsSelected;

    // 2. Create Application Entry
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId: selectedJob.id,
      citizenIdNumber: citizen.idNumber,
      citizenName: citizen.fullName,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      documents: {
        idCopy: uploadedId,
        cv: uploadedCv,
        qualifications: uploadedQuails,
        proofOfAddress: uploadedAddr
      }
    };

    // Save Application
    const updatedApps = [newApplication, ...allApplications];
    setAllApplications(updatedApps);
    localStorage.setItem('cp_applications', JSON.stringify(updatedApps));

    // 3. Notify administrator & create check-back schedules for citizen in LocalStorage
    const newNotification: SystemNotification = {
      id: `notif-${Date.now()}`,
      citizenIdNumber: 'admin',
      title: 'New Submissions Cleared',
      message: `${citizen.fullName} submitted a clearance request for ${selectedJob.title}.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'info'
    };

    const citizenCheckNotif1: SystemNotification = {
      id: `check5-notif-${Date.now()}`,
      citizenIdNumber: citizen.idNumber,
      title: '📅 Day 5 Milestone: ID & Home Affairs Audit',
      message: `ACTION NEEDED: Return on 2026-06-22 to verify your ID and Home Affairs record validation score has finished syncing.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'alert'
    };

    const citizenCheckNotif2: SystemNotification = {
      id: `check12-notif-${Date.now()}`,
      citizenIdNumber: citizen.idNumber,
      title: '📅 Day 12 Milestone: Criminal & Security Clearances',
      message: `ACTION NEEDED: Return on 2026-06-29 to audit whether your police certificate background verification is complete.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'alert'
    };

    const citizenCheckNotif3: SystemNotification = {
      id: `check20-notif-${Date.now()}`,
      citizenIdNumber: citizen.idNumber,
      title: '📅 Day 20 Milestone: Municipal Evaluation & Panel Shortlist',
      message: `ACTION NEEDED: Return on 2026-07-07 to confirm interview schedule slotting for "${selectedJob.title}".`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'alert'
    };

    try {
      const liveNotifs = JSON.parse(localStorage.getItem('cp_notifications') || '[]');
      const finalNotifs = [
        newNotification,
        citizenCheckNotif1,
        citizenCheckNotif2,
        citizenCheckNotif3,
        ...liveNotifs
      ];
      setAllNotifications(finalNotifs);
      localStorage.setItem('cp_notifications', JSON.stringify(finalNotifs));
    } catch (e) {
      console.error(e);
    }

    // Set tracker identifier and step to step 4 Success page
    setTrackingAppId(newApplication.id);
    setApplyWizardStep(4);
  };

  // Supplement file submission after already applied
  const handleUploadMissingDoc = (appId: string, docType: keyof Application['documents']) => {
    const updated = allApplications.map(app => {
      if (app.id === appId) {
        const docs = { ...app.documents, [docType]: true };
        return { ...app, documents: docs };
      }
      return app;
    });
    setAllApplications(updated);
    localStorage.setItem('cp_applications', JSON.stringify(updated));

    // Show nice alert notification simulation
    const newNotification: SystemNotification = {
      id: `notif-${Date.now()}`,
      citizenIdNumber: citizen.idNumber,
      title: 'Supplementary Document Cleared',
      message: `Your uploaded proof file has been recorded for registration.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'success'
    };
    setAllNotifications([newNotification, ...allNotifications]);
    localStorage.setItem('cp_notifications', JSON.stringify([newNotification, ...allNotifications]));
  };

  // Add skill during wizard
  const handleAddSkill = () => {
    if (newSkillText.trim() && !citizenSkillsSelected.includes(newSkillText.trim())) {
      setCitizenSkillsSelected([...citizenSkillsSelected, newSkillText.trim()]);
      setNewSkillText('');
    }
  };

  // Check notification as Read
  const handleMarkNotificationRead = (notifId: string) => {
    const updated = allNotifications.map(n => {
      if (n.id === notifId) return { ...n, isRead: true };
      return n;
    });
    setAllNotifications(updated);
    localStorage.setItem('cp_notifications', JSON.stringify(updated));
  };

  // Clear all Notifications
  const handleClearAllNotifications = () => {
    const updated = allNotifications.filter(n => n.citizenIdNumber !== citizen.idNumber);
    setAllNotifications(updated);
    localStorage.setItem('cp_notifications', JSON.stringify(updated));
  };

  // Jobs filtering logic
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(jobQuery.toLowerCase()) || 
                          job.department.toLowerCase().includes(jobQuery.toLowerCase()) ||
                          job.location.toLowerCase().includes(jobQuery.toLowerCase());
    const matchesCategory = jobCatFilter === 'All' || job.category === jobCatFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Citizen Header bar */}
      <header className="bg-coct-navy text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-indigo-600 p-2.5 rounded-xl border border-indigo-500 shadow-md shadow-indigo-900/40">
              <User size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black leading-none">{citizen.fullName}</h1>
              <p className="text-xs text-slate-400 mt-1.5 font-mono tracking-widest">
                National ID Account: {citizen.idNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications Alert pill */}
            <button
              id="citizen-tab-btn-notifications"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <Bell size={20} className="text-slate-300" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            <button
              id="citizen-logout-btn"
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-4.5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs bar */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto space-x-8">
          <button
            id="cit-tab-btn-vacancies"
            onClick={() => setActiveTab('vacancies')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'vacancies'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Briefcase size={18} />
            <span>Search Vacancies</span>
          </button>
          <button
            id="cit-tab-btn-trackers"
            onClick={() => setActiveTab('trackers')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all relative ${
              activeTab === 'trackers'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Clock size={18} />
            <span>My Application Trackers</span>
            {myApplications.length > 0 && (
              <span className="ml-1.5 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {myApplications.length}
              </span>
            )}
          </button>
          <button
            id="cit-tab-btn-documents"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <FileText size={18} />
            <span>My Documents Vault</span>
          </button>
        </div>

        {/* ==================== TAB 1: SEARCH VACANCIES ==================== */}
        {activeTab === 'vacancies' && (
          <div className="space-y-6" id="citizen-vacancies-tab">
            
            {/* Search filter block */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[24px] border border-slate-150 shadow-xs">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  id="citizen-jobs-search"
                  type="text"
                  placeholder="Query publications by title, state department, or municipality..."
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-205 focus:bg-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-205 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500">
                <Filter size={14} className="text-slate-400" />
                <span>Sector:</span>
                <select
                  id="citizen-jobs-category-filter"
                  value={jobCatFilter}
                  onChange={(e) => setJobCatFilter(e.target.value)}
                  className="font-bold bg-transparent text-slate-800 focus:outline-hidden border-none p-0 cursor-pointer text-xs"
                >
                  <option value="All">All Categories</option>
                  <option value="Administration">Administration</option>
                  <option value="Technical">Technical & IT</option>
                  <option value="Skilled Labor">Skilled Labor</option>
                  <option value="Community Service">Community Service</option>
                  <option value="Health">Healthcare</option>
                  <option value="Education">Education</option>
                </select>
              </div>
            </div>

            {/* Grid of opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="citizen-listings-grid">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full bg-white text-center py-16 px-6 rounded-[32px] border border-slate-200 text-slate-400">
                  <Briefcase size={44} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-700">No Placement Openings Found</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try adjusting your filters or search keys above.</p>
                </div>
              ) : (
                filteredJobs.map(job => {
                  const alreadyApplied = myApplications.find(a => a.jobId === job.id);
                  return (
                    <div 
                      key={job.id} 
                      className="bg-white rounded-[32px] border-2 border-transparent hover:border-indigo-400 p-5.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="badge badge-indigo">
                            {job.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold font-mono flex items-center">
                            <Clock size={11} className="mr-1 text-slate-300" />
                            By: {job.deadline}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 mt-4 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center shrink-0 font-medium">
                          <MapPin size={11} className="mr-1 text-indigo-550" />
                          {job.location} &bull; {job.salaryRange}
                        </p>

                        <p className="text-xs text-indigo-600 mt-1 font-bold leading-normal">
                          {job.department}
                        </p>

                        <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-3">
                          {job.description}
                        </p>

                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {job.requirements.slice(0, 2).map((req, i) => (
                            <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold leading-tight">
                              ✓ {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full uppercase">
                          🚨 {job.targetAudience}
                        </span>

                        <button
                          id={`view-and-apply-${job.id}`}
                          onClick={() => {
                            setSelectedJob(job);
                            // Set initial upload states dynamically
                            setUploadedId(true);
                            setUploadedCv(citizen.skills && citizen.skills.length > 0);
                            setUploadedQuails(false);
                            setUploadedAddr(false);
                          }}
                          className={`inline-flex items-center space-x-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            alreadyApplied 
                              ? 'bg-emerald-100 text-emerald-800 border-2 border-transparent hover:bg-emerald-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                          }`}
                        >
                          <span>{alreadyApplied ? 'Tracking Progress' : 'View & Apply'}</span>
                          <ArrowRight size={13} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal: Job Details & Apply wizard */}
            <AnimatePresence>
              {selectedJob && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden max-w-2xl w-full"
                    id="job-info-wizard-modal"
                  >
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                            {selectedJob.category}
                          </span>
                          <span className="text-xs text-amber-400 font-bold flex items-center">
                            <Sparkles size={12} className="mr-1" />
                            {selectedJob.targetAudience}
                          </span>
                        </div>
                        <h3 className="text-lg font-black mt-2 leading-snug">{selectedJob.title}</h3>
                        <p className="text-xs text-indigo-400 mt-1.5 font-bold uppercase tracking-wider">{selectedJob.department}</p>
                      </div>
                      <button 
                        id="close-wizard-btn"
                        onClick={() => { setSelectedJob(null); setApplyWizardStep(1); }}
                        className="text-slate-400 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        ✕ Dismiss
                      </button>
                    </div>

                     {/* Step bar indicator if applying */}
                     {showApplyModal ? (
                       <div className="bg-indigo-50 border-b border-indigo-100 py-3 px-6 flex justify-between text-xs font-bold text-indigo-700">
                         {applyWizardStep === 4 ? (
                           <span className="text-emerald-800 flex items-center justify-center gap-1.5 font-extrabold uppercase text-center w-full">
                             ✨ South African Public Service (SAPS) Placement Registered Successfully!
                           </span>
                         ) : (
                           <>
                             <span className={applyWizardStep === 1 ? 'font-black underline text-indigo-900' : ''}>1. Portfolio Specs</span>
                             <span className={applyWizardStep === 2 ? 'font-black underline text-indigo-900' : ''}>2. Supplementary Toggles</span>
                             <span className={applyWizardStep === 3 ? 'font-black underline text-indigo-900' : ''}>3. Verify & Apply</span>
                           </>
                         )}
                       </div>
                     ) : null}

                    {/* Content Area */}
                    <div className="p-6 max-h-[500px] overflow-y-auto space-y-6">
                      
                      {!showApplyModal ? (
                        /* ================ Subview A: Job details ================ */
                        <div className="space-y-5 text-sm leading-relaxed text-slate-600">
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1.5">Employment Profile</h4>
                            <p>{selectedJob.description}</p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
                            <div>
                              <p className="text-slate-450 font-semibold">Location</p>
                              <p className="font-bold text-slate-900 mt-0.5">{selectedJob.location}</p>
                            </div>
                            <div>
                              <p className="text-slate-455 font-semibold">Contract Class</p>
                              <p className="font-bold text-slate-900 mt-0.5">{selectedJob.type}</p>
                            </div>
                            <div>
                              <p className="text-slate-455 font-semibold">Salary Package</p>
                              <p className="font-bold text-emerald-800 mt-0.5">{selectedJob.salaryRange}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2.5">Entry Specifications</h4>
                            <ul className="space-y-1.5">
                              {selectedJob.requirements.map((req, i) => (
                                <li key={i} className="flex items-start text-xs text-slate-700">
                                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-150 p-3.5 rounded-lg text-xs font-medium">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>
                              Absolute Final Deadline for digital files upload: <strong className="font-mono">{selectedJob.deadline}</strong>. Ensure address proofs are uploaded.
                            </span>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex justify-end">
                            {myApplications.find(a => a.jobId === selectedJob.id) ? (
                              <button
                                disabled
                                className="px-6 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold"
                              >
                                ✓ Already Applied for Clearance
                              </button>
                            ) : (
                              <button
                                id="wizard-start-btn"
                                onClick={() => setShowApplyModal(true)}
                                className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                              >
                                Launch Clearance Portal
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* ================ Subview B: Apply wizard ================ */
                        <div className="space-y-5">
                          
                          {/* Wizard Step 1: Profile specs */}
                          {applyWizardStep === 1 && (
                            <div className="space-y-4 text-xs" id="wizard-step-1">
                              <h4 className="font-bold text-slate-900 text-sm">Verify Personal Credentials</h4>
                              <p className="text-slate-450 leading-relaxed font-semibold">
                                Basic names and identity credentials are loaded automatically. You can scan your CV string to autofill communication routes and match skills, or type manually.
                              </p>

                              {/* CV AUTOMATION MATCH SCAN-AND-PARSE TOOL */}
                              <div className="bg-indigo-50/50 border-2 border-indigo-150 rounded-[24px] p-4.5 space-y-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                                      <Zap size={14} className="animate-pulse" />
                                    </span>
                                    <div>
                                      <h5 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                                        Intelligent CV Matcher & Scanner
                                        <span className="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-0.5 rounded-full font-black">AI Parse</span>
                                      </h5>
                                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                        Scan your CV contents to automatically map credentials, record phone logs, and test requirements compatibility.
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setShowCvScanner(!showCvScanner)}
                                    className="text-[10px] font-black uppercase text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                                  >
                                    {showCvScanner ? 'Hide' : 'Expand Scanner'}
                                  </button>
                                </div>

                                {showCvScanner && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-3 border-t border-indigo-100 space-y-3"
                                  >
                                    {/* Preloads */}
                                    <div>
                                      <span className="block text-[10px] font-bold text-indigo-900 mb-1.5">
                                        Draft CV Templates (Click to Auto-load for testing):
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {CV_TEMPLATES.map((tpl, i) => (
                                          <button
                                            key={i}
                                            type="button"
                                            onClick={() => setCvText(tpl.text)}
                                            className="bg-white hover:bg-indigo-50 text-slate-800 border-2 border-slate-100 rounded-lg text-[9px] py-1 px-2.5 font-bold transition-all cursor-pointer flex items-center gap-1"
                                          >
                                            <FileText size={10} className="text-slate-400" />
                                            {tpl.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Textarea */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <label htmlFor="cv-text-input" className="block text-[10px] font-extrabold text-indigo-900">
                                          Paste CV Contents / Skills Summary Text:
                                        </label>
                                        <label className="text-[9px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                                          <UploadCloud size={10} />
                                          Upload .txt File
                                          <input
                                            type="file"
                                            accept=".txt"
                                            className="hidden"
                                            onChange={handleCvFileUpload}
                                          />
                                        </label>
                                      </div>
                                      <textarea
                                        id="cv-text-input"
                                        rows={4}
                                        value={cvText}
                                        onChange={(e) => setCvText(e.target.value)}
                                        placeholder="Paste your CV text here, or upload a .txt file above..."
                                        className="w-full text-slate-900 font-semibold bg-white text-[11px] border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-mono focus:outline-hidden"
                                      />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-between items-center pt-1 animate-fade-in">
                                      <button
                                        type="button"
                                        disabled={isCvScanning}
                                        onClick={handleCvScanAndExtract}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-350 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wide shadow-sm"
                                      >
                                        {isCvScanning ? (
                                          <>
                                            <RefreshCw size={12} className="animate-spin" />
                                            <span>{cvScanStatus}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Zap size={12} />
                                            <span>Scan & Extract CV</span>
                                          </>
                                        )}
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => setCvText('')}
                                        className="text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase"
                                      >
                                        Clear Text
                                      </button>
                                    </div>

                                    {/* Scanning Feedback Alert & Results */}
                                    {extractionAlert && (
                                      <div className="bg-emerald-55 border border-emerald-250 rounded-xl p-3.5 space-y-2 text-emerald-950 animate-fade-in">
                                        <div className="flex items-center gap-2">
                                          <FileCheck size={16} className="text-emerald-700 shrink-0" />
                                          <span className="font-extrabold text-xs">{extractionAlert}</span>
                                        </div>
                                        
                                        {cvScore !== null && (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 mt-1 border-t border-emerald-150">
                                            {/* Score Metric */}
                                            <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                                              <div className="relative h-10 w-10 flex items-center justify-center shrink-0 rounded-full bg-indigo-50 text-indigo-700 font-mono font-black text-xs border border-indigo-150">
                                                {cvScore}%
                                              </div>
                                              <div>
                                                <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Eligibility Alignment</p>
                                                <p className="text-[10px] text-slate-700 font-extrabold leading-tight">
                                                  {cvScore >= 80 ? 'Outstanding compatibility' : cvScore >= 65 ? 'Good general alignment' : 'Moderate profile mapping'}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Skills Found */}
                                            <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                                              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mb-1">Newly Linked Skills</p>
                                              {extractedSkills.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 font-medium">Mapped to registered profile.</p>
                                              ) : (
                                                <div className="flex flex-wrap gap-1">
                                                  {extractedSkills.map((s, idx) => (
                                                    <span key={idx} className="bg-indigo-50 text-indigo-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-100">
                                                      ✓ {s}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-slate-500 font-semibold mb-1">Full Names (Verified ID)</label>
                                  <input 
                                    type="text" 
                                    disabled 
                                    value={citizen.fullName}
                                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-semibold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-semibold mb-1">ID Number (Verified ID)</label>
                                  <input 
                                    type="text" 
                                    disabled 
                                    value={citizen.idNumber}
                                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-semibold font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-semibold mb-1">Mobile Contact Phone *</label>
                                  <input 
                                    id="wizard-phone"
                                    type="text" 
                                    required
                                    value={citizenPhone}
                                    onChange={(e) => setCitizenPhone(e.target.value)}
                                    placeholder="e.g. +27 72 849 2038"
                                    className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-semibold mb-1">Email Mailbox *</label>
                                  <input 
                                    id="wizard-email"
                                    type="email" 
                                    required
                                    value={citizenEmail}
                                    onChange={(e) => setCitizenEmail(e.target.value)}
                                    placeholder="e.g. thabo@khumalo.com"
                                    className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-slate-500 font-semibold mb-1">Highest Academic Qualification Cleared</label>
                                  <select
                                    id="wizard-education"
                                    value={citizenEducation}
                                    onChange={(e) => setCitizenEducation(e.target.value)}
                                    className="w-full p-2.5 border border-slate-250 rounded-lg text-slate-800"
                                  >
                                    <option value="High School Level">High School Level Credentials</option>
                                    <option value="Vocational Certificate">Vocational Training / Trade Certificate</option>
                                    <option value="Diploma">National Diploma</option>
                                    <option value="Bachelors Degree">Bachelors Degree</option>
                                    <option value="Postgraduate Honours">Postgraduate Honours / Masters</option>
                                  </select>
                                </div>
                              </div>

                              <div className="pt-4 flex justify-end">
                                <button
                                  id="wizard-next-1"
                                  onClick={() => {
                                    if (!citizenPhone || !citizenEmail) {
                                      alert('Phone & Email communication properties are necessary.');
                                      return;
                                    }
                                    setApplyWizardStep(2);
                                  }}
                                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                  Next: Upload Credentials
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Wizard Step 2: Documents upload */}
                          {applyWizardStep === 2 && (
                            <div className="space-y-4 text-xs" id="wizard-step-2">
                              <h4 className="font-bold text-slate-900 text-sm font-sans">Supplementary Files Checklist</h4>
                              <p className="text-slate-450 leading-relaxed">
                                Upload digital PDF or image scans of your certificates. The hiring agency reviews CVs and address declarations prior to panels scheduling.
                              </p>

                              <div className="space-y-3">
                                {/* Doc Item 1: ID COPY */}
                                <div className="p-3.5 bg-slate-50 border border-slate-250 rounded-xl flex items-center justify-between">
                                  <div>
                                    <h5 className="font-bold text-slate-800">Copy of National ID Card *</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Mandatory for authentication checks.</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {uploadedId ? (
                                      <span className="text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-1 rounded">
                                        ✓ Uploaded
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isUploading !== null}
                                        onClick={() => simulateUpload('id')}
                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all"
                                      >
                                        {isUploading === 'id' ? 'Processing...' : 'Upload Scan'}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Doc Item 2: CV */}
                                <div className="p-3.5 bg-slate-50 border border-slate-250 rounded-xl flex items-center justify-between">
                                  <div>
                                    <h5 className="font-bold text-slate-800">Curriculum Vitae (CV) Profile *</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Details previous working and vocational projects.</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {uploadedCv ? (
                                      <span className="text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-1 rounded">
                                        ✓ Uploaded
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isUploading !== null}
                                        onClick={() => simulateUpload('cv')}
                                        className="px-3 py-1.5 bg-blue-55 text-blue-700 rounded-lg font-bold hover:bg-blue-100 transition-all"
                                      >
                                        {isUploading === 'cv' ? 'Processing...' : 'Upload Scan'}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Doc Item 3: Qualifications */}
                                <div className="p-3.5 bg-slate-50 border border-slate-250 rounded-xl flex items-center justify-between">
                                  <div>
                                    <h5 className="font-bold text-slate-800">Academic / Technical Qualifications</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Attach degrees, certificates or diplomas.</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {uploadedQuails ? (
                                      <span className="text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-1 rounded">
                                        ✓ Uploaded
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isUploading !== null}
                                        onClick={() => simulateUpload('qualifications')}
                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                                      >
                                        {isUploading === 'qualifications' ? 'Processing...' : 'Upload Scan'}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Doc Item 4: Proof of address */}
                                <div className="p-3.5 bg-slate-50 border border-slate-250 rounded-xl flex items-center justify-between">
                                  <div>
                                    <h5 className="font-bold text-slate-800">Local Proof of Address Checklist</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Utility bill, bank clearance, or landlord letter.</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {uploadedAddr ? (
                                      <span className="text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-1 rounded">
                                        ✓ Uploaded
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isUploading !== null}
                                        onClick={() => simulateUpload('address')}
                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                                      >
                                        {isUploading === 'address' ? 'Processing...' : 'Upload Scan'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 flex justify-between">
                                <button
                                  type="button"
                                  onClick={() => setApplyWizardStep(1)}
                                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                                >
                                  Back
                                </button>
                                <button
                                  id="wizard-next-2"
                                  onClick={() => {
                                    if (!uploadedId) {
                                      alert('National Identity Copy is mandatory.');
                                      return;
                                    }
                                    setApplyWizardStep(3);
                                  }}
                                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                  Next: Review Profile
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Wizard Step 3: Review & Submit */}
                          {applyWizardStep === 3 && (
                            <div className="space-y-4 text-xs animate-fadeIn" id="wizard-step-3">
                              <h4 className="font-bold text-slate-900 text-sm">Review & Finalize Submission</h4>
                              <p className="text-slate-450 leading-relaxed">
                                Review your verified profiles details. Confirm that files are readable before registering. Double-check deadline bounds.
                              </p>

                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                <p className="font-bold text-slate-800 text-[13px]">{selectedJob.title}</p>
                                <p className="text-slate-400 font-semibold">{selectedJob.department}</p>
                                <div className="border-t border-slate-200 my-2 pt-2 grid grid-cols-2 gap-2 text-slate-650">
                                  <div>Verified Name: <strong className="text-slate-800">{citizen.fullName}</strong></div>
                                  <div>Verified ID: <strong className="text-slate-805 font-mono">{citizen.idNumber}</strong></div>
                                  <div>Phone: <strong className="text-slate-850">{citizenPhone}</strong></div>
                                  <div>Email: <strong className="text-slate-850">{citizenEmail}</strong></div>
                                  <div>Education: <strong className="text-slate-850">{citizenEducation}</strong></div>
                                </div>

                                <div className="pt-2.5 border-t border-slate-200 text-slate-500 font-bold">
                                  Checked Attachments: {' '}
                                  <span className="text-emerald-700">
                                    {[
                                      uploadedId ? 'ID CARD' : '',
                                      uploadedCv ? 'CV CV' : '',
                                      uploadedQuails ? 'Qualifications' : '',
                                      uploadedAddr ? 'Address Proof' : ''
                                    ].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              </div>

                              <div className="p-3 bg-blue-50 border border-blue-150 rounded-xl text-blue-900 leading-normal font-medium">
                                By pressing "Submit Placement Application" you authorize the National Placement Agency and its departments to verify ID Number clearances with Home Affairs and process document credentials securely.
                              </div>

                              <div className="pt-4 flex justify-between">
                                <button
                                  type="button"
                                  onClick={() => setApplyWizardStep(2)}
                                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                                >
                                  Back
                                </button>
                                <button
                                  id="wizard-final-submit"
                                  onClick={handleFinalSubmitApplication}
                                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md cursor-pointer"
                                >
                                  Submit Placement Application
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Wizard Step 4: Success & Check-back Timeline */}
                          {applyWizardStep === 4 && (
                            <div className="space-y-5 text-xs animate-fadeIn text-slate-700" id="wizard-step-4">
                              <div className="text-center py-4 space-y-2">
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-600 animate-bounce">
                                  <CheckCircle size={28} />
                                </div>
                                <h4 className="font-extrabold text-emerald-950 text-base">Application Successfully Lodged!</h4>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium text-[11px]">
                                  Your placement application has been securely registered within the South African national database system under <strong>Rands (R)</strong> compensation indexes.
                                </p>
                              </div>

                              {/* TIMELINE PROGRESS & RETURN TIMINGS */}
                              <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4.5 space-y-3.5">
                                <div className="flex items-center space-x-2 text-amber-950">
                                  <Clock size={16} className="text-amber-700 shrink-0" />
                                  <span className="font-black text-xs uppercase tracking-wide">Mandatory Return Schedule & Checkpoints</span>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-normal font-semibold">
                                  South African public placement roles require strict physical & biometric double-checks. You must return to this portal on the following days to verify your position and clear pending status requirements:
                                </p>

                                <div className="space-y-4 relative pl-3.5 border-l-2 border-indigo-200">
                                  {/* Day 5 */}
                                  <div className="relative">
                                    <span className="absolute -left-[20.5px] top-0.5 h-3 w-3 bg-indigo-600 rounded-full border-2 border-white" />
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between items-center">
                                        <span className="font-black text-indigo-950 text-xs">Checkpoint 1: Home Affairs ID Cleanliness Inspection</span>
                                        <span className="bg-indigo-100 text-indigo-900 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono">Day 5 • 2026-06-22</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 leading-normal">
                                        System performs automated DHA validation checks. Log back to verify your primary address & citizen ID is marked <strong className="text-slate-700">"CLEARED"</strong>.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Day 12 */}
                                  <div className="relative">
                                    <span className="absolute -left-[20.5px] top-0.5 h-3 w-3 bg-amber-500 rounded-full border-2 border-white" />
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between items-center">
                                        <span className="font-black text-amber-950 text-xs">Checkpoint 2: Police Vetting & Security Clearances</span>
                                        <span className="bg-amber-100 text-amber-900 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono">Day 12 • 2026-06-29</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 leading-normal">
                                        Check if background reference certifications have fully synchronized with placement databases.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Day 20 */}
                                  <div className="relative">
                                    <span className="absolute -left-[20.5px] top-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between items-center">
                                        <span className="font-black text-emerald-950 text-xs">Checkpoint 3: Local Municipal Interview Scheduling</span>
                                        <span className="bg-emerald-100 text-emerald-900 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono">Day 20 • 2026-07-07</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 leading-normal">
                                        Final Shortlists announced. Log back to select your physical face-to-face evaluation interview timeslot on the municipal roster.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex bg-indigo-50 border border-indigo-150 rounded-xl p-3 items-center justify-between">
                                <div className="space-y-0.5">
                                  <h5 className="font-bold text-indigo-950 text-[11px]">Sync Reminders to Phone Calendar?</h5>
                                  <p className="text-[9px] text-slate-500">Enable automatic reminder tags for return checkpoints.</p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => alert(`📅 Calendar Alerts Configured!\nYour calendar has been updated with return reminders for Day 5 (June 22), Day 12 (June 29), and Day 20 (July 7).\nYou will also receive native placement system alerts.`)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  ⏰ Export Schedule
                                </button>
                              </div>

                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowApplyModal(false);
                                    setSelectedJob(null);
                                    setApplyWizardStep(1);
                                    setActiveTab('trackers');
                                  }}
                                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-905 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  Acknowledge & Track Application
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ==================== TAB 2: MY APPLICATION TRACKERS ==================== */}
        {activeTab === 'trackers' && (
          <div className="space-y-6" id="citizen-trackers-tab">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left column: submissions history */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-150 p-4 space-y-3.5 max-h-[500px] overflow-y-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">My Submissions Portal</span>
                
                {myApplications.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <FileText className="mx-auto mb-2 opacity-30 text-slate-400" size={28} />
                    You haven't applied for any placement channels yet. Check the vacancies tab to launch one!
                  </div>
                ) : (
                  myApplications.map(app => {
                    const job = allJobs.find(j => j.id === app.jobId);
                    const isSelected = trackingAppId === app.id;
                    return (
                      <button
                        key={app.id}
                        id={`tracker-app-${app.id}`}
                        onClick={() => setTrackingAppId(app.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-blue-50/70 border-blue-500 shadow-xs' 
                            : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-slate-900 font-sans leading-snug line-clamp-2">
                            {job?.title || 'Unknown Placement Title'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                            app.status === 'placed' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : app.status === 'interview_scheduled'
                              ? 'bg-blue-105 text-blue-800'
                              : app.status === 'action_required'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-080'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {app.status === 'interview_scheduled' ? 'Scheduled' : app.status === 'action_required' ? 'Alert Documents' : app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 font-semibold">Submitted: {app.appliedDate}</p>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right column: detailed tracking pipeline & documents */}
              <div className="lg:col-span-2 space-y-6">
                
                {trackingAppId && myApplications.find(a => a.id === trackingAppId) ? (() => {
                  const app = myApplications.find(a => a.id === trackingAppId)!;
                  const job = allJobs.find(j => j.id === app.jobId);
                  const relatedInterview = myInterviews.find(i => i.applicationId === app.id);
                  
                  return (
                    <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-6" id="tracker-details-card">
                      
                      {/* Header block */}
                      <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded uppercase tracking-wider font-bold">
                            Job ID Reference: {app.jobId}
                          </span>
                          <h3 className="text-base font-black text-slate-900 mt-2">{job?.title}</h3>
                          <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5">{job?.department}</p>
                        </div>
                      </div>

                      {/* Timeline Steps */}
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Official Progress Pipeline</h4>
                        <div className="space-y-6">
                          
                          {/* Step 1: Applied */}
                          <div className="flex space-x-3.5">
                            <div className="flex flex-col items-center">
                              <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                                <Check size={13} />
                              </div>
                              <div className="w-0.5 bg-emerald-500 flex-1 my-1 min-h-[20px]" />
                            </div>
                            <div className="text-xs pb-1.5">
                              <span className="font-bold text-slate-900 block text-sm">Application Clearances Registered</span>
                              <p className="text-slate-450 mt-0.5 leading-relaxed">
                                Complete profiles submitted successfully on {app.appliedDate}. Registered onto clearing system.
                              </p>
                            </div>
                          </div>

                          {/* Step 2: Under Review */}
                          <div className="flex space-x-3.5">
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                                ['reviewing', 'interview_scheduled', 'action_required', 'placed', 'rejected'].includes(app.status)
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 text-slate-500 font-bold'
                              }`}>
                                {['reviewing', 'interview_scheduled', 'action_required', 'placed', 'rejected'].includes(app.status) ? (
                                  <Check size={13} />
                                ) : (
                                  <span>2</span>
                                )}
                              </div>
                              <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${
                                ['interview_scheduled', 'placed', 'rejected'].includes(app.status) ? 'bg-emerald-500' : 'bg-slate-200'
                              }`} />
                            </div>
                            <div className="text-xs pb-1.5">
                              <span className="font-bold text-slate-900 block text-sm">Officer Screening & Backlog Checks</span>
                              <p className="text-slate-450 mt-0.5 leading-relaxed">
                                {['reviewing', 'interview_scheduled', 'action_required', 'placed', 'rejected'].includes(app.status) 
                                  ? 'Cleared basic screening benchmarks. Background and ID authentication complete.'
                                  : 'Awaiting administrator dispatch reviews.'}
                              </p>
                            </div>
                          </div>

                          {/* Step 3: Interview Scheduled */}
                          <div className="flex space-x-3.5">
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                                ['interview_scheduled', 'placed'].includes(app.status)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-500 font-bold'
                              }`}>
                                {['placed'].includes(app.status) ? (
                                  <Check size={13} />
                                ) : app.status === 'interview_scheduled' ? (
                                  <Calendar size={13} />
                                ) : (
                                  <span>3</span>
                                )}
                              </div>
                              <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${
                                ['placed'].includes(app.status) ? 'bg-emerald-500' : 'bg-slate-200'
                              }`} />
                            </div>
                            <div className="text-xs pb-1.5 flex-1">
                              <span className="font-bold text-slate-900 block text-sm">Interviews & Evaluations Slot</span>
                              
                              {relatedInterview ? (
                                <div className="mt-2.5 p-4 bg-blue-50 border border-blue-150 rounded-xl space-y-2">
                                  <div className="flex items-center space-x-1.5 font-bold text-blue-900 uppercase tracking-wider text-[10px]">
                                    <Calendar size={12} />
                                    <span>Confirmed Interview Notice</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                                    <div>Date: <strong className="text-slate-850 font-mono">{relatedInterview.dateTime.replace('T', ' ')}</strong></div>
                                    <div>Point of Contact: <strong className="text-slate-850">{relatedInterview.contactPerson}</strong></div>
                                    <div className="md:col-span-2">Desk/Channel: <strong className="text-slate-850">{relatedInterview.location}</strong></div>
                                  </div>
                                </div>
                              ) : app.status === 'rejected' ? (
                                <p className="text-red-700 font-semibold mt-1">Hiring process terminated by Department Recruiters.</p>
                              ) : (
                                <p className="text-slate-450 mt-0.5 leading-relaxed">
                                  Subject to shortlisting counts. Candidates will be notified on notification hubs once scheduled.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Step 4: Placement Confirmation */}
                          <div className="flex space-x-3.5">
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                                app.status === 'placed'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-500 font-bold'
                              }`}>
                                {app.status === 'placed' ? <Check size={13} /> : <span>4</span>}
                              </div>
                            </div>
                            <div className="text-xs pb-1 flex-1">
                              <span className="font-bold text-slate-900 block text-sm">Placement Confirmed & Digital letter</span>
                              
                              {app.status === 'placed' && app.placementDetails ? (
                                <div className="mt-3.5 bg-gradient-to-br from-amber-50 to-emerald-50 border border-emerald-150 p-5 rounded-2xl space-y-4">
                                  <div className="flex items-center space-x-1.5 font-black text-emerald-800 uppercase tracking-widest text-[10px]">
                                    <Award size={14} className="text-amber-500" />
                                    <span>Official Civil Placement Clearance</span>
                                  </div>

                                  <div className="space-y-2 text-slate-700">
                                    <p className="text-xs leading-relaxed font-semibold">
                                      {app.placementDetails.congratulationsMessage}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-emerald-100 font-semibold">
                                      <div>Deployment Date: <span className="text-slate-800 block font-bold font-mono">{app.placementDetails.startDate}</span></div>
                                      <div>Liaison Officer: <span className="text-slate-800 block font-bold">{app.placementDetails.reportingTo}</span></div>
                                      <div className="col-span-2 mt-1">Deployment Location: <span className="text-slate-805 block font-bold">{app.placementDetails.officeLocation}</span></div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-emerald-100 flex justify-end">
                                    <button
                                      id={`print-placement-letter-btn`}
                                      onClick={() => setPrintingPlacement(app)}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                                    >
                                      <Printer size={13} />
                                      <span>Print Placement letter</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-450 mt-0.5 leading-relaxed">
                                  Requires document verification, interviews completion, and final Bureau sign-off parameters.
                                </p>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Supplementary Documents Action Required Banner */}
                      {app.status === 'action_required' && (
                        <div className="p-4 bg-amber-50 border border-amber-150 rounded-xl space-y-3 text-xs">
                          <h5 className="font-bold text-amber-900 flex items-center">
                            <ShieldAlert size={15} className="mr-1.5 shrink-0 text-amber-500" />
                            Missing Supplementary Files Identified
                          </h5>
                          <p className="text-slate-650 leading-relaxed">
                            The Department recruitment team has reviews your folder and indicated that certain documents are missing or require update scans. Please check missing markers below to satisfy registration requirements:
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {!app.documents.idCopy && (
                              <button
                                id={`supplemental-upload-id`}
                                onClick={() => handleUploadMissingDoc(app.id, 'idCopy')}
                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg border border-amber-200"
                              >
                                Upload ID Document Card
                              </button>
                            )}
                            {!app.documents.cv && (
                              <button
                                id={`supplemental-upload-cv`}
                                onClick={() => handleUploadMissingDoc(app.id, 'cv')}
                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-905 font-bold rounded-lg border border-amber-200"
                              >
                                Upload CV Work History
                              </button>
                            )}
                            {!app.documents.qualifications && (
                              <button
                                id={`supplemental-upload-qualifications`}
                                onClick={() => handleUploadMissingDoc(app.id, 'qualifications')}
                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-905 font-bold rounded-lg border border-amber-200"
                              >
                                Upload Academic Diploma Scan
                              </button>
                            )}
                            {!app.documents.proofOfAddress && (
                              <button
                                id={`supplemental-upload-address`}
                                onClick={() => handleUploadMissingDoc(app.id, 'proofOfAddress')}
                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-905 font-bold rounded-lg border border-amber-200"
                              >
                                Upload Residential Proof
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })() : (
                  <div className="bg-white rounded-2xl border border-slate-150 p-12 text-center text-slate-400">
                    <Clock size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-700">Detailed Pipeline Tracker</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Select any vacancy query from your submissions list on the left to track real-time evaluations, interviews scheduling, and download official placement credentials.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: MY DOCUMENTS VAULT ==================== */}
        {activeTab === 'documents' && (
          <div className="space-y-6" id="citizen-documents-tab">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-1.5">
              <h3 className="text-base font-bold text-slate-905">My Verified Documents Vault</h3>
              <p className="text-xs text-slate-400">Manage uploaded scans to pre-qualify automatically across published civil opportunities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg">
                      <FileText size={18} />
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      ID Active
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-4">Verified National ID Copy</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Identity credentials copy pre-registered during portal signup. Essential to avoid duplicate logins.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-400">
                  Last Updated: <span className="font-mono">Current Session</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg">
                      <FileText size={18} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      citizen.skills && citizen.skills.length > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {citizen.skills && citizen.skills.length > 0 ? 'CV ACTIVE' : 'MISSING CV'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-4 font-sans">Curriculum Vitae (CV) Profile</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-sans">
                    Detailed breakdown of your competencies, trade experience, and previous project assignments.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Status: {citizen.skills && citizen.skills.length > 0 ? 'Ready' : 'Not Loaded'}</span>
                  {!(citizen.skills && citizen.skills.length > 0) && (
                    <button
                      id="vault-simulate-cv"
                      onClick={() => {
                        const updated = allCitizens.map(cit => {
                          if (cit.idNumber === citizen.idNumber) {
                            return { ...cit, skills: ['Communication', 'Microsoft Excel', 'General Services'] };
                          }
                          return cit;
                        });
                        setAllCitizens(updated);
                        localStorage.setItem('cp_citizens', JSON.stringify(updated));
                        citizen.skills = ['Communication', 'Microsoft Excel', 'General Services'];
                        alert('Your CV mock is updated with core skills and synced to local storage!');
                      }}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded hover:bg-blue-100"
                    >
                      Process Standard CV
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 4: NOTIFICATIONS HUB ==================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-6" id="citizen-notifications-tab">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-150">
              <div>
                <h3 className="text-base font-bold text-slate-900">Communication Desk</h3>
                <p className="text-xs text-slate-400 mt-1">Alerts relating to direct selection panels, documents required, and employment letters.</p>
              </div>
              {myNotifications.length > 0 && (
                <button
                  id="cit-clear-all-notif"
                  onClick={handleClearAllNotifications}
                  className="text-xs font-semibold hover:bg-red-50 text-red-650 hover:border-red-200 border border-transparent px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Clear Inbox
                </button>
              )}
            </div>

            <div className="space-y-3.5" id="notifications-container">
              {myNotifications.length === 0 ? (
                <div className="bg-white border border-slate-150 p-12 text-center rounded-2xl text-slate-450 text-xs">
                  <Bell className="mx-auto mb-2 opacity-30 text-slate-400" size={32} />
                  You have an empty communication tray. Notification notices appear automatically on status adjustments.
                </div>
              ) : (
                myNotifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`bg-white p-4.5 rounded-xl border flex justify-between items-start transition-all ${
                      n.isRead 
                        ? 'border-slate-150 bg-slate-50/40 opacity-70' 
                        : n.type === 'alert'
                          ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                          : 'border-indigo-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        {!n.isRead && (
                          <span className={`h-2 w-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-rose-600' : 'bg-indigo-600'}`} />
                        )}
                        {n.type === 'alert' && (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-200">
                            <Clock size={10} className="text-rose-600" />
                            Urgent closing
                          </span>
                        )}
                        <h4 className={`text-sm font-bold ${n.type === 'alert' ? 'text-rose-950' : 'text-slate-900'}`}>{n.title}</h4>
                        <span className="text-[10px] text-slate-450 font-mono font-bold">{n.date}</span>
                      </div>
                      <p className={`text-xs pl-4 ${n.type === 'alert' ? 'text-rose-900 font-medium' : 'text-slate-520'}`}>{n.message}</p>
                    </div>

                    {!n.isRead && (
                      <button
                        id={`mark-read-btn-${n.id}`}
                        onClick={() => {
                          handleMarkNotificationRead(n.id);
                          if (n.type === 'alert') {
                            setActiveTab('vacancies');
                          }
                        }}
                        className={`text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer transition-all shrink-0 ${
                          n.type === 'alert'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                            : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-bold'
                        }`}
                      >
                        {n.type === 'alert' ? 'Apply Now' : 'Acknowledge'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* printable placement letter simulation dialog */}
      <AnimatePresence>
        {printingPlacement && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full text-slate-900 border border-slate-350"
              id="printable-letter-simulation"
            >
              {/* letter header */}
              <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1">
                <h2 className="text-lg font-black tracking-widest uppercase text-slate-800">
                  Republic Information &amp; Clearinghouse
                </h2>
                <p className="text-[10px] text-slate-550 tracking-wider">
                  DEPARTMENT OF PUBLIC SERVICE &amp; ADMINISTRATION &bull; HUMAN RESOURCES PORTAL
                </p>
                <div className="pt-2 flex justify-center space-x-1.5 text-xs font-mono text-slate-500">
                  <span>REF: {printingPlacement.id.toUpperCase()}</span>
                  <span>&bull;</span>
                  <span>DATE: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* letter body */}
              <div className="py-8 space-y-4 text-xs leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900">
                  To: {printingPlacement.citizenName} (ID: {printingPlacement.citizenIdNumber})
                </p>
                
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide pt-2">
                  OFFICIAL LETTER OF PLACEMENT CLEARANCE
                </h3>

                <p>
                  We are extremely pleased to deliver this official notification that your clearance profile has been authorized for public placement under current sector parameters. You are assigned to the following position:
                </p>

                <div className="bg-slate-50 p-4 border rounded-lg space-y-1 font-mono text-[11px] text-slate-800 leading-normal">
                  <p><strong>Opportunity vacancy:</strong> {allJobs.find(j => j.id === printingPlacement.jobId)?.title}</p>
                  <p><strong>Assigned Department:</strong> {allJobs.find(j => j.id === printingPlacement.jobId)?.department}</p>
                  <p><strong>Deployment Location:</strong> {printingPlacement.placementDetails?.officeLocation}</p>
                  <p><strong>Effective Deployment Date:</strong> {printingPlacement.placementDetails?.startDate}</p>
                  <p><strong>Reporting Liaison Officer:</strong> {printingPlacement.placementDetails?.reportingTo}</p>
                </div>

                <p className="italic bg-amber-50 p-3 rounded-lg text-amber-900 font-semibold leading-normal">
                  Important Notes: {printingPlacement.placementDetails?.congratulationsMessage}
                </p>

                <p>
                  Please submit physical ID credentials and original qualification folders upon arrival on {printingPlacement.placementDetails?.startDate} at {printingPlacement.placementDetails?.officeLocation} to finalize the standard service payroll registries.
                </p>
              </div>

              {/* letter footer */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <div>
                  <p className="font-bold text-slate-800">Clearinghouse Registrar</p>
                  <p>National Employment Bureau Division</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg mr-2"
                >
                  Send to Physical Office Printer
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingPlacement(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-750 font-semibold rounded-lg"
                >
                  Close Letter
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
