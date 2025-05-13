import express from "express";
import { WebSocketServer } from "ws";
import routes from "./routes";
import { BotManager } from "../bots/BotManager";

export const botManager = new BotManager();

export function startServer() {
  const app = express();
  app.use(express.static("public"));
  app.use(express.json());
  app.use("/api", routes);

  const server = app.listen(3001, () =>
    console.log("🌐 Server running at http://localhost:3001")
  );

  const wss = new WebSocketServer({ server });
  wss.on("connection", (socket) => {
    socket.on("message", (msg: Buffer) => {
      const [command, id] = msg.toString().split(":");
      const bot = botManager.getBot(id);
      if (!bot) return;

      if (command === "spin") bot.toggleSpin();
      if (command === "window") bot.toggleWindowState();
    });
  });
}
