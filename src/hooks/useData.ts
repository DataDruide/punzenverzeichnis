import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts, createContact, updateContact, deleteContact,
  fetchImages, createImageRecord, deleteImageRecord, uploadImage,
  fetchMyProfile, fetchAllProfiles, updateProfile, createProfile,
  fetchMyPunzen, fetchAllPunzen, fetchPublishedPunzen, createPunze, updatePunze, deletePunze,
  fetchKategorien, fetchSettings, updateSetting, uploadPunzeImage,
  type ContactInsert, type ContactUpdate, type ImageInsert, type ProfileUpdate, type PunzeInsert, type PunzeUpdate,
} from '@/lib/api';
import type { TablesInsert } from '@/integrations/supabase/types';

// ---- CONTACTS ----
export function useContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: fetchContacts });
}
export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (c: ContactInsert) => createContact(c), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) });
}
export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: ContactUpdate }) => updateContact(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) });
}
export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteContact(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) });
}

// ---- PROFILES ----
export function useMyProfile() {
  return useQuery({ queryKey: ['my-profile'], queryFn: fetchMyProfile });
}
export function useAllProfiles() {
  return useQuery({ queryKey: ['all-profiles'], queryFn: fetchAllProfiles });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfileUpdate }) => updateProfile(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-profile'] }); qc.invalidateQueries({ queryKey: ['all-profiles'] }); },
  });
}
export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: TablesInsert<'profiles'>) => createProfile(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

// ---- PUNZEN ----
export function useMyPunzen() {
  return useQuery({ queryKey: ['my-punzen'], queryFn: fetchMyPunzen });
}
export function useAllPunzen() {
  return useQuery({ queryKey: ['all-punzen'], queryFn: fetchAllPunzen });
}
export function usePublishedPunzen() {
  return useQuery({ queryKey: ['published-punzen'], queryFn: fetchPublishedPunzen });
}
export function useCreatePunze() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (p: PunzeInsert) => createPunze(p), onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-punzen'] }); qc.invalidateQueries({ queryKey: ['all-punzen'] }); } });
}
export function useUpdatePunze() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: PunzeUpdate }) => updatePunze(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-punzen'] }); qc.invalidateQueries({ queryKey: ['all-punzen'] }); qc.invalidateQueries({ queryKey: ['published-punzen'] }); } });
}
export function useDeletePunze() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deletePunze(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-punzen'] }); qc.invalidateQueries({ queryKey: ['all-punzen'] }); } });
}
export function useUploadPunzeImage() {
  return useMutation({ mutationFn: ({ file, prefix }: { file: File; prefix: string }) => uploadPunzeImage(file, prefix) });
}

// ---- KATEGORIEN ----
export function useKategorien() {
  return useQuery({ queryKey: ['kategorien'], queryFn: fetchKategorien });
}

// ---- SETTINGS ----
export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
}
export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => updateSetting(id, value), onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }) });
}

// ---- IMAGES ----
export function useImages() {
  return useQuery({ queryKey: ['images'], queryFn: fetchImages });
}
export function useUploadAndCreateImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Omit<ImageInsert, 'dateiname' | 'storage_path' | 'groesse' | 'mime_type'> }) => {
      const { storagePath } = await uploadImage(file);
      return createImageRecord({
        ...metadata, dateiname: file.name, storage_path: storagePath,
        groesse: file.size < 1024 * 1024 ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        mime_type: file.type,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }),
  });
}
export function useCreateImageRecord() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (record: ImageInsert) => createImageRecord(record), onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }) });
}
export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) => deleteImageRecord(id, storagePath), onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }) });
}
