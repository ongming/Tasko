export const CLOUDINARY_SERVICE = 'CLOUDINARY_SERVICE';

export type CloudinaryResourceType = 'image' | 'video' | 'raw';

export interface UploadedFileResult {
  url: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
}

export interface ICloudinaryService {
  /**
   * Tải ảnh lên Cloudinary từ buffer của file Multer
   * @param file File ảnh từ multipart/form-data
   * @param folder Thư mục lưu trữ trên Cloudinary (mặc định: tasko/avatars)
   * @returns URL ảnh đã tối ưu an toàn (secure_url)
   */
  uploadImage(file: Express.Multer.File, folder?: string): Promise<string>;

  /**
   * Tải tệp đính kèm nguyên bản (PDF, DOCX, XLSX, ZIP, ảnh...) lên Cloudinary
   * @param file File từ multipart/form-data
   * @param folder Thư mục lưu trữ trên Cloudinary (mặc định: tasko/attachments)
   */
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;

  /**
   * Xóa tệp khỏi Cloudinary theo publicId và resourceType
   */
  deleteFile(publicId: string, resourceType?: CloudinaryResourceType): Promise<void>;
}
