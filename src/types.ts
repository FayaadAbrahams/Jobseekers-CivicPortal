export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryRange: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  description: string;
  requirements: string[];
  category: 'Administration' | 'Technical' | 'Skilled Labor' | 'Community Service' | 'Health' | 'Education';
  postedDate: string;
  deadline: string;
  targetAudience: string; // e.g., "Open to All", "Youth Priority", "Experienced Professionals"
}

export interface Citizen {
  fullName: string;
  idNumber: string;
  registeredDate: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: string;
  gender?: string;
  password?: string;
  occupation?: string;
  address?: string;
  proofOfAddressUploaded?: boolean;
  recoveryAnswers?: {
    q1: string; // Mother's maiden name
    q2: string; // Birthplace
    q3: string; // First school
  };
}

export interface Application {
  id: string;
  jobId: string;
  citizenIdNumber: string;
  citizenName: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'action_required' | 'placed' | 'rejected';
  documents: {
    idCopy: boolean;
    cv: boolean;
    qualifications: boolean;
    proofOfAddress?: boolean;
  };
  interviewerNotes?: string;
  placementDetails?: {
    startDate: string;
    reportingTo: string;
    officeLocation: string;
    congratulationsMessage: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  citizenIdNumber: string;
  citizenName: string;
  dateTime: string;
  location: string; // e.g., "Virtual (Video Link)", "Main Bureau, Room 302"
  status: 'pending' | 'completed' | 'cancelled';
  contactPerson: string;
}

export interface SystemNotification {
  id: string;
  citizenIdNumber: string; // "admin" for administrator general messages or ID number
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}
