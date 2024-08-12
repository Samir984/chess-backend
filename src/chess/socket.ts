import { WebSocket, WebSocketServer } from "ws";
import url from "url";
import {
  gameQueue,
  queueWorker,
  queueWorkerRunning,
  waitingQueueForRM,
} from "./gameQueue";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";
import { messageHandler } from "./messageHandler";

export const setupWebSocketServer = (wss: WebSocketServer) => {
  wss.on("connection", (ws: WebSocket, req) => {
    const reqUrl = req.url ? url.parse(req.url, true) : { query: {} as any };
    const { userId, name, image, mode } = reqUrl.query;

    if (userId && mode === "R") {
      waitingQueueForRM.push({
        userId: userId as string,
        side: waitingQueueForRM.length % 2 === 0 ? "W" : "B",
        ws,
        createdAt: new Date(),
        opponentDetail: { name: name as string, image: image as string },
      });

      if (waitingQueueForRM.length === 1 && !queueWorkerRunning) {
        queueWorker(1000);
      }
    } else if (userId && mode === "F") {
      // Handle mode F if necessary
    } else {
      ws.close();
      console.log("Lost connection");
    }

    ws.on("message", (message) => messageHandler(message));

    ws.on("close", (code, reason) => {
      console.log("WebSocket connection closed:", code, reason.toString());
    });
  });
};
