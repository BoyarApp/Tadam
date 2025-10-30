import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@constants';
import * as submissionsAPI from '../endpoints/submissions';
import * as uploadsAPI from '../endpoints/uploads';
import type { ArticleSubmission, AdSubmission } from '@types';

// Get user's submissions
export const useMySubmissions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SUBMISSIONS,
    queryFn: submissionsAPI.getMySubmissions,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Get submission by ID
export const useSubmission = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSIONS, id],
    queryFn: () => submissionsAPI.getSubmission(id),
    enabled: !!id,
  });
};

// Submit article
export const useSubmitArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ArticleSubmission) => submissionsAPI.submitArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBMISSIONS });
    },
  });
};

// Submit ad
export const useSubmitAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdSubmission) => submissionsAPI.submitAd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBMISSIONS });
    },
  });
};

// Delete submission
export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => submissionsAPI.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBMISSIONS });
    },
  });
};

// Upload image
export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadsAPI.uploadImage,
  });
};

// Upload multiple images
export const useUploadImages = () => {
  return useMutation({
    mutationFn: uploadsAPI.uploadImages,
  });
};

// Delete upload
export const useDeleteUpload = () => {
  return useMutation({
    mutationFn: uploadsAPI.deleteUpload,
  });
};
