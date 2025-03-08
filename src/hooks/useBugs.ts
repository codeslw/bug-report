// src/hooks/useBugs.ts - React Query hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bug, BugFormData } from '../types';
import { createBug, deleteBug, fetchBugs, getBug, updateBug } from '../services/bugService';

// Query key
const BUGS_QUERY_KEY = 'bugs';

// Fetch all bugs
export const useBugs = () => {
  return useQuery({
    queryKey: [BUGS_QUERY_KEY],
    queryFn: fetchBugs,
  });
};

// Fetch a single bug
export const useBug = (id: string) => {
  return useQuery({
    queryKey: [BUGS_QUERY_KEY, id],
    queryFn: () => getBug(id),
    enabled: !!id,
  });
};

// Create a bug
export const useCreateBug = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBug,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUGS_QUERY_KEY] });
    },
  });
};

// Update a bug
export const useUpdateBug = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BugFormData) => updateBug(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUGS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BUGS_QUERY_KEY, id] });
    },
  });
};

// Delete a bug
export const useDeleteBug = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBug,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUGS_QUERY_KEY] });
    },
  });
};