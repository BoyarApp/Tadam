import { get, post } from '../client';
import type { Submission, ArticleSubmission, AdSubmission, APIResponse } from '@types';

// Get user's submissions
export const getMySubmissions = async (): Promise<Submission[]> => {
  const response = await get<APIResponse<Submission[]>>('/api/submissions', {
    params: {
      populate: '*',
      sort: 'createdAt:desc',
    },
  });
  return response.data;
};

// Get submission by ID
export const getSubmission = async (id: number): Promise<Submission> => {
  const response = await get<APIResponse<Submission>>(`/api/submissions/${id}`, {
    params: { populate: '*' },
  });
  return response.data;
};

// Submit article
export const submitArticle = async (data: ArticleSubmission): Promise<Submission> => {
  const response = await post<APIResponse<Submission>>('/api/submissions', {
    data: {
      type: 'article',
      ...data,
    },
  });
  return response.data;
};

// Submit ad
export const submitAd = async (data: AdSubmission): Promise<Submission> => {
  const response = await post<APIResponse<Submission>>('/api/submissions', {
    data: {
      type: 'ad',
      ...data,
    },
  });
  return response.data;
};

// Delete submission
export const deleteSubmission = async (id: number): Promise<void> => {
  await post(`/api/submissions/${id}`, { data: { deleted: true } });
};
