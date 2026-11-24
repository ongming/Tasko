import type { AiSuggestedTaskItem } from '../entities/ai-analysis.entity.js';

export const AI_SERVICE = 'AI_SERVICE';

export interface AiProjectMemberContext {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

export interface AiWorkTypeContext {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface ExtractTasksInput {
  text: string;
  fileName: string;
  projectName: string;
  members: AiProjectMemberContext[];
  workTypes: AiWorkTypeContext[];
  currentDate: string;
  hint?: string;
}

export interface IAiService {
  /**
   * Trích xuất danh sách công việc đề xuất có cấu trúc từ nội dung văn bản tài liệu
   */
  extractTasksFromText(input: ExtractTasksInput): Promise<AiSuggestedTaskItem[]>;
}
