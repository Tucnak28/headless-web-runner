import express, { Request, Response, Router } from "express";
import { botManager } from "./BotManagerInstace";
import { broadcastToClients } from "./Server";
import { wait } from "../lib/gameActions";
import path from "path";
import fs from "fs";

const router: Router = express.Router();

// Start a new bot
router.post("/startNewBot", async (req, res) => {
  try {
    const bot = await botManager.createBot();

    broadcastToClients({
      type: "botList",
      bots: botManager.getAllBotInfo(),
    });

    res.status(201).send(`✅ Bot "${bot.id}" started`);
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
router.post("/apply_settings/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  const { username, password, delay, platform } = req.body;

  bot.setLoginInfo(username, password);
  bot.setDelay(delay);
  bot.setPlatform(platform);

  broadcastToClients({
    type: "botList",
    bots: botManager.getAllBotInfo(),
  });


  res.send(`🪟 Set login info of "${id}"`);
});



// kill bot
router.post("/kill_Bot/:id", async (req, res) => {
  const { id } = req.params;
  const bot = botManager.getBot(id);

  if (!bot) {
    res.status(404).send(`❌ Bot "${id}" not found`);
    return;
  }

  await bot.kill();
  botManager.removeBot(id);

  broadcastToClients({
    type: "botList",
    bots: botManager.getAllBotInfo(),
  });

  res.send(`💀 Bot "${id}" terminated`);
});


router.post("/test_stealth/", async (req: Request, res: Response) => {
  const bot = await botManager.createBot();
  const id = bot.id;

  try {
    const page = bot["page"];

    await page.goto("https://fingerprintjs.github.io/BotD/main/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });


    await wait(5000);

    let screenshotPath = path.join("screenshots", `bot-test1-${id}.png`);
    fs.mkdirSync("screenshots", { recursive: true });

    await page.screenshot({ path: screenshotPath as `${string}.png`, fullPage: true });

      await page.goto("https://amiunique.org/fingerprint", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await wait(15000);

    screenshotPath = path.join("screenshots", `bot-test2-${id}.png`);
    fs.mkdirSync("screenshots", { recursive: true });

    await page.screenshot({ path: screenshotPath as `${string}.png`, fullPage: true });
    

    await bot.kill();
    botManager.removeBot(id);

    res.json({
      message: `✅ Bot "${id}" tested and killed.`,
      screenshot: screenshotPath,
    });

  } catch (err: any) {
    await bot.kill();
    botManager.removeBot(id);
    res.status(500).send(`❌ Error during test: ${err.message}`);
  }
});

export default router;
