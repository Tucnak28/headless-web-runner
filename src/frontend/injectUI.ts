export const injectControlPanelScript = (() => {
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
  