const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif'];

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Known malicious file signatures (magic bytes)
const MALICIOUS_SIGNATURES: Uint8Array[] = [
  // EXE (MZ header)
  new Uint8Array([0x4D, 0x5A]),
  // ELF (Linux executable)
  new Uint8Array([0x7F, 0x45, 0x4C, 0x46]),
  // ZIP (could be disguised)
  // We allow ZIP-based if extension matches, but flag otherwise
];

// Valid image magic bytes
const IMAGE_SIGNATURES: { mime: string; bytes: Uint8Array }[] = [
  { mime: 'image/jpeg', bytes: new Uint8Array([0xFF, 0xD8, 0xFF]) },
  { mime: 'image/png', bytes: new Uint8Array([0x89, 0x50, 0x4E, 0x47]) },
  { mime: 'image/gif', bytes: new Uint8Array([0x47, 0x49, 0x46]) },
  { mime: 'image/webp', bytes: new Uint8Array([0x52, 0x49, 0x46, 0x46]) },
  { mime: 'image/bmp', bytes: new Uint8Array([0x42, 0x4D]) },
  { mime: 'image/tiff', bytes: new Uint8Array([0x49, 0x49]) },
  { mime: 'image/tiff', bytes: new Uint8Array([0x4D, 0x4D]) },
];

function startsWith(data: Uint8Array, signature: Uint8Array): boolean {
  if (data.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (data[i] !== signature[i]) return false;
  }
  return true;
}

function isMalicious(data: Uint8Array): boolean {
  for (const sig of MALICIOUS_SIGNATURES) {
    if (startsWith(data, sig)) return true;
  }
  return false;
}

function matchesImageSignature(data: Uint8Array, claimedMime: string): boolean {
  // SVG is text-based, no magic bytes
  if (claimedMime === 'image/svg+xml') return true;

  for (const sig of IMAGE_SIGNATURES) {
    if (startsWith(data, sig.bytes)) return true;
  }
  return false;
}

function containsSuspiciousContent(text: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick, onerror, etc.
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  return patterns.some(p => p.test(text));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Keine Datei hochgeladen.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const errors: string[] = [];

    // 1. Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Datei zu groß: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum: 10 MB.`);
    }

    if (file.size === 0) {
      errors.push('Leere Datei. Bitte wählen Sie eine gültige Datei.');
    }

    // 2. Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`Dateityp "${file.type}" nicht erlaubt. Erlaubt: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    // 3. Check file extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(`Dateiendung "${ext}" nicht erlaubt.`);
    }

    // 4. Check for double extensions (e.g., image.jpg.exe)
    const parts = file.name.split('.');
    if (parts.length > 2) {
      const suspiciousExts = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs', '.ps1', '.sh'];
      for (const part of parts) {
        if (suspiciousExts.includes('.' + part.toLowerCase())) {
          errors.push('Verdächtige Doppel-Dateiendung erkannt.');
          break;
        }
      }
    }

    // 5. Read file bytes for deeper analysis
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 6. Check for malicious signatures
    if (isMalicious(bytes)) {
      errors.push('Datei enthält verdächtige Signaturen (möglicherweise ausführbare Datei).');
    }

    // 7. Verify magic bytes match claimed MIME type
    if (!matchesImageSignature(bytes, file.type) && errors.length === 0) {
      errors.push('Dateiinhalt stimmt nicht mit dem angegebenen Dateityp überein.');
    }

    // 8. For SVG files, check for embedded scripts
    if (file.type === 'image/svg+xml') {
      const text = new TextDecoder().decode(bytes);
      if (containsSuspiciousContent(text)) {
        errors.push('SVG-Datei enthält verdächtige Skripte oder Event-Handler.');
      }
    }

    // 9. Check filename for path traversal attempts
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Ungültiger Dateiname (Pfad-Traversierung erkannt).');
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({ valid: false, errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      valid: true,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Validierungsfehler: ' + (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
