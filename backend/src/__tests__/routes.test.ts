import request from 'supertest';
import express from 'express';
import routes from '../server/routes';
import { SynotBot } from '../bots/SynotBot';

// Mock dependencies
jest.mock('../server/BotManagerInstace');
jest.mock('../server/Server');
jest.mock('../bots/SynotBot');

const mockBotManager = require('../server/BotManagerInstace').botManager;
const mockBroadcastToClients = require('../server/Server').broadcastToClients;

describe('API Routes', () => {
  let app: express.Application;
  let mockBot: jest.Mocked<SynotBot>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', routes);

    // Reset mocks
    jest.clearAllMocks();

    // Create mock bot
    mockBot = {
      id: 'bot1',
      toggleSpin: jest.fn(),
      getLog: jest.fn().mockReturnValue(['Log entry 1', 'Log entry 2']),
      setLoginInfo: jest.fn().mockResolvedValue(undefined),
      setDelay: jest.fn().mockResolvedValue(undefined),
      setPlatform: jest.fn().mockResolvedValue(undefined),
      kill: jest.fn().mockResolvedValue(undefined)
    } as any;

    // Setup default mock implementations
    mockBotManager.createBot = jest.fn().mockResolvedValue(mockBot);
    mockBotManager.getBot = jest.fn().mockReturnValue(mockBot);
    mockBotManager.getAllBotInfo = jest.fn().mockReturnValue([
      { id: 'bot1', username: 'test', delay: 5, platform: 'Synottip' }
    ]);
    mockBotManager.removeBot = jest.fn().mockResolvedValue(undefined);
    
    mockBroadcastToClients.mockImplementation(() => {});
  });

  describe('POST /api/startNewBot', () => {
    it('should create and return new bot successfully', async () => {
      const response = await request(app)
        .post('/api/startNewBot')
        .expect(201);

      expect(response.text).toBe('✅ Bot "bot1" started');
      expect(mockBotManager.createBot).toHaveBeenCalled();
      expect(mockBroadcastToClients).toHaveBeenCalledWith({
        type: 'botList',
        bots: [{ id: 'bot1', username: 'test', delay: 5, platform: 'Synottip' }]
      });
    });

    it('should handle bot creation failure', async () => {
      mockBotManager.createBot.mockRejectedValue(new Error('Creation failed'));

      const response = await request(app)
        .post('/api/startNewBot')
        .expect(500);

      expect(response.text).toBe('❌ Failed to start bot: Creation failed');
    });
  });

  describe('POST /api/toggle_spin/:id', () => {
    it('should toggle spin for existing bot', async () => {
      const response = await request(app)
        .post('/api/toggle_spin/bot1')
        .expect(200);

      expect(response.text).toBe('🔁 Spin toggled for bot "bot1"');
      expect(mockBotManager.getBot).toHaveBeenCalledWith('bot1');
      expect(mockBot.toggleSpin).toHaveBeenCalled();
    });

    it('should return 404 for non-existent bot', async () => {
      mockBotManager.getBot.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/toggle_spin/nonexistent')
        .expect(404);

      expect(response.text).toBe('❌ Bot "nonexistent" not found');
    });
  });

  describe('POST /api/retrieve_log/:id', () => {
    it('should return log for existing bot', async () => {
      const response = await request(app)
        .post('/api/retrieve_log/bot1')
        .expect(200);

      expect(response.body).toEqual({
        log: ['Log entry 1', 'Log entry 2']
      });
      expect(mockBotManager.getBot).toHaveBeenCalledWith('bot1');
      expect(mockBot.getLog).toHaveBeenCalled();
    });

    it('should return 404 for non-existent bot', async () => {
      mockBotManager.getBot.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/retrieve_log/nonexistent')
        .expect(404);

      expect(response.text).toBe('❌ Bot "nonexistent" not found');
    });
  });

  describe('POST /api/apply_settings/:id', () => {
    it('should apply settings for existing bot', async () => {
      const settingsData = { 
        username: 'testuser', 
        password: 'testpass', 
        delay: 10, 
        platform: 'Gapa' 
      };

      const response = await request(app)
        .post('/api/apply_settings/bot1')
        .send(settingsData)
        .expect(200);

      expect(response.text).toBe('🪟 Set login info of "bot1"');
      expect(mockBotManager.getBot).toHaveBeenCalledWith('bot1');
      expect(mockBot.setLoginInfo).toHaveBeenCalledWith('testuser', 'testpass');
      expect(mockBot.setDelay).toHaveBeenCalledWith(10);
      expect(mockBot.setPlatform).toHaveBeenCalledWith('Gapa');
    });

    it('should return 404 for non-existent bot', async () => {
      mockBotManager.getBot.mockReturnValue(undefined);
      const settingsData = { username: 'testuser', password: 'testpass', delay: 10, platform: 'Gapa' };

      const response = await request(app)
        .post('/api/apply_settings/nonexistent')
        .send(settingsData)
        .expect(404);

      expect(response.text).toBe('❌ Bot "nonexistent" not found');
    });
  });

  describe('POST /api/kill_Bot/:id', () => {
    it('should kill existing bot', async () => {
      const response = await request(app)
        .post('/api/kill_Bot/bot1')
        .expect(200);

      expect(response.text).toBe('💀 Bot "bot1" terminated');
      expect(mockBot.kill).toHaveBeenCalled();
      expect(mockBroadcastToClients).toHaveBeenCalledWith({
        type: 'botList',
        bots: [{ id: 'bot1', username: 'test', delay: 5, platform: 'Synottip' }]
      });
    });

    it('should return 404 for non-existent bot', async () => {
      mockBotManager.getBot.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/kill_Bot/nonexistent')
        .expect(404);

      expect(response.text).toBe('❌ Bot "nonexistent" not found');
    });
  });

  describe('POST /api/toggle_window/:id', () => {
    beforeEach(() => {
      mockBot.toggleWindowState = jest.fn().mockResolvedValue(undefined);
    });

    it('should toggle window state for existing bot', async () => {
      const response = await request(app)
        .post('/api/toggle_window/bot1')
        .expect(200);

      expect(response.text).toBe('🪟 Window toggled for bot "bot1"');
      expect(mockBot.toggleWindowState).toHaveBeenCalled();
    });

    it('should return 404 for non-existent bot', async () => {
      mockBotManager.getBot.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/toggle_window/nonexistent')
        .expect(404);

      expect(response.text).toBe('❌ Bot "nonexistent" not found');
    });
  });

  describe('POST /api/toggle_Eco/:id', () => {
    beforeEach(() => {
      mockBot.toggleUltraEcoMode = jest.fn().mockResolvedValue(undefined);
    });

    it('should toggle eco mode for existing bot', async () => {
      const response = await request(app)
        .post('/api/toggle_Eco/bot1')
        .expect(200);

      expect(response.text).toBe('🪟 Eco Mode toggled for bot "bot1"');
      expect(mockBot.toggleUltraEcoMode).toHaveBeenCalled();
    });

    it('should return 404 for non-existent bot', async () => {
      mockBotManager.getBot.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/toggle_Eco/nonexistent')
        .expect(404);

      expect(response.text).toBe('❌ Bot "nonexistent" not found');
    });
  });

  describe('Error handling', () => {
    it('should handle async errors in route handlers', async () => {
      mockBotManager.createBot.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/startNewBot')
        .expect(500);

      expect(response.text).toContain('❌ Failed to start bot');
    });

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/set_login_info/bot1')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      // Express will handle malformed JSON and return a 400 error
    });
  });
});