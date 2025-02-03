import { WebSocket, WebSocketServer } from "ws";

import { messageHandler } from "./messageHandler";
import { connetionHandler } from "./connectionHandler";
import { waitingQueueForRM } from "./gameQueue";

export const setupWebSocketServer = (wss: WebSocketServer) => {
  wss.on("connection", (ws: WebSocket, req) => {
    console.log(waitingQueueForRM.length, "length");
    if (waitingQueueForRM.length === 1000) {
      const closeMessage =
        "Connection rejected due to high traffic. Please try later"; 
      ws.close(4000, closeMessage);
      console.log("Connection rejected: Waiting queue is full.");
      return;
    }
    connetionHandler(req, ws);
    console.log("\n\n\nTotal connected user to: ", wss.clients.size);

    ws.on("message", (message) => messageHandler(message));

    ws.on("close", (code, reason) => {
      console.log("WebSocket connection closed:", code, reason.toString());
    });
  });
};
