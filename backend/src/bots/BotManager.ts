import { SynotBot } from "./SynotBot";

export class BotManager {
  private bots: Map<string, SynotBot> = new Map();

  async createBot(id: string) {
    const bot = new SynotBot(id);
    await bot.launch();
    this.bots.set(id, bot);
  }

  getBot(id: string): SynotBot | undefined {
    return this.bots.get(id);
  }
}
