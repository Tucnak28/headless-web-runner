import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import routes from "./routes";
import { botManager } from "./BotManagerInstace";
import cors from 'cors';
import http from 'http';

const clients: Set<WebSocket> = new Set();

export function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }));

  app.use(express.static("public"));
  app.use(express.json());
  app.use("/api", routes);

  server.listen(3001, () =>
    console.log("🌐 Server running at http://localhost:3001")
  );

  const wss = new WebSocketServer({ server });



  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.send(JSON.stringify({
      type: "botList",
      bots: botManager.getAllBotInfo(),
    }));

    ws.on("close", () => {
      clients.delete(ws);
    });
  });


  
}

  export function broadcastToClients(message: any) {
    const data = JSON.stringify(message);
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    }
  }