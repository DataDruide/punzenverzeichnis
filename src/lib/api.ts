import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Contact = Tables<'contacts'>;
export type ContactInsert = TablesInsert<'contacts'>;
export type ContactUpdate = TablesUpdate<'contacts'>;
export type ImageRecord = Tables<'images'>;
export type ImageInsert = TablesInsert<'images'>;

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
  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('verband-bilder')
    .remove([storagePath]);
  if (storageError) console.error('Storage delete error:', storageError);
  
  // Then delete metadata
  const { error } = await supabase.from('images').delete().eq('id', id);
  if (error) throw error;
}

// ---- FILE UPLOAD WITH VALIDATION ----

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateFileClient(file: File): string[] {
  const errors: string[] = [];
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Datei zu groß: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum: 10 MB.`);
  }
  if (file.size === 0) {
    errors.push('Leere Datei.');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`Dateityp "${file.type}" nicht erlaubt.`);
  }
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`Dateiendung "${ext}" nicht erlaubt.`);
  }
  // Double extension check
  const parts = file.name.split('.');
  if (parts.length > 2) {
    const suspicious = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.ps1', '.sh'];
    for (const p of parts) {
      if (suspicious.includes('.' + p.toLowerCase())) {
        errors.push('Verdächtige Doppel-Dateiendung erkannt.');
        break;
      }
    }
  }
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Ungültiger Dateiname.');
  }
  return errors;
}

export async function validateFileServer(file: File): Promise<{ valid: boolean; errors?: string[] }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data, error } = await supabase.functions.invoke('validate-upload', {
    body: formData,
  });
  
  if (error) {
    return { valid: false, errors: ['Servervalidierung fehlgeschlagen: ' + error.message] };
  }
  
  return data;
}

export async function uploadImage(file: File): Promise<{ storagePath: string; publicUrl: string }> {
  // Client-side validation first
  const clientErrors = validateFileClient(file);
  if (clientErrors.length > 0) {
    throw new Error(clientErrors.join(' '));
  }

  // Server-side validation
  const serverResult = await validateFileServer(file);
  if (!serverResult.valid) {
    throw new Error(serverResult.errors?.join(' ') || 'Datei ungültig.');
  }

  // Generate safe filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from('verband-bilder')
    .upload(storagePath, file, { contentType: file.type });
  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('verband-bilder')
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: urlData.publicUrl };
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
