import { FileCategory, FileItem, FolderItem, GoogleDriveQuota, GoogleDriveUser } from '../types';
import { getAccessToken } from './GoogleIdentityAccessManagement';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Categorize MIME type into app file categories
 */
export function mapMimeToCategory(mimeType: string, filename: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp', 'ico'].includes(ext)) {
    return 'images';
  }
  if (
    mimeType.startsWith('video/') ||
    ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(ext) ||
    mimeType === 'application/vnd.google-apps.video'
  ) {
    return 'videos';
  }
  if (
    mimeType.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext) ||
    mimeType === 'application/vnd.google-apps.audio'
  ) {
    return 'audio';
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('tar') ||
    mimeType.includes('compressed') ||
    mimeType.includes('rar') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)
  ) {
    return 'archives';
  }
  if (
    mimeType.startsWith('text/x-') ||
    mimeType.includes('javascript') ||
    mimeType.includes('typescript') ||
    mimeType.includes('json') ||
    ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'html', 'css', 'scss', 'rs', 'go', 'cpp', 'c', 'sql'].includes(ext)
  ) {
    return 'code';
  }
  if (
    mimeType.startsWith('application/pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation') ||
    mimeType.includes('word') ||
    mimeType.includes('sheet') ||
    mimeType.includes('powerpoint') ||
    mimeType.startsWith('text/') ||
    mimeType.includes('google-apps.document') ||
    mimeType.includes('google-apps.spreadsheet') ||
    mimeType.includes('google-apps.presentation') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv'].includes(ext)
  ) {
    return 'documents';
  }

  return 'other';
}

export function isHtml5AppFile(filename: string, mimeType?: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['html', 'htm', 'xhtml'].includes(ext) || mimeType === 'text/html') {
    return true;
  }
  return false;
}

/**
 * Fetch authenticated Google Drive headers
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Fetch Google Drive User profile & Storage Quota
 */
