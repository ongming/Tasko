import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { AiDocumentController } from './ai-document.controller.js';
import type { AiDocumentService, AnalysisDetailResponse } from './ai-document.service.js';
import { AiAnalysisStatus, AiDocumentFileType } from './entities/ai-analysis.entity.js';

describe('AiDocumentController', () => {
  let controller: AiDocumentController;
  let getAnalysisDetailMock: ReturnType<typeof vi.fn>;
  let getHistoryMock: ReturnType<typeof vi.fn>;
  let analyzeDocumentMock: ReturnType<typeof vi.fn>;
  let uploadDocumentMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getAnalysisDetailMock = vi.fn();
    getHistoryMock = vi.fn();
    analyzeDocumentMock = vi.fn();
    uploadDocumentMock = vi.fn();

    const serviceMock = {
      uploadDocument: uploadDocumentMock,
      analyzeDocument: analyzeDocumentMock,
      getAnalysisDetail: getAnalysisDetailMock,
      getHistory: getHistoryMock,
    } as unknown as AiDocumentService;

    controller = new AiDocumentController(serviceMock);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  it('getAnalysisDetail trả về chi tiết bản phân tích khi hợp lệ', async () => {
    const mockDetail: AnalysisDetailResponse = {
      id: 'analysis-1',
      fileName: 'BRD_ShopX.pdf',
      fileType: AiDocumentFileType.PDF,
      fileSize: 120_000,
      status: AiAnalysisStatus.COMPLETED,
      suggestedTaskCount: 1,
      appliedTaskCount: 0,
      errorMessage: null,
      extractedTextPreview: 'Nội dung xem trước...',
      suggestedTasks: [
        {
          tempId: 'tmp-1',
          selected: true,
          title: 'Xây dựng API giỏ hàng',
          description: 'Tính tổng tiền và áp dụng voucher.',
          priority: 'HIGH',
          storyPoints: 5,
          estimatedHours: 14,
          assigneeId: null,
          workTypeId: 'wt-1',
          sprintId: null,
          startDate: '2026-11-24',
          dueDate: '2026-11-29',
        },
      ],
      createdBy: {
        id: 'user-1',
        fullName: 'Nguyễn Đình Quang Minh',
        email: 'pm@tasko.vn',
        avatarUrl: null,
      },
      createdAt: new Date('2026-11-24T00:00:00.000Z'),
      updatedAt: new Date('2026-11-24T01:00:00.000Z'),
    };
    getAnalysisDetailMock.mockResolvedValue(mockDetail);

    const result = await controller.getAnalysisDetail('SHOPX', 'analysis-1');

    expect(getAnalysisDetailMock).toHaveBeenCalledWith('SHOPX', 'analysis-1');
    expect(result).toEqual(mockDetail);
  });

  it('getAnalysisDetail ném NotFoundException (404) khi sai analysisId hoặc projectId', async () => {
    getAnalysisDetailMock.mockRejectedValue(
      new NotFoundException('Không tìm thấy phiên phân tích tài liệu trong dự án này!'),
    );

    await expect(controller.getAnalysisDetail('SHOPX', 'invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getHistory chuyển tiếp query params xuống service và trả về danh sách phân trang', async () => {
    const mockHistory = {
      items: [],
      pagination: { total: 0, page: 1, limit: 20 },
    };
    getHistoryMock.mockResolvedValue(mockHistory);

    const result = await controller.getHistory('SHOPX', {
      status: AiAnalysisStatus.APPLIED,
      page: 1,
      limit: 20,
    });

    expect(getHistoryMock).toHaveBeenCalledWith('SHOPX', {
      status: AiAnalysisStatus.APPLIED,
      page: 1,
      limit: 20,
    });
    expect(result).toEqual(mockHistory);
  });
});
