import { getApiBaseUrl } from '../config/api';
import { getToken } from '../storage/authStorage';

function isLocalUri(uri: string): boolean {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://')
  );
}

export async function uploadImageIfNeeded(imageUri: string): Promise<string> {
  if (!imageUri?.trim()) {
    return '';
  }
  if (!isLocalUri(imageUri)) {
    return imageUri;
  }

  const base = await getApiBaseUrl();
  const token = await getToken();
  if (!token) {
    return imageUri;
  }

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `evidence-${Date.now()}.jpg`,
  } as unknown as Blob);

  const res = await fetch(`${base}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const err = JSON.parse(text) as { message?: string };
      message = err.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = JSON.parse(text) as { imageUri: string };
  return data.imageUri;
}