export async function getDriveAbout(): Promise<{ user: GoogleDriveUser; quota: GoogleDriveQuota }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/about?fields=storageQuota,user`, {
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Drive information: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const rawQuota = data.storageQuota || {};
  const rawUser = data.user || {};

  return {
    user: {
      displayName: rawUser.displayName || 'Google Drive User',
      emailAddress: rawUser.emailAddress || '',
      photoLink: rawUser.photoLink,
    },
    quota: {
      limit: rawQuota.limit ? parseInt(rawQuota.limit, 10) : 16106127360, // default 15GB
      usage: rawQuota.usage ? parseInt(rawQuota.usage, 10) : 0,
      usageInDrive: rawQuota.usageInDrive ? parseInt(rawQuota.usageInDrive, 10) : 0,
      usageInDriveTrash: rawQuota.usageInDriveTrash ? parseInt(rawQuota.usageInDriveTrash, 10) : 0,
    },
  };
}

export interface ListDriveItemsOptions {
  folderId?: string | null;
  mode?: 'files' | 'starred' | 'trash' | 'shared';
  searchQuery?: string;
  pageSize?: number;
}

/**
 * List files and folders from Google Drive
 */
export async function listDriveItems(options: ListDriveItemsOptions = {}): Promise<{
  files: FileItem[];
  folders: FolderItem[];
}> {
  const headers = await getAuthHeaders();
  const { folderId, mode = 'files', searchQuery, pageSize = 100 } = options;

  const queryParts: string[] = [];

  if (mode === 'trash') {
    queryParts.push('trashed = true');
  } else {
    queryParts.push('trashed = false');

    if (mode === 'starred') {
      queryParts.push('starred = true');
    } else if (mode === 'shared') {
      queryParts.push('sharedWithMe = true');
    } else {
      // Normal folder browsing
      if (searchQuery && searchQuery.trim()) {
        // Global search if query is provided
      } else {
        const parent = folderId || 'root';
        queryParts.push(`'${parent}' in parents`);
      }
    }
  }

  if (searchQuery && searchQuery.trim()) {
    // Sanitize search query for Drive search clause
    const sanitized = searchQuery.replace(/'/g, "\\'");
    queryParts.push(`name contains '${sanitized}'`);
  }

  const q = queryParts.join(' and ');
  const fields =
    'nextPageToken,files(id,name,mimeType,size,modifiedTime,createdTime,starred,trashed,iconLink,thumbnailLink,webViewLink,webContentLink,shared,owners,description,parents)';

  const params = new URLSearchParams({
    q,
    pageSize: String(pageSize),
    fields,
    orderBy: 'folder,name',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const rawItems: any[] = data.files || [];

  const folders: FolderItem[] = [];
  const files: FileItem[] = [];

  for (const item of rawItems) {
    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
    const parent = item.parents && item.parents.length > 0 ? item.parents[0] : null;

    if (isFolder) {
      folders.push({
        id: item.id,
        name: item.name,
        parentId: parent === 'root' ? null : parent,
        color: '#3B82F6',
        starred: Boolean(item.starred),
        inTrash: Boolean(item.trashed),
        createdAt: item.createdTime || new Date().toISOString(),
        updatedAt: item.modifiedTime || new Date().toISOString(),
        isDriveFolder: true,
      });
    } else {
      const category = mapMimeToCategory(item.mimeType || '', item.name);
      const sizeBytes = item.size ? parseInt(item.size, 10) : 0;
      const sharedWith = item.shared && item.owners ? item.owners.map((o: any) => o.emailAddress || o.displayName) : [];
      const isHtml5 = isHtml5AppFile(item.name, item.mimeType);

      files.push({
        id: item.id,
        name: item.name,
        folderId: parent === 'root' ? null : parent,
        category,
        size: sizeBytes,
        mimeType: item.mimeType || 'application/octet-stream',
        updatedAt: item.modifiedTime || new Date().toISOString(),
        createdAt: item.createdTime || new Date().toISOString(),
        starred: Boolean(item.starred),
        inTrash: Boolean(item.trashed),
        url: item.thumbnailLink || item.webViewLink,
        webViewLink: item.webViewLink,
        webContentLink: item.webContentLink,
        iconLink: item.iconLink,
        thumbnailLink: item.thumbnailLink,
        isHtml5App: isHtml5,
        tags: isHtml5 ? ['HTML5 App', 'Google Drive', category] : ['Google Drive', category],
        description: item.description || '',
        sharedWith,
        isDriveFile: true,
      });
    }
  }

  return { files, folders };
}

/**
 * Create a new folder inside Google Drive
 */
export async function createDriveFolder(name: string, parentFolderId?: string | null): Promise<FolderItem> {
  const headers = await getAuthHeaders();
  const parents = parentFolderId ? [parentFolderId] : ['root'];

  const res = await fetch(`${DRIVE_API_BASE}/files?fields=id,name,mimeType,modifiedTime,createdTime,starred,trashed`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Google Drive folder: ${res.status} ${errorText}`);
  }

  const item = await res.json();
  return {
    id: item.id,
    name: item.name,
    parentId: parentFolderId || null,
    color: '#3B82F6',
    starred: Boolean(item.starred),
    inTrash: Boolean(item.trashed),
    createdAt: item.createdTime || new Date().toISOString(),
    updatedAt: item.modifiedTime || new Date().toISOString(),
    isDriveFolder: true,
  };
}

/**
 * Upload a file to Google Drive using multipart upload
 */
export async function uploadDriveFile(
  file: File,
  parentFolderId?: string | null,
  onProgress?: (percent: number) => void
): Promise<FileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const metadata = {
    name: file.name,
    parents: parentFolderId ? [parentFolderId] : ['root'],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const enc = new TextEncoder();
  const metadataBytes = enc.encode(metadataPart);
  const mediaHeaderBytes = enc.encode(mediaHeader);
  const closeDelimiterBytes = enc.encode(closeDelimiter);

  // Combine into single ArrayBuffer body
  const combinedLength =
    metadataBytes.byteLength + mediaHeaderBytes.byteLength + fileData.byteLength + closeDelimiterBytes.byteLength;
  const combined = new Uint8Array(combinedLength);

  let offset = 0;
  combined.set(metadataBytes, offset);
  offset += metadataBytes.byteLength;
  combined.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.byteLength;
  combined.set(new Uint8Array(fileData), offset);
  offset += fileData.byteLength;
  combined.set(closeDelimiterBytes, offset);

  // Use XMLHttpRequest to track upload progress accurately
  return new Promise<FileItem>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,createdTime,starred,trashed,iconLink,thumbnailLink,webViewLink,webContentLink,shared,owners,description`
    );
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', `multipart/related; boundary=${boundary}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const item = JSON.parse(xhr.responseText);
          const category = mapMimeToCategory(item.mimeType || '', item.name);
          const sizeBytes = item.size ? parseInt(item.size, 10) : file.size;

          resolve({
            id: item.id,
            name: item.name,
            folderId: parentFolderId || null,
            category,
            size: sizeBytes,
            mimeType: item.mimeType || file.type || 'application/octet-stream',
            updatedAt: item.modifiedTime || new Date().toISOString(),
            createdAt: item.createdTime || new Date().toISOString(),
            starred: Boolean(item.starred),
            inTrash: false,
            url: item.thumbnailLink || item.webViewLink,
            webViewLink: item.webViewLink,
            webContentLink: item.webContentLink,
            iconLink: item.iconLink,
            thumbnailLink: item.thumbnailLink,
            tags: ['Google Drive', category],
            description: item.description || '',
            isDriveFile: true,
          });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during Google Drive upload'));
    xhr.send(combined.buffer);
  });
}

