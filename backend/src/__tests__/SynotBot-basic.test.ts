import { SynotBot } from '../bots/SynotBot';

// Mock external dependencies to prevent actual browser launches
jest.mock('puppeteer-extra');
jest.mock('puppeteer-extra-plugin-stealth');
jest.mock('ghost-cursor');

describe('SynotBot - Basic Functionality', () => {
  let bot: SynotBot;
  const botId = 'test-bot-1';

  beforeEach(() => {
    bot = new SynotBot(botId);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create bot with correct ID', () => {
      expect(bot.id).toBe(botId);
    });
  });

  describe('getInfo', () => {
    it('should return bot information with default values', () => {
      const info = bot.getInfo();
      
      expect(info).toEqual({
        id: botId,
        username: '',
        delay: 0,
        platform: ''
      });
    });

    it('should return updated bot information after configuration', async () => {
      await bot.setLoginInfo('testuser', 'testpass');
      await bot.setDelay(10);
      await bot.setPlatform('Synottip');
      
      const info = bot.getInfo();
      
      expect(info).toEqual({
        id: botId,
        username: 'testuser',
        delay: 10,
        platform: 'Synottip'
      });
    });
  });

  describe('configuration methods', () => {
    it('should set login info and add log entry', async () => {
      await bot.setLoginInfo('testuser', 'testpass');
      
      const info = bot.getInfo();
      expect(info.username).toBe('testuser');
      
      const logs = bot.getLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('🪪 Login info set for bot "test-bot-1"');
    });

    it('should set delay and add log entry', async () => {
      await bot.setDelay(15);
      
      const info = bot.getInfo();
      expect(info.delay).toBe(15);
      
      const logs = bot.getLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('⏱️ Delay set to 15s for bot "test-bot-1"');
    });

    it('should set platform and add log entry', async () => {
      await bot.setPlatform('Gapa');
      
      const info = bot.getInfo();
      expect(info.platform).toBe('Gapa');
      
      const logs = bot.getLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('🪙 Platform set to Gapa for bot "test-bot-1"');
    });
  });

  describe('logging functionality', () => {
    it('should add log entry with timestamp', () => {
      const testMessage = 'Test log message';
      bot.addLog(testMessage);
      
      const logs = bot.getLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain(testMessage);
      expect(logs[0]).toMatch(/^\[\d{2}\.\d{2} \d{2}:\d{2}\]/); // Timestamp format
    });

    it('should return empty array initially', () => {
      const logs = bot.getLog();
      expect(logs).toEqual([]);
    });

    it('should limit log entries to 150', () => {
      // Add 160 log entries
      for (let i = 0; i < 160; i++) {
        bot.addLog(`Log message ${i}`);
      }
      
      const logs = bot.getLog();
      expect(logs).toHaveLength(150);
      expect(logs[0]).toContain('Log message 10'); // First 10 should be removed
      expect(logs[149]).toContain('Log message 159'); // Last entry should be 159
    });
  });

  describe('toggleSpin', () => {
    it('should toggle spin state and add appropriate log entries', () => {
      // Initially false, toggle to true
      bot.toggleSpin();
      
      let logs = bot.getLog();
      expect(logs.some(log => log.includes('🔁 Auto-spin started'))).toBe(true);
      
      // Toggle back to false
      bot.toggleSpin();
      
      logs = bot.getLog();
      expect(logs.some(log => log.includes('🛑 Auto-spin stopped'))).toBe(true);
    });
  });
});