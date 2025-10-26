
export type View = 'dashboard' | 'jobs' | 'job-detail' | 'new-job' | 'billing' | 'marketplace' | 'candidates' | 'company-profile';

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
    HIRED = 'Hired'
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
  title: string;
  summary: string;
  status: CandidateStatus;
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
  candidateIds: string[];
  status: JobStatus;
}

export interface Company {
    id: string;
    name: string;
}
