import { useState, useEffect, useCallback } from 'react';
import type { Job, Candidate, BillingItem, ServiceType, Application, CandidateStatus } from '../types';
import { 
  fetchJobs as apiFetchJobs,
  fetchAllCandidates as apiFetchAllCandidates,
  fetchAllApplications as apiFetchAllApplications,
  createJob as apiCreateJob,
  updateJob as apiUpdateJob,
  updateCandidate as apiUpdateCandidate,
  updateApplication as apiUpdateApplication,
  fetchBillingItems as apiFetchBillingItems,
  addBillingItem as apiAddBillingItem,
  applyForJob as apiApplyForJob,
  withdrawApplication as apiWithdrawApplication,
  isDiscountActive as apiIsDiscountActive,
  getDiscountEndDate as apiGetDiscountEndDate,
} from '../services/mockApiService';

export const usePaygApi = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountEndDate, setDiscountEndDate] = useState<Date | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedJobs, fetchedBillingItems, fetchedCandidates, fetchedApplications] = await Promise.all([
        apiFetchJobs(),
        apiFetchBillingItems(),
        apiFetchAllCandidates(),
        apiFetchAllApplications(),
      ]);
      setJobs(fetchedJobs);
      setBillingItems(fetchedBillingItems);
      setCandidates(fetchedCandidates);
      setApplications(fetchedApplications);
      setIsDiscountActive(apiIsDiscountActive());
      setDiscountEndDate(apiGetDiscountEndDate());
    } catch (err) {
      setError('Failed to load initial data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const postJob = async (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newJob = await apiCreateJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      
      const newBillingItems = await apiFetchBillingItems();
      setBillingItems(newBillingItems);
      // Update discount status in case it was the first action
      setIsDiscountActive(apiIsDiscountActive());
      setDiscountEndDate(apiGetDiscountEndDate());
      return newJob;
    } catch (err) {
      setError('Failed to post new job.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
     try {
      setIsLoading(true);
      setError(null);
      const updatedJob = await apiUpdateJob(jobId, updates);
      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
      const newBillingItems = await apiFetchBillingItems();
      setBillingItems(newBillingItems);
       // Update discount status in case it was the first action
      setIsDiscountActive(apiIsDiscountActive());
      setDiscountEndDate(apiGetDiscountEndDate());
      return updatedJob;
    } catch (err)
 {
      setError('Failed to update job.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCandidateProfile = async (candidateId: string, updates: Partial<Candidate>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCandidate = await apiUpdateCandidate(candidateId, updates);
      setCandidates(prev => ({
        ...prev,
        [candidateId]: updatedCandidate,
      }));
      return updatedCandidate;
    } catch (err) {
      setError('Failed to update candidate profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationState = async (applicationId: string, updates: Partial<Application>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedApplication = await apiUpdateApplication(applicationId, updates);
      setApplications(prev => prev.map(a => a.id === applicationId ? updatedApplication : a));
      return updatedApplication;
    } catch (err) {
      setError('Failed to update application.');
    } finally {
      setIsLoading(false);
    }
  }
  
  const addBillingCharge = async (service: ServiceType, description: string) => {
    try {
        setIsLoading(true);
        setError(null);
        await apiAddBillingItem(service, description);
        const newBillingItems = await apiFetchBillingItems();
        setBillingItems(newBillingItems);
        // Update discount status in case it was the first action
        setIsDiscountActive(apiIsDiscountActive());
        setDiscountEndDate(apiGetDiscountEndDate());
    } catch (err) {
        setError(`Failed to add billing charge: ${service}`);
    } finally {
        setIsLoading(false);
    }
  }

  const applyForJob = async (
    jobId: string,
    candidateId: string,
    resumeData: { resumeText?: string; resumeFileName?: string; resumeFileData?: string }
  ) => {
    try {
        setIsLoading(true);
        setError(null);
        const newApplication = await apiApplyForJob(jobId, candidateId, resumeData);
        setApplications(prev => [...prev, newApplication]);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to apply for job.');
        throw err;
    } finally {
        setIsLoading(false);
    }
  }

  const withdrawApplication = async (applicationId: string) => {
    try {
        setIsLoading(true);
        setError(null);
        const updatedApplication = await apiWithdrawApplication(applicationId);
        setApplications(prev => prev.map(a => a.id === applicationId ? updatedApplication : a));
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to withdraw application.');
        throw err;
    } finally {
        setIsLoading(false);
    }
  }


  return {
    jobs,
    candidates,
    applications,
    billingItems,
    isLoading,
    error,
    postJob,
    updateJob,
    updateCandidateProfile,
    updateApplicationState,
    addBillingCharge,
    applyForJob,
    withdrawApplication,
    isDiscountActive,
    discountEndDate,
  };
};