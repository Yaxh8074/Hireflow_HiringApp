
import type { Job, Candidate, BillingItem, Company } from '../types';
import { ServiceType, CandidateStatus, BackgroundCheckStatus, JobStatus } from '../types';
import { PRICING } from '../constants';

// --- MOCK DATABASE ---
let MOCK_COMPANY: Company = { id: 'comp1', name: 'Innovate Inc.' };

let MOCK_CANDIDATES: Record<string, Candidate> = {
  'c1': { id: 'c1', name: 'Alice Johnson', title: 'Senior Frontend Developer', summary: '8 years of experience with React, TypeScript, and Next.js. Passionate about building scalable and accessible UIs.', status: CandidateStatus.INTERVIEW, backgroundCheck: BackgroundCheckStatus.COMPLETED },
  'c2': { id: 'c2', name: 'Bob Williams', title: 'Frontend Developer', summary: '3 years of experience in Vue and Tailwind CSS. Strong eye for design and user experience.', status: CandidateStatus.APPLIED, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
  'c3': { id: 'c3', name: 'Charlie Brown', title: 'Full Stack Engineer', summary: '5 years experience with Node.js, Python, and React. Built and maintained several high-traffic applications.', status: CandidateStatus.OFFER, backgroundCheck: BackgroundCheckStatus.COMPLETED },
  'c4': { id: 'c4', name: 'Diana Prince', title: 'UI/UX Designer', summary: 'Specializes in user-centered design principles and has a portfolio of visually stunning mobile and web apps.', status: CandidateStatus.HIRED, backgroundCheck: BackgroundCheckStatus.COMPLETED },
  'c5': { id: 'c5', name: 'Ethan Hunt', title: 'DevOps Engineer', summary: 'Expert in AWS, Docker, and Kubernetes. Focuses on CI/CD pipelines and infrastructure automation.', status: CandidateStatus.SCREENING, backgroundCheck: BackgroundCheckStatus.PENDING },
  'c6': { id: 'c6', name: 'Fiona Glenanne', title: 'Product Manager', summary: 'Drives product strategy from concept to launch. Skilled in agile methodologies and market analysis.', status: CandidateStatus.APPLIED, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
  'c7': { id: 'c7', name: 'George Costanza', title: 'Data Scientist', summary: 'Ph.D. in Statistics. Proficient in Python, R, and machine learning frameworks for predictive modeling.', status: CandidateStatus.INTERVIEW, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
};

let MOCK_JOBS: Job[] = [
  {
    id: 'job1',
    title: 'Senior React Developer',
    location: 'Remote',
    salary: '$120,000 - $150,000',
    description: 'We are looking for an experienced React Developer to join our team. You will be responsible for building and maintaining our core web application, working with a modern tech stack including TypeScript, GraphQL, and Next.js.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    candidateIds: ['c1', 'c2', 'c3'],
    status: JobStatus.ACTIVE,
  },
  {
    id: 'job2',
    title: 'Cloud Infrastructure Engineer',
    location: 'New York, NY',
    salary: '$140,000 - $170,000',
    description: 'Seeking a Cloud Infrastructure Engineer with deep knowledge of AWS services. The ideal candidate will help us scale our infrastructure, improve reliability, and automate our deployment processes.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    candidateIds: ['c5'],
    status: JobStatus.ACTIVE,
  },
  {
    id: 'job3',
    title: 'Lead Product Designer',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$160,000 - $190,000',
    description: 'We are seeking a Lead Product Designer to own the user experience for our flagship product. You will lead a team of designers and work closely with product and engineering to create intuitive and beautiful interfaces.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    candidateIds: ['c4'],
    status: JobStatus.CLOSED,
  },
   {
    id: 'job4',
    title: 'Data Scientist, Machine Learning',
    location: 'Austin, TX',
    salary: '$130,000 - $160,000',
    description: 'Join our data science team to build machine learning models that solve real-world problems. Experience with NLP and computer vision is a plus.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    candidateIds: [],
    status: JobStatus.DRAFT,
  }
];

let MOCK_BILLING_ITEMS: BillingItem[] = [
    { id: 'b1', service: ServiceType.JOB_POST, amount: PRICING[ServiceType.JOB_POST], date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), description: "Job Post: Cloud Infrastructure Engineer"},
    { id: 'b2', service: ServiceType.JOB_POST, amount: PRICING[ServiceType.JOB_POST], date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), description: "Job Post: Senior React Developer"},
    { id: 'b3', service: ServiceType.SUCCESSFUL_HIRE, amount: PRICING[ServiceType.SUCCESSFUL_HIRE], date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), description: "Successful Hire: Diana Prince for Lead Product Designer"},
    { id: 'b4', service: ServiceType.BACKGROUND_CHECK, amount: PRICING[ServiceType.BACKGROUND_CHECK], date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), description: "Background Check for Alice Johnson"},

];

