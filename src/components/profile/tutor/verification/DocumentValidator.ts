
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';
import { FileValidationResult } from './types';

export class DocumentValidator {
  static validateFile(file: File): FileValidationResult {
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Файл "${file.name}" слишком большой. Максимальный размер: 10MB`
      };
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Файл "${file.name}" имеет неподдерживаемый формат. Разрешены: PDF, JPG, PNG, DOC, DOCX`
      };
    }
    
    return { isValid: true };
  }

  static validateFiles(files: File[]): FileValidationResult {
    if (files.length > 5) {
      return {
        isValid: false,
        error: 'Можно загрузить максимум 5 файлов за раз'
      };
    }

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return validation;
      }
    }

    return { isValid: true };
  }
}
