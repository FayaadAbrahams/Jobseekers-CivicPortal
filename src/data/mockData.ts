import { Job, Citizen, Application, Interview, SystemNotification } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Youth Environmental Officer',
    department: 'Department of Forestry, Fisheries and the Environment',
    location: 'Cape Town, WC',
    salaryRange: 'R12,000 - R15,000 / Month',
    type: 'Contract',
    description: 'Help coordinate neighborhood greening projects, oversee recycling educational campaigns, and monitor environmental compliance across urban nature trails. Excellent entry-level role for individuals passionate about ecosystems and ecological health.',
    requirements: [
      'Basic knowledge of local flora and environmental practices',
      'Excellent verbal confidence for workshop guidance',
      'Willingness to participate in active outdoor monitoring field trips'
    ],
    category: 'Community Service',
    postedDate: '2026-06-01',
    deadline: '2026-07-28',
    targetAudience: 'Youth Priority (Ages 18-35)'
  },
  {
    id: 'job-2',
    title: 'Assistant Information Registrar',
    department: 'Ministry of Home Affairs & National Security',
    location: 'Pretoria, GP',
    salaryRange: 'R16,500 - R20,000 / Month',
    type: 'Full-time',
    description: 'Responsible for inputting population data records, classifying incoming requests, correcting demographic spelling, and addressing identity document application backlog queues. Requires incredible attention to detail.',
    requirements: [
      'Accurate typing speeds (minimum 40 WPM)',
      'Basic literacy with spreadsheets and database entries',
      'Strong empathy and high confidentiality standards'
    ],
    category: 'Administration',
    postedDate: '2026-06-10',
    deadline: '2026-07-15',
    targetAudience: 'Open to All Citizens'
  },
  {
    id: 'job-3',
    title: 'Network & Systems Technician Apprentice',
    department: 'State Information Technology Agency (SITA)',
    location: 'Durban, KZN',
    salaryRange: 'R18,005 - R22,000 / Month',
    type: 'Internship',
    description: 'Understudy infrastructure consultants to set up state offices with stable optical networking, configure firewall parameters, and respond to critical local server failures or routing errors.',
    requirements: [
      'Undergoing or completed a Certificate/Diploma in IT or Computer Science',
      'Familiarity with TCP/IP addresses and standard network cabling',
      'Eagerness to resolve problems dynamically under supervision'
    ],
    category: 'Technical',
    postedDate: '2026-06-12',
    deadline: '2026-07-10',
    targetAudience: 'Technical Graduates'
  },
  {
    id: 'job-4',
    title: 'Public Health Care Assistant',
    department: 'Regional Clinic Initiative',
    location: 'Soweto, GP',
    salaryRange: 'R14,000 - R17,500 / Month',
    type: 'Full-time',
    description: 'Assist nursing staff structure public clinic lines, hand out community pamphlets on immunizations, pre-check body temperatures and weight records of arriving citizens, and compile client folders.',
    requirements: [
      'First-aid qualification is massive advantage',
      'Warm conversational bedside manner inside busy surroundings',
      'Fluency in English and at least one local vernacular'
    ],
    category: 'Health',
    postedDate: '2026-06-05',
    deadline: '2026-07-20',
    targetAudience: 'Community Support Personnel'
  },
  {
    id: 'job-5',
    title: 'Vocational Training Facilitator',
    department: 'Department of Higher Education & Training',
    location: 'Port Elizabeth, EC',
    salaryRange: 'R22,000 - R28,000 / Month',
    type: 'Contract',
    description: 'Oversee heavy machinery maintenance training, supervise apprentices, host welding safety compliance review meetings, and provide technical guidance in metal fabrications.',
    requirements: [
      'Trade Certificate in Welding, Boiler-making, or Electrical Maintenance',
      'At least 3 years active site workshop experience',
      'Clear lecturing and pedagogical patience'
    ],
    category: 'Skilled Labor',
    postedDate: '2026-06-14',
    deadline: '2026-08-05',
    targetAudience: 'Experienced Artisans'
  },
  {
    id: 'job-6',
    title: 'Remedial Literacy Tutor',
    department: 'National Basic Literacy Drive',
    location: 'Polokwane, LP',
    salaryRange: 'R15,000 - R18,000 / Month',
    type: 'Part-time',
    description: 'Conduct afternoon focus reading classes for children lagging in early school years, administer standardized phonetic exams, and compile progress report trackers for parents.',
    requirements: [
      'High school math/english grades average of 70%+',
      'Superb child engagement, safety checks awareness',
      'organized lesson structure preparation'
    ],
    category: 'Education',
    postedDate: '2026-06-15',
    deadline: '2026-07-25',
    targetAudience: 'Youth & Senior Mentors'
  }
];