const simulateDelay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));


// --- API FUNCTIONS ---

export const fetchJobs = (): Promise<Job[]> => {
  return simulateDelay(MOCK_JOBS.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const fetchJobById = (id: string): Promise<Job | undefined> => {
  return simulateDelay(MOCK_JOBS.find(j => j.id === id));
};

export const fetchAllCandidates = (): Promise<Record<string, Candidate>> => {
    return simulateDelay(MOCK_CANDIDATES);
};

export const fetchCandidatesByIds = (ids: string[]): Promise<Record<string, Candidate>> => {
    const results: Record<string, Candidate> = {};
    ids.forEach(id => {
        if(MOCK_CANDIDATES[id]) {
            results[id] = MOCK_CANDIDATES[id];
        }
    });
    return simulateDelay(results);
}

export const addBillingItem = (service: ServiceType, description: string): Promise<BillingItem> => {
    const newBillingItem: BillingItem = {
        id: `b${MOCK_BILLING_ITEMS.length + 1}`,
        service,
        amount: PRICING[service],
        date: new Date().toISOString(),
        description,
    };
    MOCK_BILLING_ITEMS.unshift(newBillingItem);
    return simulateDelay(newBillingItem);
}

export const createJob = async (jobData: Omit<Job, 'id' | 'createdAt'|'candidateIds'> & { status: JobStatus }): Promise<Job> => {
    const newJob: Job = {
        ...jobData,
        id: `job${MOCK_JOBS.length + 1}`,
        createdAt: new Date().toISOString(),
        candidateIds: [],
    };
    MOCK_JOBS.push(newJob);
    if (newJob.status === JobStatus.ACTIVE) {
        await addBillingItem(ServiceType.JOB_POST, `Job Post: ${newJob.title}`);
    }
    return simulateDelay(newJob);
}

export const updateJob = async (id: string, updates: Partial<Job>): Promise<Job> => {
    const jobIndex = MOCK_JOBS.findIndex(j => j.id === id);
    if (jobIndex === -1) {
        return Promise.reject(new Error('Job not found'));
    }
    const originalJob = MOCK_JOBS[jobIndex];
    const updatedJob = { ...originalJob, ...updates };
    MOCK_JOBS[jobIndex] = updatedJob;

    if (originalJob.status === JobStatus.DRAFT && updatedJob.status === JobStatus.ACTIVE) {
        await addBillingItem(ServiceType.JOB_POST, `Job Post: ${updatedJob.title}`);
    }
    return simulateDelay(updatedJob);
};

export const updateCandidate = (id: string, updates: Partial<Candidate>): Promise<Candidate> => {
    const candidate = MOCK_CANDIDATES[id];
    if (!candidate) {
        return Promise.reject(new Error('Candidate not found'));
    }
    const updatedCandidate = { ...candidate, ...updates };
    MOCK_CANDIDATES[id] = updatedCandidate;
    return simulateDelay(updatedCandidate);
}

export const fetchBillingItems = (): Promise<BillingItem[]> => {
    return simulateDelay(MOCK_BILLING_ITEMS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}
