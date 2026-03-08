import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContacts, createContact, updateContact, deleteContact, fetchImages, createImageRecord, deleteImageRecord, uploadImage, type ContactInsert, type ContactUpdate, type ImageInsert } from '@/lib/api';

export function useContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: fetchContacts });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact: ContactInsert) => createContact(contact),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactUpdate }) => updateContact(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useImages() {
  return useQuery({ queryKey: ['images'], queryFn: fetchImages });
}

export function useUploadAndCreateImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Omit<ImageInsert, 'dateiname' | 'storage_path' | 'groesse' | 'mime_type'> }) => {
      const { storagePath } = await uploadImage(file);
      return createImageRecord({
        ...metadata,
        dateiname: file.name,
        storage_path: storagePath,
        groesse: file.size < 1024 * 1024 ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        mime_type: file.type,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }),
  });
}

export function useCreateImageRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (record: ImageInsert) => createImageRecord(record),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }),
  });
}

export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) => deleteImageRecord(id, storagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }),
  });
}
