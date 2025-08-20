import { 
  wait, 
  pickRandomGame, 
  findSpinButtonSelector,
  deepQuerySelector
} from '../lib/gameActions';
import { SynotBot } from '../bots/SynotBot';

// Mock dependencies
jest.mock('../bots/SynotBot');

// Helper function to create mock bot info
const createMockBotInfo = (platform: string) => ({
  id: 'bot1',
  username: 'test',
  delay: 5,
  platform,
  startTime: new Date().toISOString(),
  endTime: null,
  isAlive: true,
  scheduledStart: null,
  scheduledEnd: null,
  isSpinning: false,
  totalSpinTime: 0,
});

describe('gameActions', () => {
  describe('wait', () => {
    it('should wait for specified milliseconds', async () => {
      const startTime = Date.now();
      const waitTime = 100;
      
      await wait(waitTime);
      
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Allow some tolerance for timing variations
      expect(elapsed).toBeGreaterThanOrEqual(waitTime - 10);
      expect(elapsed).toBeLessThan(waitTime + 50);
    });

    it('should resolve with undefined', async () => {
      const result = await wait(50);
      expect(result).toBeUndefined();
    });
  });

  describe('pickRandomGame', () => {
    let mockBot: jest.Mocked<SynotBot>;

    beforeEach(() => {
      mockBot = {
        getInfo: jest.fn()
      } as any;
    });

    it('should return a Synottip game URL for Synottip platform', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo('Synottip'));

      const gameUrl = pickRandomGame(mockBot);
      
      expect(gameUrl).toContain('casino.synottip.cz');
      expect(gameUrl).toMatch(/^https:\/\/casino\.synottip\.cz\/game\/run\/[a-f0-9-]+$/);
    });

    it('should return a Gapa game URL for Gapa platform', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo('Gapa'));

      const gameUrl = pickRandomGame(mockBot);
      
      expect(gameUrl).toContain('herna.gapagroup.cz');
      expect(gameUrl).toMatch(/^https:\/\/herna\.gapagroup\.cz\/game\/run\/[a-f0-9-]+$/);
    });

    it('should return a Fbet game URL for Fbet platform', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo('Fbet'));

      const gameUrl = pickRandomGame(mockBot);
      
      expect(gameUrl).toContain('www.fbet.cz');
      expect(gameUrl).toMatch(/^https:\/\/www\.fbet\.cz\/vegas\/game\/\w+\/real$/);
    });

    it('should return a Forbes game URL for Forbes platform', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo('Forbes'));

      const gameUrl = pickRandomGame(mockBot);
      
      expect(gameUrl).toContain('www.forbescasino.cz');
      expect(gameUrl).toBe('https://www.forbescasino.cz/game/1384/online/amazons_wonders');
    });

    it('should throw error for unknown platform', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo('UnknownPlatform'));

      expect(() => pickRandomGame(mockBot)).toThrow('No games found for platform "UnknownPlatform"');
    });

    it('should throw error for empty platform', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo(''));

      expect(() => pickRandomGame(mockBot)).toThrow('No games found for platform ""');
    });

    it('should return different URLs on multiple calls (randomness)', () => {
      mockBot.getInfo.mockReturnValue(createMockBotInfo('Synottip'));

      const urls = new Set();
      // Call multiple times to test randomness
      for (let i = 0; i < 20; i++) {
        urls.add(pickRandomGame(mockBot));
      }

      // Should have gotten at least 2 different URLs (very likely with 20 calls)
      expect(urls.size).toBeGreaterThan(1);
    });
  });

  describe('findSpinButtonSelector', () => {
    let mockFrame: any;

    beforeEach(() => {
      mockFrame = {
        $: jest.fn()
      };
    });

    it('should return first matching selector', async () => {
      mockFrame.$.mockImplementation((selector: string) => {
        if (selector === 'div > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn') {
          return Promise.resolve({ click: jest.fn() }); // Mock element
        }
        return Promise.resolve(null);
      });

      const selector = await findSpinButtonSelector(mockFrame);
      
      expect(selector).toBe('div > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn');
    });

    it('should return second selector if first fails', async () => {
      mockFrame.$.mockImplementation((selector: string) => {
        if (selector === 'div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.icon') {
          return Promise.resolve({ click: jest.fn() }); // Mock element
        }
        return Promise.resolve(null);
      });

      const selector = await findSpinButtonSelector(mockFrame);
      
      expect(selector).toBe('div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.icon');
    });

    it('should return third selector if first two fail', async () => {
      mockFrame.$.mockImplementation((selector: string) => {
        if (selector === 'div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.content > div.icon') {
          return Promise.resolve({ click: jest.fn() }); // Mock element
        }
        return Promise.resolve(null);
      });

      const selector = await findSpinButtonSelector(mockFrame);
      
      expect(selector).toBe('div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.content > div.icon');
    });

    it('should throw error if no selectors match', async () => {
      mockFrame.$.mockResolvedValue(null); // No element found for any selector

      await expect(findSpinButtonSelector(mockFrame)).rejects.toThrow('⚠️ No known spin button selector matched.');
    });
  });

  describe('deepQuerySelector', () => {
    let mockPage: any;

    beforeEach(() => {
      mockPage = {
        evaluate: jest.fn()
      };
    });

    it('should return text content from nested selectors', async () => {
      mockPage.evaluate.mockResolvedValue('Found text content');

      const result = await deepQuerySelector(mockPage, ['div.parent', 'span.child']);
      
      expect(result).toBe('Found text content');
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        ['div.parent', 'span.child']
      );
    });

    it('should return null if selector chain fails', async () => {
      mockPage.evaluate.mockResolvedValue(null);

      const result = await deepQuerySelector(mockPage, ['div.nonexistent', 'span.child']);
      
      expect(result).toBeNull();
    });

    it('should handle empty selector array', async () => {
      mockPage.evaluate.mockResolvedValue('document content');

      const result = await deepQuerySelector(mockPage, []);
      
      expect(result).toBe('document content');
    });

    it('should handle single selector', async () => {
      mockPage.evaluate.mockResolvedValue('single element text');

      const result = await deepQuerySelector(mockPage, ['div.single']);
      
      expect(result).toBe('single element text');
    });
  });
});