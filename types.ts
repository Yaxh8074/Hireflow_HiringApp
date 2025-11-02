
export type View = 'dashboard' | 'jobs' | 'job-detail' | 'new-job' | 'billing' | 'marketplace' | 'candidates' | 'company-profile';
export type CandidateView = 'job-search' | 'my-applications' | 'job-detail' | 'profile';


export enum ServiceType {
  JOB_POST = 'Job Posting',
  BACKGROUND_CHECK = 'Background Check',
  SUCCESSFUL_HIRE = 'Successful Hire Fee',
  AI_SCREENING = 'AI Candidate Screening',
  SKILL_ASSESSMENT = 'Skill Assessment',
  VIDEO_INTERVIEW = 'Video Interview Service',
}

export interface BillingItem {
  id: string;
  service: ServiceType;
  amount: number;
  date: string;
  description: string;
}

export enum CandidateStatus {
    APPLIED = 'Applied',
    SCREENING = 'Screening',
    INTERVIEW = 'Interviewing',
    OFFER = 'Offer',
    HIRED = 'Hired',
    WITHDRAWN = 'Withdrawn',
}

export enum BackgroundCheckStatus {
    NOT_STARTED = 'Not Started',
    PENDING = 'Pending',
    COMPLETED = 'Completed',
    FLAGGED = 'Flagged'
}
export interface Candidate {
  id: string;
  name: string;
  email: string;
  title: string;
  summary: string;
  phone: string;
  location: string;
  resumeText: string;
  resumeFileName?: string | null;
  resumeFileData?: string | null;
  backgroundCheck: BackgroundCheckStatus;
  aiScreeningResult?: string;
}

export enum JobStatus {
    DRAFT = 'Draft',
    ACTIVE = 'Active',
    CLOSED = 'Closed'
}

export interface Job {
  id:string;
  title: string;
  location: string;
  salary: string;
  description: string;
  createdAt: string;
  status: JobStatus;
}

export interface Application {
    id: string;
    jobId: string;
    candidateId: string;
    status: CandidateStatus;
    appliedDate: string;
    notes?: string;
    resumeText?: string;
    resumeFileName?: string;
    resumeFileData?: string;
}


export interface Company {
    id: string;
    name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'hiring-manager' | 'candidate';
}