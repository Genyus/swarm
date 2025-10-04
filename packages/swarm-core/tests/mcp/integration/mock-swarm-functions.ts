import { vi } from 'vitest';

export function mockSwarmFunctions() {
  vi.mock('../../../src/mcp/server/tools/swarm.js', () => {
    const mockSwarmToolsInstance = {
      generateApi: vi.fn(),
      generateFeature: vi.fn(),
      generateCrud: vi.fn(),
      generateRoute: vi.fn(),
      generateJob: vi.fn(),
      generateAction: vi.fn(),
      generateQuery: vi.fn(),
      generateApiNamespace: vi.fn(),
    };

    return {
      SwarmTools: {
        create: vi.fn(() => mockSwarmToolsInstance),
      },
    };
  });
}

export async function setupSwarmMocks() {
  const { SwarmTools } = await import('../../../src/mcp/server/tools/swarm.js');

  const mockSwarm = {
    SwarmTools: SwarmTools as any,
    mockSwarmToolsInstance: null as any, // Will be set below
  };
  const mockSwarmToolsInstance = mockSwarm.SwarmTools.create();

  mockSwarm.mockSwarmToolsInstance = mockSwarmToolsInstance;
  setupMockImplementations(mockSwarmToolsInstance);

  return { ...mockSwarm, mockSwarmToolsInstance };
}

export function setSwarmError(
  mockSwarm: any,
  functionName: string,
  errorMessage: string
) {
  const mockFunction = mockSwarm.mockSwarmToolsInstance?.[functionName];

  if (mockFunction) {
    mockFunction.mockRejectedValue(new Error(errorMessage));
  }
}

export function clearSwarmError(mockSwarm: any, functionName: string) {
  const mockFunction = mockSwarm.mockSwarmToolsInstance?.[functionName];

  if (mockFunction) {
    mockFunction.mockReset();
    // Re-setup the mock implementation
    setupMockImplementations(mockSwarm.mockSwarmToolsInstance);
  }
}

export function resetSwarmMocks(mockSwarm: any) {
  if (mockSwarm?.mockSwarmToolsInstance) {
    Object.values(mockSwarm.mockSwarmToolsInstance).forEach((mockFn: any) => {
      if (mockFn && typeof mockFn.mockReset === 'function') {
        mockFn.mockReset();
      }
    });

    // Re-setup the mock implementations
    setupMockImplementations(mockSwarm.mockSwarmToolsInstance);
  }
}

export function setupMockImplementations(mockSwarmToolsInstance: any) {
  mockSwarmToolsInstance.generateApi.mockResolvedValue({
    success: true,
    output:
      'API generated successfully\nGenerated files:\n- src/api/user.ts\n- src/operations/user.ts',
    generatedFiles: ['src/api/user.ts', 'src/operations/user.ts'],
    modifiedFiles: [],
  });
  mockSwarmToolsInstance.generateFeature.mockResolvedValue({
    success: true,
    output:
      'Feature generated successfully\nGenerated files:\n- src/features/User/User.tsx\n- src/features/User/index.tsx',
    generatedFiles: [
      'src/features/User/User.tsx',
      'src/features/User/index.tsx',
    ],
    modifiedFiles: [],
  });
  mockSwarmToolsInstance.generateCrud.mockResolvedValue({
    success: true,
    output:
      'CRUD operations generated successfully\nGenerated files:\n- src/operations/user.ts\n- src/queries/user.ts',
    generatedFiles: ['src/operations/user.ts', 'src/queries/user.ts'],
    modifiedFiles: [],
  });
  mockSwarmToolsInstance.generateRoute.mockResolvedValue({
    success: true,
    output:
      'Route generated successfully\nGenerated files:\n- src/routes/user.tsx',
    generatedFiles: ['src/routes/user.tsx'],
    modifiedFiles: [],
  });
  mockSwarmToolsInstance.generateJob.mockImplementation(
    (params: { name: string }) => {
      const jobName = params.name || 'defaultJob';
      const fileName = jobName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ts';
      return Promise.resolve({
        success: true,
        output: `Job ${jobName} generated successfully\nGenerated files:\n- src/jobs/${fileName}`,
        generatedFiles: [`src/jobs/${fileName}`],
        modifiedFiles: [],
      });
    }
  );
  mockSwarmToolsInstance.generateAction.mockResolvedValue({
    success: true,
    output:
      'Action generated successfully\nGenerated files:\n- src/operations/user.ts',
    generatedFiles: ['src/operations/user.ts'],
    modifiedFiles: [],
  });
  mockSwarmToolsInstance.generateQuery.mockResolvedValue({
    success: true,
    output:
      'Query generated successfully\nGenerated files:\n- src/operations/user.ts',
    generatedFiles: ['src/operations/user.ts'],
    modifiedFiles: [],
  });
  mockSwarmToolsInstance.generateApiNamespace.mockResolvedValue({
    success: true,
    output:
      'API namespace generated successfully\nGenerated files:\n- src/api/v1/index.ts',
    generatedFiles: ['src/api/v1/index.ts'],
    modifiedFiles: [],
  });
}
