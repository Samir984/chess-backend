import { WebSocket, WebSocketServer } from "ws";

import { messageHandler } from "./messageHandler";
import { connetionHandler } from "./connectionHandler";

export const setupWebSocketServer = (wss: WebSocketServer) => {
  wss.on("connection", (ws: WebSocket, req) => {
    connetionHandler(req, ws);
    console.log("\n\n\nTotal connected user to: ", wss.clients.size);

    ws.on("message", (message) => messageHandler(message));

    ws.on("close", (code, reason) => {
      console.log("WebSocket connection closed:", code, reason.toString());
    });
  });
};
