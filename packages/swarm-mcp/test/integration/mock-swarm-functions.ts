import { vi } from 'vitest';
import {
  swarmGenerateApi,
  swarmGenerateApiNamespace,
  swarmGenerateCrud,
  swarmGenerateFeature,
  swarmGenerateJob,
  swarmGenerateOperation,
  swarmGenerateRoute,
} from '../../src/server/tools/swarm.js';

export function mockSwarmFunctions() {
  vi.mock('../../src/server/tools/swarm.js', () => ({
    swarmGenerateAPI: vi.fn(),
    swarmGenerateFeature: vi.fn(),
    swarmGenerateCRUD: vi.fn(),
    swarmGenerateJob: vi.fn(),
    swarmGenerateOperation: vi.fn(),
    swarmGenerateRoute: vi.fn(),
    swarmGenerateApiNamespace: vi.fn(),
  }));
}

export function setupSwarmMocks() {
  const mockSwarm = vi.mocked({
    swarmGenerateAPI: swarmGenerateApi,
    swarmGenerateFeature,
    swarmGenerateCRUD: swarmGenerateCrud,
    swarmGenerateJob,
    swarmGenerateOperation,
    swarmGenerateRoute,
    swarmGenerateApiNamespace,
  });

  // Setup default successful responses
  mockSwarm.swarmGenerateAPI.mockResolvedValue({
    success: true,
    output:
      'API generated successfully\nGenerated files:\n- src/api/user.ts\n- src/operations/user.ts',
    generatedFiles: ['src/api/user.ts', 'src/operations/user.ts'],
    modifiedFiles: [],
  });

  mockSwarm.swarmGenerateFeature.mockResolvedValue({
    success: true,
    output:
      'Feature generated successfully\nGenerated files:\n- src/features/User/User.tsx\n- src/features/User/index.tsx',
    generatedFiles: [
      'src/features/User/User.tsx',
      'src/features/User/index.tsx',
    ],
    modifiedFiles: [],
  });

  mockSwarm.swarmGenerateCRUD.mockResolvedValue({
    success: true,
    output:
      'CRUD operations generated successfully\nGenerated files:\n- src/operations/user.ts\n- src/queries/user.ts',
    generatedFiles: ['src/operations/user.ts', 'src/queries/user.ts'],
    modifiedFiles: [],
  });

  // Use dynamic output based on parameters
  mockSwarm.swarmGenerateJob.mockImplementation((params: any) => {
    const jobName = params?.name || 'cleanup';
    return Promise.resolve({
      success: true,
      output: `${jobName} job generated successfully\nGenerated files:\n- src/jobs/${jobName.toLowerCase()}.ts`,
      generatedFiles: [`src/jobs/${jobName.toLowerCase()}.ts`],
      modifiedFiles: [],
    });
  });

  mockSwarm.swarmGenerateOperation.mockImplementation((params: any) => {
    const operation = params?.operation || 'get';
    const dataType = params?.dataType || 'User';
    return Promise.resolve({
      success: true,
      output: `${operation} operation for ${dataType} generated successfully\nGenerated files:\n- src/operations/${dataType.toLowerCase()}.ts`,
      generatedFiles: [`src/operations/${dataType.toLowerCase()}.ts`],
      modifiedFiles: [],
    });
  });

  mockSwarm.swarmGenerateRoute.mockImplementation((params: any) => {
    const routeName = params?.name || 'User';
    return Promise.resolve({
      success: true,
      output: `${routeName} route generated successfully\nGenerated files:\n- src/routes/${routeName.toLowerCase()}.tsx`,
      generatedFiles: [`src/routes/${routeName.toLowerCase()}.tsx`],
      modifiedFiles: [],
    });
  });

  mockSwarm.swarmGenerateApiNamespace.mockResolvedValue({
    success: true,
    output:
      'API namespace generated successfully\nGenerated files:\n- src/api/v1/index.ts',
    generatedFiles: ['src/api/v1/index.ts'],
    modifiedFiles: [],
  });

  return mockSwarm;
}

export function setSwarmError(
  mockSwarm: any,
  functionName: string,
  errorMessage: string
) {
  const mockFunction = mockSwarm[functionName];
  if (mockFunction) {
    mockFunction.mockRejectedValue(new Error(errorMessage));
  }
}

export function resetSwarmMocks(mockSwarm: any) {
  Object.values(mockSwarm).forEach((mockFn: any) => {
    if (mockFn && typeof mockFn.mockReset === 'function') {
      mockFn.mockReset();
    }
  });
}
