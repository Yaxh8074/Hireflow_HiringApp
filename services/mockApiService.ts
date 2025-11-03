
import type { Job, Candidate, BillingItem, Company, Application } from '../types.ts';
import { ServiceType, CandidateStatus, BackgroundCheckStatus, JobStatus } from '../types.ts';
import { PRICING } from '../constants.ts';

// --- DISCOUNT LOGIC ---
const DISCOUNT_START_DATE_KEY = 'payg_discount_start_date';
const DISCOUNT_DURATION_DAYS = 30;

const checkAndSetDiscountStartDate = () => {
    if (!localStorage.getItem(DISCOUNT_START_DATE_KEY)) {
        localStorage.setItem(DISCOUNT_START_DATE_KEY, new Date().toISOString());
    }
};

export const getDiscountEndDate = (): Date | null => {
    const startDateStr = localStorage.getItem(DISCOUNT_START_DATE_KEY);
    if (!startDateStr) return null;
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + DISCOUNT_DURATION_DAYS);
    return endDate;
}

export const isDiscountActive = (): boolean => {
    const endDate = getDiscountEndDate();
    if (!endDate) return false;
    return new Date() < endDate;
};

// --- ROBUST ID GENERATION ---
const generateId = (() => {
    let counter = 100; // Start high to avoid collision with existing mock data
    return (prefix: 'job' | 'app' | 'b' | 'c') => {
        counter++;
        return `${prefix}${counter}`;
    };
})();


// --- MOCK DATABASE ---
let MOCK_COMPANY: Company = { id: 'comp1', name: 'Innovate Inc.' };

