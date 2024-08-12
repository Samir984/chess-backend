import { WebSocket, WebSocketServer } from "ws";

import { messageHandler } from "./messageHandler";
import { connetionHandel } from "./connectionHandler";

export const setupWebSocketServer = (wss: WebSocketServer) => {
  wss.on("connection", (ws: WebSocket, req) => {
    connetionHandel(req, ws);

    ws.on("message", (message) => messageHandler(message));

    ws.on("close", (code, reason) => {
      console.log("WebSocket connection closed:", code, reason.toString());
    });
  });
};
