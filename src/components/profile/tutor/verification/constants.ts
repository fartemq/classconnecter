
import { DocumentType } from './types';

export const DOCUMENT_TYPES: DocumentType[] = [
  { value: 'diploma', label: 'Диплом об образовании' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'passport', label: 'Паспорт' },
  { value: 'other', label: 'Другой документ' }
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf', 
  'image/jpeg', 
  'image/png', 
  'image/jpg', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
