import { spawn } from 'node:child_process';
import { vi } from 'vitest';

export interface MockSwarmResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class MockSwarmCLI {
  private responses: Map<string, MockSwarmResponse> = new Map();
  private commandLog: Array<{ command: string; args: string[]; cwd: string }> =
    [];

  constructor() {
    this.setupDefaultResponses();
  }

  private setupDefaultResponses() {
    this.setResponse('swarm generate api', {
      stdout:
        'API generated successfully\nGenerated files:\n- src/api/user.ts\n- src/operations/user.ts',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm generate feature', {
      stdout:
        'Feature generated successfully\nGenerated files:\n- src/features/User/User.tsx\n- src/features/User/index.tsx',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm generate crud', {
      stdout:
        'CRUD operations generated successfully\nGenerated files:\n- src/operations/user.ts\n- src/queries/user.ts',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm generate job', {
      stdout:
        'Job generated successfully\nGenerated files:\n- src/jobs/cleanup.ts',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm generate operation', {
      stdout:
        'Operation generated successfully\nGenerated files:\n- src/operations/user.ts',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm generate route', {
      stdout:
        'Route generated successfully\nGenerated files:\n- src/routes/user.tsx',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm generate api-namespace', {
      stdout:
        'API namespace generated successfully\nGenerated files:\n- src/api/v1/index.ts',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm analyze', {
      stdout:
        'Project analysis completed\nProject type: wasp\nWasp version: 0.11.4\nFeatures: 2\nEntities: 3\nAPIs: 1',
      stderr: '',
      exitCode: 0,
    });

    this.setResponse('swarm validate', {
      stdout:
        'Configuration validation passed\nAll checks completed successfully',
      stderr: '',
      exitCode: 0,
    });
  }

  setResponse(command: string, response: MockSwarmResponse): void {
    this.responses.set(command, response);
  }

  setErrorResponse(command: string, error: string): void {
    this.responses.set(command, {
      stdout: '',
      stderr: error,
      exitCode: 1,
    });
  }

  getCommandLog(): Array<{ command: string; args: string[]; cwd: string }> {
    return [...this.commandLog];
  }

  clearCommandLog(): void {
    this.commandLog = [];
  }

  mockSpawn(): void {
    vi.mock('node:child_process', () => ({
      spawn: vi.fn((command: string, args: string[], options: any) => {
        const fullCommand = `${command} ${args.join(' ')}`;
        const cwd = options?.cwd || process.cwd();

        this.commandLog.push({ command, args, cwd });

        const response = this.findResponse(fullCommand);

        const mockProcess = {
          stdout: {
            on: vi.fn((event: string, callback: (data: Buffer) => void) => {
              if (event === 'data' && response.stdout) {
                callback(Buffer.from(response.stdout));
              }
            }),
          },
          stderr: {
            on: vi.fn((event: string, callback: (data: Buffer) => void) => {
              if (event === 'data' && response.stderr) {
                callback(Buffer.from(response.stderr));
              }
            }),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === 'close') {
              callback(response.exitCode);
            }
          }),
        };

        return mockProcess;
      }),
    }));
  }

  private findResponse(command: string): MockSwarmResponse {
    for (const [key, response] of this.responses.entries()) {
      if (command.includes(key)) {
        return response;
      }
    }

    return {
      stdout: 'Command executed successfully',
      stderr: '',
      exitCode: 0,
    };
  }

  restore(): void {
    vi.restoreAllMocks();
  }
}