/**
 * Toggle starred state on Google Drive item
 */
export async function toggleStarDriveItem(id: string, starred: boolean): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ starred }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to toggle star: ${res.status} ${errorText}`);
  }
}

/**
 * Move item to Google Drive trash (Mandatory confirmation handled by caller)
 */
export async function trashDriveItem(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to move item to trash: ${res.status} ${errorText}`);
  }
}

/**
 * Restore item from Google Drive trash
 */
export async function restoreDriveItem(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: false }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to restore item: ${res.status} ${errorText}`);
  }
}

/**
 * Permanently delete item from Google Drive (Mandatory confirmation handled by caller)
 */
export async function deleteDriveItemPermanently(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok && res.status !== 404) {
    const errorText = await res.text();
    throw new Error(`Failed to permanently delete item: ${res.status} ${errorText}`);
  }
}

/**
 * Empty Google Drive trash permanently (Mandatory confirmation handled by caller)
 */
export async function emptyDriveTrash(): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/trash`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to empty trash: ${res.status} ${errorText}`);
  }
}

/**
 * Update metadata (name, description) on Google Drive item
 */
export async function updateDriveItem(
  id: string,
  updates: { name?: string; description?: string }
): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update item: ${res.status} ${errorText}`);
  }
}

/**
 * Share a file on Google Drive (creates permissions)
 */
export async function shareDriveFile(
  id: string,
  role: 'reader' | 'commenter' | 'writer' = 'reader',
  type: 'anyone' | 'user' = 'anyone',
  emailAddress?: string
): Promise<{ id: string; webViewLink?: string }> {
  const headers = await getAuthHeaders();
  const body: any = { role, type };
  if (type === 'user' && emailAddress) {
    body.emailAddress = emailAddress;
  }

  const res = await fetch(`${DRIVE_API_BASE}/files/${id}/permissions?fields=id`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to set permissions: ${res.status} ${errorText}`);
  }

  // Also fetch webViewLink to provide share link
  const fileRes = await fetch(`${DRIVE_API_BASE}/files/${id}?fields=webViewLink`, {
    headers,
  });
  const fileData = fileRes.ok ? await fileRes.json() : {};

  return {
    id: (await res.json()).id,
    webViewLink: fileData.webViewLink,
  };
}

/**
 * Fetch raw text/HTML5 content of a file from Google Drive
 */
export async function fetchDriveFileText(fileId: string): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers,
  });

  if (!res.ok) {
    // If standard media fetch fails (e.g. Google Docs native docs), try export
    if (res.status === 403 || res.status === 400) {
      const exportRes = await fetch(`${DRIVE_API_BASE}/files/${fileId}/export?mimeType=text/html`, {
        headers,
      });
      if (exportRes.ok) {
        return await exportRes.text();
      }
    }
    const errorText = await res.text();
    throw new Error(`Failed to load file content from Google Drive (${res.status}): ${errorText}`);
  }

  return await res.text();
}

/**
 * Save updated text/HTML5 content back to Google Drive
 */
export async function saveDriveFileText(
  fileId: string,
  content: string,
  mimeType: string = 'text/html'
): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': mimeType,
    },
    body: content,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to save file content to Google Drive (${res.status}): ${errorText}`);
  }
}

