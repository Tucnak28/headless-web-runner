import { BotManager } from '../bots/BotManager';
import { SynotBot } from '../bots/SynotBot';

// Mock SynotBot
jest.mock('../bots/SynotBot');

describe('BotManager', () => {
  let botManager: BotManager;
  let mockBot: jest.Mocked<SynotBot>;

  beforeEach(() => {
    botManager = new BotManager();
    
    // Create mock bot instance
    mockBot = {
      id: 'bot1',
      launch: jest.fn().mockResolvedValue(undefined),
      kill: jest.fn().mockResolvedValue(undefined),
      getInfo: jest.fn().mockReturnValue({
        id: 'bot1',
        username: 'testuser',
        delay: 5,
        platform: 'Synottip'
      })
    } as any;

    // Mock SynotBot constructor
    (SynotBot as jest.MockedClass<typeof SynotBot>).mockImplementation(() => mockBot);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBot', () => {
    it('should create a new bot with incremented ID', async () => {
      const bot = await botManager.createBot();

      expect(SynotBot).toHaveBeenCalledWith('bot1');
      expect(mockBot.launch).toHaveBeenCalled();
      expect(bot).toBe(mockBot);
    });

    it('should create multiple bots with different IDs', async () => {
      const bot1 = await botManager.createBot();
      
      // Reset mock for second bot
      const mockBot2 = { ...mockBot, id: 'bot2' };
      (SynotBot as jest.MockedClass<typeof SynotBot>).mockImplementation(() => mockBot2 as any);
      
      const bot2 = await botManager.createBot();

      expect(SynotBot).toHaveBeenNthCalledWith(1, 'bot1');
      expect(SynotBot).toHaveBeenNthCalledWith(2, 'bot2');
      expect(bot1).toBe(mockBot);
      expect(bot2).toBe(mockBot2);
    });

    it('should handle bot launch failure', async () => {
      mockBot.launch.mockRejectedValue(new Error('Launch failed'));

      await expect(botManager.createBot()).rejects.toThrow('Launch failed');
    });
  });

  describe('getBot', () => {
    it('should return bot by ID', async () => {
      await botManager.createBot();
      
      const retrievedBot = botManager.getBot('bot1');
      
      expect(retrievedBot).toBe(mockBot);
    });

    it('should return undefined for non-existent bot', () => {
      const retrievedBot = botManager.getBot('nonexistent');
      
      expect(retrievedBot).toBeUndefined();
    });
  });

  describe('removeBot', () => {
    it('should remove and kill existing bot', async () => {
      await botManager.createBot();
      
      await botManager.removeBot('bot1');
      
      expect(mockBot.kill).toHaveBeenCalled();
      expect(botManager.getBot('bot1')).toBeUndefined();
    });

    it('should handle removal of non-existent bot gracefully', async () => {
      await expect(botManager.removeBot('nonexistent')).resolves.not.toThrow();
    });

    it('should handle bot kill failure', async () => {
      await botManager.createBot();
      mockBot.kill.mockRejectedValue(new Error('Kill failed'));
      
      // Should throw when kill fails
      await expect(botManager.removeBot('bot1')).rejects.toThrow('Kill failed');
    });
  });

  describe('getAllBots', () => {
    it('should return empty array when no bots exist', () => {
      const bots = botManager.getAllBots();
      
      expect(bots).toEqual([]);
    });

    it('should return all created bots', async () => {
      await botManager.createBot();
      
      const mockBot2 = { ...mockBot, id: 'bot2' };
      (SynotBot as jest.MockedClass<typeof SynotBot>).mockImplementation(() => mockBot2 as any);
      await botManager.createBot();
      
      const bots = botManager.getAllBots();
      
      expect(bots).toHaveLength(2);
      expect(bots).toContain(mockBot);
      expect(bots).toContain(mockBot2);
    });
  });

  describe('getAllBotInfo', () => {
    it('should return empty array when no bots exist', () => {
      const botInfos = botManager.getAllBotInfo();
      
      expect(botInfos).toEqual([]);
    });

    it('should return info for all bots', async () => {
      await botManager.createBot();
      
      const botInfos = botManager.getAllBotInfo();
      
      expect(botInfos).toHaveLength(1);
      expect(botInfos[0]).toEqual({
        id: 'bot1',
        username: 'testuser',
        delay: 5,
        platform: 'Synottip'
      });
      expect(mockBot.getInfo).toHaveBeenCalled();
    });
  });
});