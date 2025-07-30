// Jest test setup file
import fs from 'fs';
import path from 'path';

// Mock fs operations to prevent actual file writes during tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: jest.fn(),
  appendFile: jest.fn((filePath: string, data: string, callback: (err: Error | null) => void) => {
    callback(null);
  }),
}));

// Mock path operations
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...paths: string[]) => paths.join('/')),
  dirname: jest.fn((filePath: string) => filePath.split('/').slice(0, -1).join('/'))
}));

// Increase timeout for tests that might need more time
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});