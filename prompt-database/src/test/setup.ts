import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Mock IndexedDB
const mockIDBRequest = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onerror: null,
  onsuccess: null,
  readyState: 'done',
  result: undefined,
  source: null,
  transaction: null,
});

const mockIDBDatabase = () => ({
  close: vi.fn(),
  createObjectStore: vi.fn(),
  deleteObjectStore: vi.fn(),
  transaction: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onerror: null,
  onversionchange: null,
  name: 'PromptDatabase',
  objectStoreNames: [],
  version: 1,
});

const mockIDBTransaction = () => ({
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  objectStore: vi.fn(),
  onerror: null,
  oncomplete: null,
  onabort: null,
  db: mockIDBDatabase(),
  mode: 'readonly',
  objectStoreNames: [],
});

const mockIDBObjectStore = () => ({
  add: vi.fn().mockReturnValue(mockIDBRequest()),
  put: vi.fn().mockReturnValue(mockIDBRequest()),
  get: vi.fn().mockReturnValue(mockIDBRequest()),
  delete: vi.fn().mockReturnValue(mockIDBRequest()),
  clear: vi.fn().mockReturnValue(mockIDBRequest()),
  count: vi.fn().mockReturnValue(mockIDBRequest()),
  getAll: vi.fn().mockReturnValue(mockIDBRequest()),
  getAllKeys: vi.fn().mockReturnValue(mockIDBRequest()),
  getKey: vi.fn().mockReturnValue(mockIDBRequest()),
  openCursor: vi.fn().mockReturnValue(mockIDBRequest()),
  openKeyCursor: vi.fn().mockReturnValue(mockIDBRequest()),
  createIndex: vi.fn(),
  deleteIndex: vi.fn(),
  index: vi.fn(),
  transaction: mockIDBTransaction(),
  autoIncrement: false,
  indexNames: [],
  keyPath: null,
  name: 'prompts',
});

// Mock IDBFactory
const mockIDBFactory = () => ({
  open: vi.fn().mockImplementation(() => {
    const request = mockIDBRequest();
    setTimeout(() => {
      request.result = mockIDBDatabase();
      if (request.onsuccess) {
        request.onsuccess({ target: request } as any);
      }
    }, 0);
    return request;
  }),
  deleteDatabase: vi.fn().mockReturnValue(mockIDBRequest()),
  databases: vi.fn().mockResolvedValue([]),
  cmp: vi.fn(),
});

// Setup global mocks
Object.defineProperty(window, 'indexedDB', {
  value: mockIDBFactory(),
  writable: true,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});