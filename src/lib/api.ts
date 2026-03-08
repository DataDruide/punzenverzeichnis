import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Contact = Tables<'contacts'>;
export type ContactInsert = TablesInsert<'contacts'>;
export type ContactUpdate = TablesUpdate<'contacts'>;
export type ImageRecord = Tables<'images'>;
export type ImageInsert = TablesInsert<'images'>;
export type Profile = Tables<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type Punze = Tables<'punzen'>;
export type PunzeInsert = TablesInsert<'punzen'>;
export type PunzeUpdate = TablesUpdate<'punzen'>;
export type Kategorie = Tables<'kategorien'>;
export type Setting = Tables<'settings'>;

// ---- CONTACTS ----

export async function fetchContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createContact(contact: ContactInsert) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContact(id: string, contact: ContactUpdate) {
  const { data, error } = await supabase
    .from('contacts')
    .update(contact)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

// ---- PROFILES ----

export async function fetchMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht angemeldet');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateProfile(id: string, profile: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createProfile(profile: TablesInsert<'profiles'>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- PUNZEN ----

export async function fetchMyPunzen() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht angemeldet');
  const { data, error } = await supabase
    .from('punzen')
    .select('*, kategorien(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAllPunzen() {
  const { data, error } = await supabase
    .from('punzen')
    .select('*, kategorien(name), profiles!punzen_user_id_fkey(firmenname, ansprechpartner)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPublishedPunzen() {
  const { data, error } = await supabase
    .from('punzen')
    .select('*, kategorien(name), profiles!punzen_user_id_fkey(firmenname, ansprechpartner, strasse, plz, ort, telefon, email_kontakt, webseite, firma_aktiv)')
    .eq('veroeffentlicht', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPunze(punze: PunzeInsert) {
  const { data, error } = await supabase
    .from('punzen')
    .insert(punze)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePunze(id: string, punze: PunzeUpdate) {
  const { data, error } = await supabase
    .from('punzen')
    .update(punze)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePunze(id: string) {
  const { error } = await supabase.from('punzen').delete().eq('id', id);
  if (error) throw error;
}

// ---- KATEGORIEN ----

export async function fetchKategorien() {
  const { data, error } = await supabase
    .from('kategorien')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

// ---- SETTINGS ----

export async function fetchSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*');
  if (error) throw error;
  return data;
}

export async function updateSetting(id: string, value: string) {
  const { data, error } = await supabase
    .from('settings')
    .update({ value })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- IMAGES ----

export async function fetchImages() {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createImageRecord(record: ImageInsert) {
  const { data, error } = await supabase
    .from('images')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteImageRecord(id: string, storagePath: string) {
  const { error: storageError } = await supabase.storage
    .from('verband-bilder')
    .remove([storagePath]);
  if (storageError) console.error('Storage delete error:', storageError);
  const { error } = await supabase.from('images').delete().eq('id', id);
  if (error) throw error;
}

// ---- FILE UPLOAD WITH VALIDATION ----

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFileClient(file: File): string[] {
  const errors: string[] = [];
  if (file.size > MAX_FILE_SIZE) errors.push(`Datei zu groß: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum: 10 MB.`);
  if (file.size === 0) errors.push('Leere Datei.');
  if (!ALLOWED_TYPES.includes(file.type)) errors.push(`Dateityp "${file.type}" nicht erlaubt.`);
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) errors.push(`Dateiendung "${ext}" nicht erlaubt.`);
  const parts = file.name.split('.');
  if (parts.length > 2) {
    const suspicious = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.ps1', '.sh'];
    for (const p of parts) {
      if (suspicious.includes('.' + p.toLowerCase())) { errors.push('Verdächtige Doppel-Dateiendung erkannt.'); break; }
    }
  }
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) errors.push('Ungültiger Dateiname.');
  return errors;
}

export async function validateFileServer(file: File): Promise<{ valid: boolean; errors?: string[] }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data, error } = await supabase.functions.invoke('validate-upload', { body: formData });
  if (error) return { valid: false, errors: ['Servervalidierung fehlgeschlagen: ' + error.message] };
  return data;
}

export async function uploadImage(file: File): Promise<{ storagePath: string; publicUrl: string }> {
  const clientErrors = validateFileClient(file);
  if (clientErrors.length > 0) throw new Error(clientErrors.join(' '));
  const serverResult = await validateFileServer(file);
  if (!serverResult.valid) throw new Error(serverResult.errors?.join(' ') || 'Datei ungültig.');
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${timestamp}_${safeName}`;
  const { error } = await supabase.storage.from('verband-bilder').upload(storagePath, file, { contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('verband-bilder').getPublicUrl(storagePath);
  return { storagePath, publicUrl: urlData.publicUrl };
}

// Upload specifically for punzen images (simpler, no server validation needed for now)
export async function uploadPunzeImage(file: File, prefix: string): Promise<string> {
  const clientErrors = validateFileClient(file);
  if (clientErrors.length > 0) throw new Error(clientErrors.join(' '));
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `punzen/${prefix}_${timestamp}_${safeName}`;
  const { error } = await supabase.storage.from('verband-bilder').upload(storagePath, file, { contentType: file.type });
  if (error) throw error;
  return storagePath;
}

// ---- HELPERS ----

export function getImagePublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from('verband-bilder').getPublicUrl(storagePath);
  return data.publicUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
