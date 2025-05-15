import { SynotBot } from "./SynotBot";

export class BotManager {
  private bots: Map<string, SynotBot> = new Map();
  private counter = 1;

  async createBot(): Promise<SynotBot> {
    const id = `bot${this.counter++}`;
    const bot = new SynotBot(id);
    await bot.launch();
    this.bots.set(id, bot);
    return bot;
  }

  getBot(id: string): SynotBot | undefined {
    return this.bots.get(id);
  }

  async removeBot(id: string) {
    const bot = this.bots.get(id);
    if (!bot) return;
    await bot.kill();
    this.bots.delete(id);
  }

  getAllBots() {
    return Array.from(this.bots.values());
  }

  getAllBotInfo() {
    return this.getAllBots().map(bot => bot.getInfo());
  }


}
