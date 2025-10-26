
import { useState, useEffect, useCallback } from 'react';
import type { Job, Candidate, BillingItem, ServiceType, JobStatus } from '../types';
import { 
  fetchJobs as apiFetchJobs,
  fetchJobById as apiFetchJobById,
  fetchAllCandidates as apiFetchAllCandidates,
  createJob as apiCreateJob,
  updateJob as apiUpdateJob,
  updateCandidate as apiUpdateCandidate,
  fetchBillingItems as apiFetchBillingItems,
  addBillingItem as apiAddBillingItem
} from '../services/mockApiService';

export const usePaygApi = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedJobs, fetchedBillingItems, fetchedCandidates] = await Promise.all([
        apiFetchJobs(),
        apiFetchBillingItems(),
        apiFetchAllCandidates(),
      ]);
      setJobs(fetchedJobs);
      setBillingItems(fetchedBillingItems);
      setCandidates(fetchedCandidates);
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

  const getJobWithCandidates = useCallback(async (jobId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const job = await apiFetchJobById(jobId);
      if (!job) throw new Error('Job not found');
      
      return { job, candidates: job.candidateIds.map(id => candidates[id]).filter(Boolean) };
    } catch (err) {
      setError(`Failed to load job details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [candidates]);

  const postJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'candidateIds'> & { status: JobStatus }) => {
    try {
      setIsLoading(true);
      setError(null);
      const newJob = await apiCreateJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      
      const newBillingItems = await apiFetchBillingItems();
      setBillingItems(newBillingItems);
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
      return updatedJob;
    } catch (err) {
      setError('Failed to update job.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCandidateState = async (candidateId: string, updates: Partial<Candidate>) => {
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
      setError('Failed to update candidate.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addBillingCharge = async (service: ServiceType, description: string) => {
    try {
        setIsLoading(true);
        setError(null);
        await apiAddBillingItem(service, description);
        const newBillingItems = await apiFetchBillingItems();
        setBillingItems(newBillingItems);
    } catch (err) {
        setError(`Failed to add billing charge: ${service}`);
    } finally {
        setIsLoading(false);
    }
  }


  return {
    jobs,
    candidates,
    billingItems,
    isLoading,
    error,
    getJobWithCandidates,
    postJob,
    updateJob,
    updateCandidateState,
    addBillingCharge,
  };
};
