import { Bug, BugFormData } from '../types';
import { apiClient } from './api';
import { uploadImage } from './storage';

export const fetchBugs = async (): Promise<Bug[]> => {
  const response = await apiClient.get('/bugs');
  return response.data;
};

export const getBug = async (id: string): Promise<Bug> => {
  const response = await apiClient.get(`/bugs/${id}`);
  return response.data;
};

export const createBug = async (data: BugFormData): Promise<Bug> => {
  // Upload image if provided
  let imageUrl = '';
  if (data.image) {
    imageUrl = await uploadImage(data.image);
  }
  
  const response = await apiClient.post('/bugs', {
    ...data,
    imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  return response.data;
};

export const updateBug = async (id: string, data: BugFormData): Promise<Bug> => {
  // Upload new image if provided
  let imageUrl = '';
  if (data.image) {
    imageUrl = await uploadImage(data.image);
  }
  
  const response = await apiClient.put(`/bugs/${id}`, {
    ...data,
    ...(imageUrl && { imageUrl }),
    updatedAt: new Date().toISOString(),
  });
  
  return response.data;
};

export const deleteBug = async (id: string): Promise<void> => {
  await apiClient.delete(`/bugs/${id}`);
};
