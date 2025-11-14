
export type View = 'dashboard' | 'jobs' | 'job-detail' | 'new-job' | 'billing' | 'marketplace' | 'candidates' | 'company-profile' | 'hr-connect' | 'team';
export type CandidateView = 'job-search' | 'my-applications' | 'job-detail' | 'profile' | 'interview-prep';


export enum ServiceType {
  JOB_POST = 'Job Posting',
  BACKGROUND_CHECK = 'Background Check',
  SUCCESSFUL_HIRE = 'Successful Hire Fee',
  AI_SCREENING = 'AI Candidate Screening',
  SKILL_ASSESSMENT = 'Skill Assessment',
  VIDEO_INTERVIEW = 'Video Interview Service',
  HR_CONSULTATION = 'HR Consultation',
  RECRUITMENT_ASSISTANCE = 'Recruitment Assistance',
  INTERVIEW_SCHEDULING = 'Interview Scheduling',
  AI_SOURCING = 'AI Sourcing Agent',
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

export interface SourcedCandidate {
    candidateId: string;
    justification: string;
    status: 'pending' | 'invited';
}

export interface Job {
  id:string;
  title: string;
  location: string;
  salary: string;
  description: string;
  createdAt: string;
  status: JobStatus;
  sourcedCandidates?: SourcedCandidate[];
}

export interface InterviewSchedule {
    status: 'pending' | 'booked' | 'completed';
    proposedSlots: string[];
    confirmedSlot?: string;
}

export interface SkillAssessmentQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface SkillAssessment {
    status: 'pending' | 'completed';
    questions: SkillAssessmentQuestion[];
    answers?: number[]; // indices of selected answers
    score?: number; // e.g. 0.8 for 80%
}

export interface Note {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    timestamp: string;
}


export interface Application {
    id: string;
    jobId: string;
    candidateId: string;
    status: CandidateStatus;
    appliedDate: string;
    notes?: Note[];
    resumeText?: string;
    resumeFileName?: string;
    resumeFileData?: string;
    lastReminderSent?: string;
    resumeViews?: number;
    interviewSchedule?: InterviewSchedule;
    skillAssessment?: SkillAssessment;
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
  teamId?: string;
  teamRole?: 'Admin' | 'Member';
}

export interface Team {
    id: string;
    name: string;
    adminId: string;
    memberIds: string[];
}


export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}