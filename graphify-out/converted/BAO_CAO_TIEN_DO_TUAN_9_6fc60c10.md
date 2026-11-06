<!-- converted from BAO_CAO_TIEN_DO_TUAN_9.docx -->

BÁO CÁO TIẾN ĐỘ TUẦN 9
1. Khối lượng công việc và nội dung đã thực hiện
Hoàn thiện quy trình Wizard 3 bước khởi tạo dự án (3-Step Project Creation):
- Bước 1 (Method Selection): Lựa chọn và mô phỏng trực quan 3 phương pháp Agile cốt lõi (Kanban, Scrum, Scrumban) bằng vector đồ họa CSS/SVG thuần, không phụ thuộc tài nguyên ảnh tĩnh bên ngoài nhằm tối ưu hiệu năng hiển thị.
- Bước 2 (Preview & Domain Configuration): Thiết kế giao diện tham chiếu dạng phẳng (Borderless Canvas) chuẩn Jira; hiển thị luồng quy trình làm việc (Workflow), danh mục thẻ hỗ trợ (Work Types) và tích hợp danh mục 6 mô hình hoạt động doanh nghiệp (Lập trình & Công nghệ, Kinh doanh, Marketing, Vận tải & Chuỗi cung ứng, Chăm sóc khách hàng, Đa dụng).
- Bước 3 (Project Identity Setup): Tách biệt không gian thiết lập định danh chuyên sâu để nhập tên dự án, ứng dụng thuật toán tự động chuẩn hóa và sinh mã Key quốc tế (khử dấu tiếng Việt), kết hợp bảng màu sắc nhận diện thương hiệu.
Tái cấu trúc kiến trúc Frontend theo nguyên lý Separation of Concerns (SoC):
- Tách biệt hoàn toàn Business Logic và State Management ra Custom Hook độc lập useCreateProject.ts, chuyển các component giao diện thành Pure Presentational Views nhằm tăng khả năng bảo trì và phục vụ Unit Testing.
- Quy hoạch và đồng bộ hóa toàn bộ các giao ước kiểu dữ liệu (Interfaces/Types) về trung tâm lưu trữ src/types/createProject.ts, đạt chuẩn Centralized Types và đảm bảo tính toàn vẹn kiểu dữ liệu hai chiều (Type-Safety).
- Hoàn thiện tiêu chuẩn tiếp cận người dùng (WCAG A11y: role="button", aria-label, điều hướng phím Enter/Space/Escape) và tích hợp cơ chế bắt lỗi ngoại lệ, phản hồi thông điệp trực quan từ API Backend.
2. Các vấn đề cần thực hiện trong giai đoạn tiếp theo
- Xây dựng phân hệ Quản lý Thẻ công việc (Task Management): Xây dựng giao diện tạo Task nhanh (Quick-Create Modal) trực tiếp theo ngữ cảnh hiển thị trên bảng điều khiển; hỗ trợ quản lý các thuộc tính nghiệp vụ cốt lõi bao gồm: Người thực hiện (Assignee), Độ ưu tiên (Priority), Nhãn phân loại (Labels) và Thời hạn hoàn thành (Due Date).
- Phát triển cơ chế Kéo - Thả tương tác trên Bảng Kanban (Interactive Drag & Drop): Thiết lập cấu trúc các cột trạng thái luân chuyển mặc định (To Do ➔ In Progress ➔ Done); tích hợp động cơ kéo - thả thẻ nhiệm vụ mượt mà giữa các cột trạng thái.
- Tối ưu hóa trải nghiệm phản hồi dữ liệu thời gian thực: Ứng dụng kỹ thuật Cập nhật lạc quan (Optimistic UI Updates) nhằm tự động cập nhật vị trí thẻ trên giao diện trước khi đồng bộ dữ liệu ngầm với Database PostgreSQL, mang lại trải nghiệm tương tác tức thời và liền mạch cho người dùng.