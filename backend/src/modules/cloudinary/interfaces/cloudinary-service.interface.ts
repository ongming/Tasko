export const CLOUDINARY_SERVICE = 'CLOUDINARY_SERVICE';

export interface ICloudinaryService {
  /**
   * Tải ảnh lên Cloudinary từ buffer của file Multer
   * @param file File ảnh từ multipart/form-data
   * @param folder Thư mục lưu trữ trên Cloudinary (mặc định: tasko/avatars)
   * @returns URL ảnh đã tối ưu an toàn (secure_url)
   */
  uploadImage(file: Express.Multer.File, folder?: string): Promise<string>;
}
