import express, { Request, Response } from "express";
import puppeteer, { LaunchOptions } from "puppeteer";
import type { CDPSession, Page, Frame } from "puppeteer";
import {
  waitForGameFrame,
  clickBetMinus,
  clickSpin,
  wait,
  clickOkButton,
} from "./synot";

import { WebSocketServer } from "ws";

const app = express();
app.use(express.static("public"));
app.use(express.json());

let session: CDPSession;
let page: Page;
let windowId: number;
let fakeMaximize = false;
let performBoolean = false;

export async function performGameActions(page: Page) {
  while (performBoolean) {
    // 1. Get the game iframe
    const frame = await waitForGameFrame(page);

    try {
      await frame.waitForSelector("#betMinus", { timeout: 10000 });
    } catch (err: any) {
      console.error("❌ Failed to click Bet Minus button:", err.message);
    }

    await wait(90000);

    //await clickOkButton(frame);

    // 2. Click Bet Minus 20 times
    await clickBetMinus(frame, 20);

    // 3. Click Spin button
    await clickSpin(frame);

    await wait(90000);

    console.log("✅ Game actions completed inside iframe.");
  }
}

const updateWindowState = async () => {
  if (!session || !windowId) return;

  if (fakeMaximize) {
    // Move the window far off-screen
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: {
        windowState: "normal",
        left: -20000,
        top: 0,
      },
    });
    console.log("Window moved out of bounds.");
  } else {
    // Move it back to visible screen
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: {
        windowState: "normal",
        left: 100,
        top: 100,
      },
    });
    console.log("Window moved back in bounds.");
  }
};

app.post("/toggle_Maximize", async (req: Request, res: Response) => {
  fakeMaximize = !fakeMaximize;
  console.log("Fake maximize toggled to:", fakeMaximize);
  await updateWindowState();

  res.sendStatus(200);
});

app.post("/perform_a_spin", (req: Request, res: Response) => {
  performBoolean = !performBoolean;
  console.log("Fake maximize toggled to:", performBoolean);
  performGameActions(page);
  res.sendStatus(200);
});

const server = app.listen(3000, () => {
  console.log("Web UI at http://localhost:3000/control.html");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  console.log("🧩 WebSocket client connected");

  socket.on("message", (data) => {
    const msg = data.toString();
    console.log("📨 Message received:", msg);

    if (msg === "toggle_window") {
      fakeMaximize = !fakeMaximize;
      updateWindowState();
    }

    if (msg === "toggle_spin") {
      performBoolean = !performBoolean;
      performGameActions(page);
    }
  });

  socket.send("✅ Connected to WebSocket server");
});

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--mute-audio",
      "--disable-infobars",
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--no-default-browser-check",
      "--disable-setuid-sandbox",
      "--disable-features=site-per-process",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
    ],
  } as unknown as LaunchOptions);

  page = await browser.newPage();

  await page.exposeFunction("reportClick", (data: any) => {
    console.log("🖱️ Clicked element from browser:", data);
  });

  await page.evaluateOnNewDocument(() => {
    let lastUrl = location.href;

    const injectControlPanel = () => {
      if (document.getElementById("myControlPanel")) return;

      const panel = document.createElement("div");
      panel.id = "myControlPanel";
      panel.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      padding: 10px; background: #f0f0f0; color: black;
      font-family: sans-serif; border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3); cursor: move; user-select: none;
    `;

      panel.innerHTML = `
      <button id="btnToggleWindow" style="margin: 5px;">🧭 Toggle Window</button>
      <button id="btnSpin" style="margin: 5px;">🎰 Start/Stop Spin</button>
      <div id="wsStatus" style="margin-top: 5px; font-size: 12px;">🔄 Connecting...</div>
    `;

      document.body.appendChild(panel);

      const socket = new WebSocket("ws://localhost:3000");
      const status = document.getElementById("wsStatus");

      if(!status) return;

      socket.onopen = () => {
        status.textContent = "✅ WebSocket connected";
      };

      socket.onclose = () => {
        status.textContent = "❌ WebSocket closed";
      };

      socket.onerror = () => {
        status.textContent = "⚠️ WebSocket error";
      };

      socket.onmessage = (e) => {
        console.log("📩 Server:", e.data);
      };

      document
        .getElementById("btnToggleWindow")
        ?.addEventListener("click", () => {
          socket.send("toggle_window");
        });

      document.getElementById("btnSpin")?.addEventListener("click", () => {
        socket.send("toggle_spin");
      });

      // Dragging (same)
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      panel.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.getBoundingClientRect().left;
        offsetY = e.clientY - panel.getBoundingClientRect().top;
      });

      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          panel.style.left = `${e.clientX - offsetX}px`;
          panel.style.top = `${e.clientY - offsetY}px`;
          panel.style.right = "auto";
        }
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    };

    window.addEventListener("DOMContentLoaded", () => {
      injectControlPanel();
      setInterval(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          injectControlPanel();
        }
      }, 500);
    });
  });

  await page.goto("https://www.synottip.cz/", { waitUntil: "networkidle2" });

  session = await page.createCDPSession();
  const info = await session.send("Browser.getWindowForTarget");
  windowId = info.windowId;
})();

/*await page.evaluateOnNewDocument(() => {
    const getUniqueSelector = (el: Element): string => {
      if (el.id) return `#${el.id}`;
      const parts: string[] = [];
      while (el && el.nodeType === 1 && el !== document.body) {
        let selector = el.nodeName.toLowerCase();
        if (el.className) selector += '.' + [...el.classList].join('.');
        parts.unshift(selector);
        el = el.parentElement!;
      }
      return parts.join(' > ');
    };
  
    document.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (!target) return;
  
      const data = {
        tag: target.tagName,
        id: target.id,
        classes: target.className,
        text: target.textContent?.trim().slice(0, 100),
        href: (target as HTMLAnchorElement).href || undefined,
        selector: getUniqueSelector(target)
      };
  
      // @ts-ignore
      if (window.reportClick) {
        // @ts-ignore
        window.reportClick(data);
      } else {
        console.warn('reportClick not available');
      }
    }, true);
  });*/
