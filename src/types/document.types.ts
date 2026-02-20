export type DocumentCategory = 'certification' | 'contract' | 'invoice' | 'safety' | 'report' | 'photo' | 'other';

export interface Document {
  id: number;
  uploadedBy: number;
  projectId?: number;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  expiryDate?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  uploaderName?: string;
  projectTitle?: string;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  projectId?: number;
  category: DocumentCategory;
  expiryDate?: string;
  isPublic: boolean;
}
