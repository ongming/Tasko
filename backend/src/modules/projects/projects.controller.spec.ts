import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RbacPermissionGuard } from '../../common/guards/rbac-permission.guard.js';
import { StatusCategory } from './entities/status.entity.js';
import { CustomFieldType } from './entities/custom-field.entity.js';
import { ProjectMethodology } from './entities/project.entity.js';

describe('ProjectsController - Unit Tests', () => {
  let controller: ProjectsController;
  let service: Partial<ProjectsService>;

  const mockUserId = 'user-uuid-123';
  const mockWorkspaceId = 'ws-uuid-456';
  const mockProjectId = 'proj-uuid-789';

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAllByWorkspace: vi.fn(),
      findById: vi.fn(),
      findStatusesByProject: vi.fn(),
      createStatus: vi.fn(),
      updateStatus: vi.fn(),
      deleteStatus: vi.fn(),
      findWorkTypesByProject: vi.fn(),
      createWorkType: vi.fn(),
      updateWorkType: vi.fn(),
      deleteWorkType: vi.fn(),
      getWorkflows: vi.fn(),
      createWorkflow: vi.fn(),
      updateWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      updateWorkflowTransitions: vi.fn(),
      getCustomFields: vi.fn(),
      createCustomField: vi.fn(),
      updateCustomField: vi.fn(),
      deleteCustomField: vi.fn(),
      updateSettings: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('nên khởi tạo thành công controller', () => {
    expect(controller).toBeDefined();
  });

  it('gọi projectsService.create với đúng userId và DTO', async () => {
    const dto: CreateProjectDto = {
      name: 'Tasko Backend',
      key: 'TSK',
      workspaceId: mockWorkspaceId,
      color: 'bg-indigo-600',
    };
    const mockCreated = {
      id: 'proj-1',
      name: 'Tasko Backend',
      key: 'TSK',
      color: 'bg-indigo-600',
      description: null,
      workspaceId: mockWorkspaceId,
      ownerId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(service.create!).mockResolvedValue(mockCreated);

    const result = await controller.create(mockUserId, dto);
    expect(service.create).toHaveBeenCalledWith(mockUserId, dto);
    expect(result).toEqual(mockCreated);
  });

  it('gọi projectsService.findAllByWorkspace với workspaceId', async () => {
    vi.mocked(service.findAllByWorkspace!).mockResolvedValue([]);

    await controller.findAll(mockUserId, mockWorkspaceId);
    expect(service.findAllByWorkspace).toHaveBeenCalledWith(mockUserId, mockWorkspaceId);
  });

  it('gọi projectsService.findById với id dự án', async () => {
    const mockDetail = {
      id: 'p-123',
      name: 'Proj',
      key: 'P',
      color: 'bg-blue-500',
      description: null,
      workspaceId: mockWorkspaceId,
      ownerId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(service.findById!).mockResolvedValue(mockDetail);

    const result = await controller.findOne(mockUserId, 'p-123');
    expect(service.findById).toHaveBeenCalledWith(mockUserId, 'p-123');
    expect(result).toEqual(mockDetail);
  });

  it('gọi createStatus và deleteStatus với đúng tham số', async () => {
    vi.mocked(service.createStatus!).mockResolvedValue({ id: 'st-1', name: 'In Review' } as any);
    vi.mocked(service.deleteStatus!).mockResolvedValue({ success: true, message: 'OK' });

    await controller.createStatus(mockProjectId, {
      name: 'In Review',
      category: StatusCategory.IN_PROGRESS,
      wipLimit: 3,
    });
    expect(service.createStatus).toHaveBeenCalledWith(mockProjectId, {
      name: 'In Review',
      category: StatusCategory.IN_PROGRESS,
      wipLimit: 3,
    });

    await controller.deleteStatus(mockProjectId, 'st-1', { fallbackStatusId: 'st-2' });
    expect(service.deleteStatus).toHaveBeenCalledWith(mockProjectId, 'st-1', {
      fallbackStatusId: 'st-2',
    });
  });

  it('gọi createWorkType và deleteWorkType với đúng tham số', async () => {
    vi.mocked(service.createWorkType!).mockResolvedValue({ id: 'wt-1', name: 'Subtask' } as any);
    vi.mocked(service.deleteWorkType!).mockResolvedValue({ success: true, message: 'OK' });

    await controller.createWorkType(mockProjectId, { name: 'Subtask', isSubtask: true });
    expect(service.createWorkType).toHaveBeenCalledWith(mockProjectId, {
      name: 'Subtask',
      isSubtask: true,
    });

    await controller.deleteWorkType(mockProjectId, 'wt-1', { fallbackWorkTypeId: 'wt-2' });
    expect(service.deleteWorkType).toHaveBeenCalledWith(mockProjectId, 'wt-1', {
      fallbackWorkTypeId: 'wt-2',
    });
  });

  it('gọi getWorkflows, createWorkflow và updateWorkflowTransitions', async () => {
    vi.mocked(service.getWorkflows!).mockResolvedValue([]);
    vi.mocked(service.createWorkflow!).mockResolvedValue({ id: 'wf-1', name: 'Dev Flow' } as any);
    vi.mocked(service.updateWorkflowTransitions!).mockResolvedValue([]);

    await controller.getWorkflows(mockProjectId);
    expect(service.getWorkflows).toHaveBeenCalledWith(mockProjectId);

    await controller.createWorkflow(mockProjectId, { name: 'Dev Flow' });
    expect(service.createWorkflow).toHaveBeenCalledWith(mockProjectId, { name: 'Dev Flow' });

    await controller.updateWorkflowTransitions(mockProjectId, 'wf-1', {
      transitions: [{ fromStatusId: 'st-1', toStatusId: 'st-2' }],
    });
    expect(service.updateWorkflowTransitions).toHaveBeenCalledWith(mockProjectId, 'wf-1', {
      transitions: [{ fromStatusId: 'st-1', toStatusId: 'st-2' }],
    });
  });

  it('gọi getCustomFields, createCustomField và deleteCustomField', async () => {
    vi.mocked(service.getCustomFields!).mockResolvedValue([]);
    vi.mocked(service.createCustomField!).mockResolvedValue({ id: 'cf-1' } as any);
    vi.mocked(service.deleteCustomField!).mockResolvedValue({ success: true, message: 'OK' });

    await controller.getCustomFields(mockProjectId);
    expect(service.getCustomFields).toHaveBeenCalledWith(mockProjectId);

    await controller.createCustomField(mockProjectId, {
      name: 'Severity',
      fieldType: CustomFieldType.SELECT,
      options: ['High', 'Low'],
    });
    expect(service.createCustomField).toHaveBeenCalledWith(mockProjectId, {
      name: 'Severity',
      fieldType: CustomFieldType.SELECT,
      options: ['High', 'Low'],
    });

    await controller.deleteCustomField(mockProjectId, 'cf-1');
    expect(service.deleteCustomField).toHaveBeenCalledWith(mockProjectId, 'cf-1');
  });

  it('gọi updateSettings cho phép chuyển đổi methodology', async () => {
    vi.mocked(service.updateSettings!).mockResolvedValue({ id: mockProjectId } as any);

    await controller.updateSettings(mockUserId, mockProjectId, {
      methodology: ProjectMethodology.SCRUM,
    });
    expect(service.updateSettings).toHaveBeenCalledWith(mockUserId, mockProjectId, {
      methodology: ProjectMethodology.SCRUM,
    });
  });
});
