import express, { Request, Response, Router } from "express";
import { botManager } from "./BotManagerInstace";

const router: Router = express.Router();

// Start a new bot
router.post("/start/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (botManager.getBot(id)) {
    res.status(400).send(`Bot "${id}" already exists.`);
    return;
  }

  try {
    await botManager.createBot(id);
    res.status(201).send(`✅ Bot "${id}" started`);
  } catch (err: any) {
    res.status(500).send(`❌ Failed to start bot: ${err.message}`);
  }
});

// Toggle spin
router.post("/toggle_spin/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  bot.toggleSpin();
  res.send(`🔁 Spin toggled for bot "${id}"`);
});

// Retrieve Log
router.post("/retrieve_log/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  res.json({ log: bot.getLog() });

});

// Toggle window state
router.post("/toggle_window/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  await bot.toggleWindowState();
  res.send(`🪟 Window toggled for bot "${id}"`);
});

// Toggle Ultra Eco mode
router.post("/toggle_Eco/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  await bot.toggleUltraEcoMode();

  res.send(`🪟 Eco Mode toggled for bot "${id}"`);
});

// Set login
router.post("/set_login/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  const { username, password } = req.body;

  bot.setLoginInfo(username, password);


  res.send(`🪟 Set login info of "${id}"`);
});

export default router;
