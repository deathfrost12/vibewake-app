import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioTrack } from './types';

export interface UploadedAudioFile {
  id: string;
  name: string;
  originalName: string;
  uri: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

class FileUploadServiceClass {
  private readonly STORAGE_KEY = 'uploaded-audio-files';
  private readonly AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly SUPPORTED_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/m4a',
    'audio/wav',
    'audio/aac',
    'audio/x-m4a',
  ];

  async initialize(): Promise<void> {
    try {
      // Create audio directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.AUDIO_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.AUDIO_DIR, { intermediates: true });
        console.log('📁 Created audio directory');
      }
    } catch (error) {
      console.error('❌ Failed to initialize FileUploadService:', error);
      throw error;
    }
  }

  async pickAndUploadAudioFile(): Promise<UploadedAudioFile | null> {
    try {
      console.log('📱 Opening document picker for audio files');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        console.log('👤 User cancelled file picker');
        return null;
      }

      const file = result.assets[0];
      
      // Validate file
      this.validateAudioFile(file);
      
      // Copy file to permanent storage
      const uploadedFile = await this.saveAudioFile(file);
      
      // Save to storage
      await this.saveUploadedFileMetadata(uploadedFile);
      
      console.log('✅ Audio file uploaded successfully:', uploadedFile.name);
      return uploadedFile;
      
    } catch (error) {
      console.error('❌ Failed to upload audio file:', error);
      throw error;
    }
  }

  private validateAudioFile(file: DocumentPicker.DocumentPickerAsset): void {
    // Check file size
    if (file.size && file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.MAX_FILE_SIZE)})`);
    }

    // Check MIME type
    if (file.mimeType && !this.SUPPORTED_TYPES.includes(file.mimeType)) {
      throw new Error(`Unsupported file type: ${file.mimeType}. Supported formats: MP3, M4A, WAV, AAC`);
    }

    // Check file extension as fallback
    const extension = file.name.toLowerCase().split('.').pop();
    const supportedExtensions = ['mp3', 'm4a', 'wav', 'aac'];
    if (!extension || !supportedExtensions.includes(extension)) {
      throw new Error(`Unsupported file extension: .${extension}. Supported formats: .mp3, .m4a, .wav, .aac`);
    }
  }

  private async saveAudioFile(file: DocumentPicker.DocumentPickerAsset): Promise<UploadedAudioFile> {
    const fileId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = file.name.split('.').pop() || 'mp3';
    const fileName = `${fileId}.${fileExtension}`;
    const targetUri = `${this.AUDIO_DIR}${fileName}`;

    try {
      console.log('💾 Copying file to permanent storage');
      await FileSystem.copyAsync({
        from: file.uri,
        to: targetUri,
      });

      const uploadedFile: UploadedAudioFile = {
        id: fileId,
        name: fileName,
        originalName: file.name,
        uri: targetUri,
        size: file.size || 0,
        mimeType: file.mimeType || 'audio/mpeg',
        uploadedAt: new Date().toISOString(),
      };

      return uploadedFile;
    } catch (error) {
      console.error('❌ Failed to save audio file:', error);
      throw new Error('Failed to save audio file to device storage');
    }
  }

  private async saveUploadedFileMetadata(file: UploadedAudioFile): Promise<void> {
    try {
      const existingFiles = await this.getUploadedFiles();
      const updatedFiles = [...existingFiles, file];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch (error) {
      console.error('❌ Failed to save file metadata:', error);
      throw error;
    }
  }

  async getUploadedFiles(): Promise<UploadedAudioFile[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const files: UploadedAudioFile[] = JSON.parse(stored);
      
      // Verify files still exist on filesystem
      const validFiles: UploadedAudioFile[] = [];
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (fileInfo.exists) {
          validFiles.push(file);
        } else {
          console.warn('⚠️ File no longer exists:', file.originalName);
        }
      }
      
      // Update storage if some files were removed
      if (validFiles.length !== files.length) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(validFiles));
      }
      
      return validFiles;
    } catch (error) {
      console.error('❌ Failed to get uploaded files:', error);
      return [];
    }
  }

  async deleteUploadedFile(fileId: string): Promise<void> {
    try {
      const files = await this.getUploadedFiles();
      const fileToDelete = files.find(f => f.id === fileId);
      
      if (!fileToDelete) {
        throw new Error('File not found');
      }

      // Delete from filesystem
      const fileInfo = await FileSystem.getInfoAsync(fileToDelete.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileToDelete.uri);
      }

      // Remove from metadata
      const updatedFiles = files.filter(f => f.id !== fileId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles));
      
      console.log('🗑️ Deleted audio file:', fileToDelete.originalName);
    } catch (error) {
      console.error('❌ Failed to delete audio file:', error);
      throw error;
    }
  }

  convertToAudioTrack(file: UploadedAudioFile): AudioTrack {
    return {
      id: file.id,
      name: file.originalName,
      uri: file.uri,
      type: 'uploaded',
    };
  }

  async convertAllToAudioTracks(): Promise<AudioTrack[]> {
    const files = await this.getUploadedFiles();
    return files.map(file => this.convertToAudioTrack(file));
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up old files (optional maintenance method)
  async cleanupOldFiles(daysOld: number = 30): Promise<void> {
    try {
      const files = await this.getUploadedFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filesToDelete = files.filter(file => 
        new Date(file.uploadedAt) < cutoffDate
      );

      for (const file of filesToDelete) {
        await this.deleteUploadedFile(file.id);
      }

      if (filesToDelete.length > 0) {
        console.log(`🧹 Cleaned up ${filesToDelete.length} old audio files`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old files:', error);
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number; totalSizeFormatted: string }> {
    try {
      const files = await this.getUploadedFiles();
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      
      return {
        totalFiles: files.length,
        totalSize,
        totalSizeFormatted: this.formatFileSize(totalSize),
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return { totalFiles: 0, totalSize: 0, totalSizeFormatted: '0 Bytes' };
    }
  }
}

// Export singleton instance
export const FileUploadService = new FileUploadServiceClass();