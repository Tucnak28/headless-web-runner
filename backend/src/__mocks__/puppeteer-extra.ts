// Mock puppeteer-extra for testing
const mockPage = {
  goto: jest.fn().mockResolvedValue(undefined),
  setUserAgent: jest.fn().mockResolvedValue(undefined),
  setViewport: jest.fn().mockResolvedValue(undefined),
  evaluate: jest.fn().mockResolvedValue(undefined),
  evaluateOnNewDocument: jest.fn().mockResolvedValue(undefined),
  createCDPSession: jest.fn().mockResolvedValue({
    send: jest.fn().mockResolvedValue({ windowId: 123 }),
    on: jest.fn(),
    removeAllListeners: jest.fn()
  }),
  click: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  isClosed: jest.fn().mockReturnValue(false),
  $: jest.fn().mockResolvedValue(null),
  $$: jest.fn().mockResolvedValue([]),
  waitForSelector: jest.fn().mockResolvedValue({
    click: jest.fn().mockResolvedValue(undefined)
  }),
  keyboard: {
    press: jest.fn().mockResolvedValue(undefined)
  },
  browser: jest.fn().mockReturnValue({
    userAgent: jest.fn().mockResolvedValue('MockUserAgent')
  }),
  emulateMediaFeatures: jest.fn().mockResolvedValue(undefined)
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
  process: jest.fn().mockReturnValue({ kill: jest.fn() })
};

const mockPuppeteer = {
  launch: jest.fn().mockResolvedValue(mockBrowser),
  use: jest.fn()
};

export default mockPuppeteer;
export { mockPage, mockBrowser };