export const INITIAL_CITIZENS: Citizen[] = [
  {
    fullName: 'Thabo Khumalo',
    idNumber: '9504125193084',
    registeredDate: '2026-06-01',
    email: 'thabo.khumalo@sa-gov.za',
    phone: '+27 72 849 2038',
    skills: ['First Aid', 'Environmental Science Basics', 'Public Speaking'],
    education: 'Diploma in Environmental Studies',
    gender: 'Male',
    password: 'password123',
    recoveryAnswers: {
      q1: 'Khumalo',
      q2: 'Soweto',
      q3: 'Main Street Primary'
    }
  },
  {
    fullName: 'Priya Naidoo',
    idNumber: '9211040319082',
    registeredDate: '2026-06-05',
    email: 'priya.naidoo@domain.com',
    phone: '+27 83 912 3045',
    skills: ['Data Entry', 'Microsoft Excel', 'Customer Service'],
    education: 'Higher Certificate in Office Administration',
    gender: 'Female',
    password: 'password123',
    recoveryAnswers: {
      q1: 'Naidoo',
      q2: 'Durban',
      q3: 'Ocean View High'
    }
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    citizenIdNumber: '9504125193084',
    citizenName: 'Thabo Khumalo',
    appliedDate: '2026-06-02',
    status: 'placed',
    documents: {
      idCopy: true,
      cv: true,
      qualifications: true,
      proofOfAddress: true
    },
    interviewerNotes: 'Candidate demonstrated outstanding awareness of urban forestry. Documents have been fully verified and signed off.',
    placementDetails: {
      startDate: '2026-07-01',
      reportingTo: 'Dr. Evelyn Peters (Chief Conservator)',
      officeLocation: 'Cape Forestry Bureau, Block F, Room 104',
      congratulationsMessage: 'Welcome aboard Thabo! Your placement has been officially confirmed by the Department of Forestry. Please report at 08:00 AM on July 1st, 2026 with your physical ID card to sign the official enrollment register.'
    }
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    citizenIdNumber: '9211040319082',
    citizenName: 'Priya Naidoo',
    appliedDate: '2026-06-06',
    status: 'interview_scheduled',
    documents: {
      idCopy: true,
      cv: true,
      qualifications: false
    }
  }
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'int-1',
    applicationId: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Assistant Information Registrar',
    citizenIdNumber: '9211040319082',
    citizenName: 'Priya Naidoo',
    dateTime: '2026-06-25T10:00',
    location: 'Main Home Affairs Bureau, Boardroom B (Pretoria Main Office)',
    status: 'pending',
    contactPerson: 'Mr. Sipho Sithole (HR Recruiter)'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    citizenIdNumber: '9504125193084',
    title: 'Placement Confirmed!',
    message: 'Congratulations Thabo, your official placement for Youth Environmental Officer has been confirmed starting 2026-07-01.',
    date: '2026-06-15 09:12',
    isRead: false,
    type: 'success'
  },
  {
    id: 'notif-2',
    citizenIdNumber: '9211040319082',
    title: 'Interview Scheduled',
    message: 'Your interview for Assistant Information Registrar has been scheduled on 2026-06-25 at 10:00 AM.',
    date: '2026-06-12 14:30',
    isRead: false,
    type: 'info'
  },
  {
    id: 'notif-3',
    citizenIdNumber: '9211040319082',
    title: 'Document Pending Upload',
    message: 'Please submit your proof of academic qualifications to complete your application checks.',
    date: '2026-06-14 11:15',
    isRead: false,
    type: 'warning'
  }
];

// Helper to initialize local storage
export const initializeStorage = () => {
  if (!localStorage.getItem('cp_jobs')) {
    localStorage.setItem('cp_jobs', JSON.stringify(INITIAL_JOBS));
  }
  if (!localStorage.getItem('cp_citizens')) {
    localStorage.setItem('cp_citizens', JSON.stringify(INITIAL_CITIZENS));
  }
  if (!localStorage.getItem('cp_applications')) {
    localStorage.setItem('cp_applications', JSON.stringify(INITIAL_APPLICATIONS));
  }
  if (!localStorage.getItem('cp_interviews')) {
    localStorage.setItem('cp_interviews', JSON.stringify(INITIAL_INTERVIEWS));
  }
  if (!localStorage.getItem('cp_notifications')) {
    localStorage.setItem('cp_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
};
