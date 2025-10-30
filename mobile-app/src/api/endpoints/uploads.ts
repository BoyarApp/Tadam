import { post } from '../client';
import type { Media } from '@types';

// Upload single image
export const uploadImage = async (file: {
  uri: string;
  type: string;
  name: string;
}): Promise<Media> => {
  const formData = new FormData();
  formData.append('files', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  const response = await post<Media[]>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response[0];
};

// Upload multiple images
export const uploadImages = async (files: Array<{
  uri: string;
  type: string;
  name: string;
}>): Promise<Media[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
  });

  const response = await post<Media[]>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

// Delete upload
export const deleteUpload = async (id: number): Promise<void> => {
  await post(`/api/upload/files/${id}`, {});
};
