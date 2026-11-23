import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type, type Schema } from '@google/genai';
import { randomUUID } from 'node:crypto';
import type { AiSuggestedTaskItem } from './entities/ai-analysis.entity.js';
import type {
  AiProjectMemberContext,
  AiWorkTypeContext,
  ExtractTasksInput,
  IAiService,
} from './interfaces/ai-service.interface.js';

const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!ISO_DATE_REGEX.test(trimmed)) return false;
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === trimmed;
}

/**
 * Kiểm tra & làm sạch dữ liệu đề xuất từ AI (chống ảo giác ID, ngày sai, priority sai, dòng rỗng)
 */
export function sanitizeSuggestedTasks(
  rawItems: unknown,
  members: AiProjectMemberContext[],
  workTypes: AiWorkTypeContext[],
): AiSuggestedTaskItem[] {
  if (!Array.isArray(rawItems)) return [];

  const validMemberIds = new Set(members.map((m) => m.id));
  const validWorkTypeIds = new Set(workTypes.map((w) => w.id));
  const workTypeIdByName = new Map(
    workTypes.map((w) => [w.name.trim().toLowerCase(), w.id]),
  );
  const defaultWorkTypeId =
    workTypes.find((w) => w.isDefault)?.id ?? workTypes[0]?.id ?? null;

  const sanitized: AiSuggestedTaskItem[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;

    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) continue;

    const description =
      typeof item.description === 'string' ? item.description.trim() : '';

    const rawPriority =
      typeof item.priority === 'string' ? item.priority.trim().toUpperCase() : '';
    const priority = (
      VALID_PRIORITIES.has(rawPriority) ? rawPriority : 'MEDIUM'
    ) as AiSuggestedTaskItem['priority'];

    let storyPoints: number | null = null;
    if (typeof item.storyPoints === 'number' && Number.isFinite(item.storyPoints)) {
      const rounded = Math.round(item.storyPoints);
      if (rounded >= 0 && rounded <= 100) {
        storyPoints = rounded;
      }
    }

    let estimatedHours: number | null = null;
    if (typeof item.estimatedHours === 'number' && Number.isFinite(item.estimatedHours)) {
      const rounded = Math.round(item.estimatedHours * 100) / 100;
      if (rounded > 0 && rounded <= 999.99) {
        estimatedHours = rounded;
      }
    }

    let assigneeId: string | null = null;
    if (typeof item.assigneeId === 'string' && validMemberIds.has(item.assigneeId.trim())) {
      assigneeId = item.assigneeId.trim();
    }

    let workTypeId: string | null = defaultWorkTypeId;
    if (typeof item.workTypeId === 'string') {
      const candidate = item.workTypeId.trim();
      if (validWorkTypeIds.has(candidate)) {
        workTypeId = candidate;
      } else {
        const mappedByName = workTypeIdByName.get(candidate.toLowerCase());
        if (mappedByName) {
          workTypeId = mappedByName;
        }
      }
    }

    const startDate = isValidIsoDate(item.startDate) ? item.startDate.trim() : null;
    const dueDate = isValidIsoDate(item.dueDate) ? item.dueDate.trim() : null;

    const existingTempId =
      typeof item.tempId === 'string' && item.tempId.trim().length > 0
        ? item.tempId.trim()
        : randomUUID();

    sanitized.push({
      tempId: existingTempId,
      selected: typeof item.selected === 'boolean' ? item.selected : true,
      title: title.slice(0, 255),
      description,
      priority,
      storyPoints,
      estimatedHours,
      assigneeId,
      workTypeId,
      sprintId: null,
      startDate,
      dueDate,
    });
  }

  return sanitized;
}

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
          },
          storyPoints: { type: Type.INTEGER, nullable: true },
          estimatedHours: { type: Type.NUMBER, nullable: true },
          assigneeId: { type: Type.STRING, nullable: true },
          workTypeId: { type: Type.STRING, nullable: true },
          startDate: { type: Type.STRING, nullable: true },
          dueDate: { type: Type.STRING, nullable: true },
        },
        required: ['title', 'description', 'priority'],
      },
    },
  },
  required: ['tasks'],
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1500;

function isTransientGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('high demand')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class GeminiAiService implements IAiService {
  private readonly logger = new Logger(GeminiAiService.name);

  constructor(private readonly configService: ConfigService) {}

  private async generateWithRetry(
    ai: GoogleGenAI,
    model: string,
    prompt: string,
  ) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
            temperature: 0.2,
          },
        });
      } catch (err) {
        lastError = err;
        if (!isTransientGeminiError(err) || attempt === MAX_RETRY_ATTEMPTS) {
          break;
        }
        const delayMs = RETRY_BASE_DELAY_MS * attempt;
        this.logger.warn(
          `Gemini model "${model}" tạm thời quá tải (lần ${attempt}/${MAX_RETRY_ATTEMPTS}). Tự động thử lại sau ${delayMs}ms...`,
        );
        await sleep(delayMs);
      }
    }

    if (isTransientGeminiError(lastError)) {
      throw new Error(
        `Hệ thống Google Gemini (${model}) hiện đang quá tải tạm thời (503). Vui lòng bấm "Thử lại" sau vài giây.`,
      );
    }
    throw lastError;
  }

  async extractTasksFromText(input: ExtractTasksInput): Promise<AiSuggestedTaskItem[]> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
    }

    const model =
      this.configService.get<string>('GEMINI_MODEL')?.trim() || 'gemini-3.8-flash';

    const ai = new GoogleGenAI({ apiKey });

    const membersContext =
      input.members.length > 0
        ? input.members
            .map((m) => `- id: "${m.id}" | Tên: ${m.fullName} | Email: ${m.email}${m.role ? ` | Vai trò: ${m.role}` : ''}`)
            .join('\n')
        : '(Chưa có danh sách thành viên — để assigneeId = null)';

    const workTypesContext =
      input.workTypes.length > 0
        ? input.workTypes
            .map((wt) => `- id: "${wt.id}" | Tên: ${wt.name}${wt.isDefault ? ' (Mặc định)' : ''}`)
            .join('\n')
        : '(Chưa có loại công việc — để workTypeId = null)';

    const prompt = [
      'Bạn là chuyên gia Quản trị Dự án phần mềm & Business Analyst chuyên nghiệp.',
      'Hãy đọc kỹ tài liệu dưới đây và trích xuất thành danh sách các công việc (tasks) cụ thể, rõ ràng, có thể thực thi ngay cho dự án.',
      '',
      `Dự án: ${input.projectName}`,
      `Tên tệp tài liệu: ${input.fileName}`,
      `Ngày hiện tại (ISO): ${input.currentDate}`,
      input.hint?.trim() ? `Ghi chú định hướng từ người dùng: ${input.hint.trim()}` : '',
      '',
      'Danh sách thành viên hợp lệ của dự án (CHỈ sử dụng đúng id bên dưới cho assigneeId, nếu không rõ để null):',
      membersContext,
      '',
      'Danh sách Loại công việc (WorkType) hợp lệ (CHỈ sử dụng đúng id bên dưới cho workTypeId):',
      workTypesContext,
      '',
      'Quy tắc bắt buộc:',
      '1. Viết tiêu đề (title) và mô tả (description) bằng tiếng Việt rõ ràng, chuyên nghiệp.',
      '2. priority chỉ nhận một trong: LOW, MEDIUM, HIGH, URGENT.',
      '3. storyPoints dùng thang Fibonacci (1, 2, 3, 5, 8, 13) hoặc null.',
      '4. startDate và dueDate dùng định dạng YYYY-MM-DD tính hợp lý từ ngày hiện tại, hoặc null.',
      '5. Tuyệt đối KHÔNG tự bịa assigneeId hay workTypeId ngoài danh sách trên.',
      '',
      '--- NỘI DUNG TÀI LIỆU ---',
      input.text,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await this.generateWithRetry(ai, model, prompt);

    const rawJsonText = response.text?.trim();
    if (!rawJsonText) {
      throw new Error('Gemini API trả về nội dung rỗng.');
    }

    let parsed: { tasks?: unknown };
    try {
      parsed = JSON.parse(rawJsonText) as { tasks?: unknown };
    } catch (err) {
      this.logger.error('Không thể parse JSON từ Gemini API', err);
      throw new Error('Gemini API trả về dữ liệu JSON không hợp lệ.');
    }

    return sanitizeSuggestedTasks(parsed.tasks ?? parsed, input.members, input.workTypes);
  }
}