let MOCK_CANDIDATES: Record<string, Candidate> = {
  'c1': { id: 'c1', name: 'Alice Johnson', email: 'alice@example.com', title: 'Senior Frontend Developer', summary: '8 years of experience with React, TypeScript, and Next.js. Passionate about building scalable and accessible UIs.', phone: '555-0101', location: 'San Francisco, CA', resumeText: 'Detailed resume for Alice Johnson...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.COMPLETED },
  'c2': { id: 'c2', name: 'Bob Williams', email: 'bob@example.com', title: 'Frontend Developer', summary: '3 years of experience in Vue and Tailwind CSS. Strong eye for design and user experience.', phone: '555-0102', location: 'Austin, TX', resumeText: 'Detailed resume for Bob Williams...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
  'c3': { id: 'c3', name: 'Charlie Brown', email: 'charlie@example.com', title: 'Full Stack Engineer', summary: '5 years experience with Node.js, Python, and React. Built and maintained several high-traffic applications.', phone: '555-0103', location: 'New York, NY', resumeText: 'Detailed resume for Charlie Brown...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.COMPLETED },
  'c4': { id: 'c4', name: 'Diana Prince', email: 'diana@example.com', title: 'UI/UX Designer', summary: 'Specializes in user-centered design principles and has a portfolio of visually stunning mobile and web apps.', phone: '555-0104', location: 'Remote', resumeText: 'Detailed resume for Diana Prince...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.COMPLETED },
  'c5': { id: 'c5', name: 'Ethan Hunt', email: 'ethan@example.com', title: 'DevOps Engineer', summary: 'Expert in AWS, Docker, and Kubernetes. Focuses on CI/CD pipelines and infrastructure automation.', phone: '555-0105', location: 'Seattle, WA', resumeText: 'Detailed resume for Ethan Hunt...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.PENDING },
  'c6': { id: 'c6', name: 'Fiona Glenanne', email: 'fiona@example.com', title: 'Product Manager', summary: 'Drives product strategy from concept to launch. Skilled in agile methodologies and market analysis.', phone: '555-0106', location: 'Chicago, IL', resumeText: 'Detailed resume for Fiona Glenanne...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
  'c7': { id: 'c7', name: 'George Costanza', email: 'george@example.com', title: 'Data Scientist', summary: 'Ph.D. in Statistics. Proficient in Python, R, and machine learning frameworks for predictive modeling.', phone: '555-0107', location: 'Boston, MA', resumeText: 'Detailed resume for George Costanza...', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
  'c8': { id: 'c8', name: 'Hannah Montana', email: 'candidate@example.com', title: 'Aspiring Pop Star', summary: 'Skilled vocalist looking for a breakout role.', phone: '555-0108', location: 'Los Angeles, CA', resumeText: 'A detailed resume about my singing career.', resumeFileName: null, resumeFileData: null, backgroundCheck: BackgroundCheckStatus.NOT_STARTED },
};

let MOCK_JOBS: Job[] = [
  {
    id: 'job1',
    title: 'Senior React Developer',
    location: 'Remote',
    salary: '$120,000 - $150,000',
    description: 'We are looking for an experienced React Developer to join our team. You will be responsible for building and maintaining our core web application, working with a modern tech stack including TypeScript, GraphQL, and Next.js.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: JobStatus.ACTIVE,
  },
  {
    id: 'job2',
    title: 'Cloud Infrastructure Engineer',
    location: 'New York, NY',
    salary: '$140,000 - $170,000',
    description: 'Seeking a Cloud Infrastructure Engineer with deep knowledge of AWS services. The ideal candidate will help us scale our infrastructure, improve reliability, and automate our deployment processes.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: JobStatus.ACTIVE,
  },
    {
    id: 'job5',
    title: 'Marketing Manager, Digital Campaigns',
    location: 'Remote',
    salary: '$90,000 - $110,000',
    description: `
About the Role
We're looking for a data-driven Marketing Manager to lead our digital campaign strategy. You'll be responsible for planning, executing, and optimizing campaigns across various channels to drive brand awareness and generate leads.

Key Responsibilities
- Develop and manage end-to-end digital marketing campaigns, including SEO/SEM, email, social media, and display advertising.
- Measure and report on the performance of all digital marketing campaigns and assess against goals (ROI and KPIs).
- Collaborate with internal teams to create landing pages and optimize the user experience.
- Utilize strong analytical ability to evaluate end-to-end customer experience across multiple channels and customer touchpoints.

Qualifications
- 5+ years of experience in digital marketing.
- Demonstrable experience leading and managing SEO/SEM, marketing database, email, social media, and/or display advertising campaigns.
- Solid knowledge of website analytics tools (e.g., Google Analytics, NetInsight, WebTrends).
- Experience in setting up and optimizing Google AdWords campaigns.
    `,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: JobStatus.ACTIVE,
  },
  {
    id: 'job6',
    title: 'Backend Engineer (Node.js)',
    location: 'Austin, TX (Hybrid)',
    salary: '$110,000 - $140,000',
    description: `
About the Role
Our team is seeking a skilled Backend Engineer with expertise in Node.js to help build and scale the core services that power our platform. You'll work on designing robust APIs, managing database interactions, and ensuring our backend services are fast, reliable, and secure.

Key Responsibilities
- Design, build, and maintain efficient, reusable, and reliable Node.js code.
- Develop and manage RESTful APIs for our web and mobile applications.
- Integrate with third-party services and databases (e.g., PostgreSQL, Redis).
- Write unit and integration tests to ensure code quality and reliability.
- Collaborate with frontend developers to define API contracts and integrate services.

Qualifications
- 3+ years of professional experience with Node.js and Express.js (or a similar framework).
- Strong understanding of asynchronous programming and its quirks.
- Experience with relational databases (e.g., PostgreSQL, MySQL) and ORMs.
- Familiarity with containerization technologies like Docker is a plus.
    `,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: JobStatus.ACTIVE,
  },
  {
    id: 'job3',
    title: 'Lead Product Designer',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$160,000 - $190,000',
    description: 'We are seeking a Lead Product Designer to own the user experience for our flagship product. You will lead a team of designers and work closely with product and engineering to create intuitive and beautiful interfaces.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: JobStatus.CLOSED,
  },
   {
    id: 'job4',
    title: 'Data Scientist, Machine Learning',
    location: 'Austin, TX',
    salary: '$130,000 - $160,000',
    description: 'Join our data science team to build machine learning models that solve real-world problems. Experience with NLP and computer vision is a plus.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: JobStatus.DRAFT,
  },
  {
    id: 'job7',
    title: 'Junior Graphic Designer',
    location: 'New York, NY',
    salary: '$60,000 - $75,000',
    description: `
About the Role
We are looking for a creative and passionate Junior Graphic Designer to join our marketing team. This is a great opportunity for a recent graduate or early-career designer to contribute to a variety of projects, including social media assets, marketing collateral, and website visuals.

Key Responsibilities
- Create engaging graphics for social media platforms, blog posts, and email newsletters.
- Assist in the design of marketing materials like brochures, presentations, and case studies.
- Help maintain and enforce brand guidelines across all creative assets.
- Collaborate with the marketing team to brainstorm and execute visual concepts.

Qualifications
- A strong portfolio showcasing your design skills and creativity.
- Proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign).
- A good understanding of design principles, typography, and color theory.
- Eagerness to learn and take on new challenges.
    `,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: JobStatus.ACTIVE,
  }
];

let MOCK_APPLICATIONS: Application[] = [
    // Job 1
    { id: 'app1', jobId: 'job1', candidateId: 'c1', status: CandidateStatus.INTERVIEW, appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), notes: 'Seems like a strong fit. Asked good questions in the initial screen.', resumeText: MOCK_CANDIDATES['c1'].resumeText },
    { id: 'app2', jobId: 'job1', candidateId: 'c2', status: CandidateStatus.APPLIED, appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), resumeText: MOCK_CANDIDATES['c2'].resumeText },
    { id: 'app3', jobId: 'job1', candidateId: 'c3', status: CandidateStatus.OFFER, appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), resumeText: MOCK_CANDIDATES['c3'].resumeText },
    // Job 2
    { id: 'app4', jobId: 'job2', candidateId: 'c5', status: CandidateStatus.SCREENING, appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), resumeText: MOCK_CANDIDATES['c5'].resumeText },
    // Job 3
    { id: 'app5', jobId: 'job3', candidateId: 'c4', status: CandidateStatus.HIRED, appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), resumeText: MOCK_CANDIDATES['c4'].resumeText },
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

export const fetchAllApplications = (): Promise<Application[]> => {
    return simulateDelay(MOCK_APPLICATIONS);
};

export const addBillingItem = (service: ServiceType, description: string): Promise<BillingItem> => {
    // This is the first action that can be billed, so we set the start date here.
    checkAndSetDiscountStartDate();
    
    let finalAmount = PRICING[service];
    let finalDescription = description;

    if (isDiscountActive()) {
        finalAmount = PRICING[service] * 0.10; // 90% discount
        finalDescription = `${description} (90% new member discount)`;
    }

    const newBillingItem: BillingItem = {
        id: generateId('b'),
        service,
        amount: finalAmount,
        date: new Date().toISOString(),
        description: finalDescription,
    };
    MOCK_BILLING_ITEMS.unshift(newBillingItem);
    return simulateDelay(newBillingItem);
}

export const createJob = async (jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> => {
    const newJob: Job = {
        ...jobData,
        id: generateId('job'),
        createdAt: new Date().toISOString(),
    };
    MOCK_JOBS.unshift(newJob);
    if (newJob.status === JobStatus.ACTIVE) {
        await addBillingItem(ServiceType.JOB_POST, `Job Post: ${newJob.title}`);
    }
    return simulateDelay(newJob);
}

export const updateJob = async (id: string, updates: Partial<Job>): Promise<Job> => {
    const originalJob = MOCK_JOBS.find(j => j.id === id);
    if (!originalJob) {
        return Promise.reject(new Error('Job not found'));
    }

    let updatedJobResult: Job | null = null;

    // Use .map to create a new array, ensuring immutability
    MOCK_JOBS = MOCK_JOBS.map(job => {
        if (job.id === id) {
            updatedJobResult = { ...job, ...updates };
            return updatedJobResult;
        }
        return job;
    });

    if (!updatedJobResult) {
        // This case should not be reachable if originalJob was found, but it's a good safeguard.
        return Promise.reject(new Error('Job not found during update'));
    }

    // Handle billing side-effect
    if (originalJob.status === JobStatus.DRAFT && updatedJobResult.status === JobStatus.ACTIVE) {
        await addBillingItem(ServiceType.JOB_POST, `Job Post: ${updatedJobResult.title}`);
    }

    return simulateDelay(updatedJobResult);
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

export const updateApplication = (id: string, updates: Partial<Application>): Promise<Application> => {
    const appIndex = MOCK_APPLICATIONS.findIndex(a => a.id === id);
    if (appIndex === -1) {
        return Promise.reject(new Error('Application not found'));
    }
    const updatedApplication = { ...MOCK_APPLICATIONS[appIndex], ...updates };
    MOCK_APPLICATIONS[appIndex] = updatedApplication;
    return simulateDelay(updatedApplication);
}


export const fetchBillingItems = (): Promise<BillingItem[]> => {
    return simulateDelay(MOCK_BILLING_ITEMS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export const applyForJob = async (
    jobId: string, 
    candidateId: string,
    resumeData: { resumeText?: string; resumeFileName?: string; resumeFileData?: string; }
): Promise<Application> => {
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (!job) return Promise.reject(new Error('Job not found'));
    
    const candidate = MOCK_CANDIDATES[candidateId];
    if (!candidate) return Promise.reject(new Error('Candidate not found'));

    const existingApplication = MOCK_APPLICATIONS.find(app => app.jobId === jobId && app.candidateId === candidateId);
    if (existingApplication) {
        return Promise.reject(new Error('You have already applied for this job.'));
    }

    const newApplication: Application = {
        id: generateId('app'),
        jobId,
        candidateId,
        status: CandidateStatus.APPLIED,
        appliedDate: new Date().toISOString(),
        ...resumeData,
    };
    
    MOCK_APPLICATIONS.push(newApplication);
    
    return simulateDelay(newApplication);
}

export const withdrawApplication = (applicationId: string): Promise<Application> => {
    const appIndex = MOCK_APPLICATIONS.findIndex(a => a.id === applicationId);
    if (appIndex === -1) {
        return Promise.reject(new Error('Application not found'));
    }
    const updatedApplication = { ...MOCK_APPLICATIONS[appIndex], status: CandidateStatus.WITHDRAWN };
    MOCK_APPLICATIONS[appIndex] = updatedApplication;
    return simulateDelay(updatedApplication);
}