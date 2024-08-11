import { WebSocket, WebSocketServer } from "ws";
import url from "url";
import {
  gameQueue,
  queueWorker,
  queueWorkerRunning,
  waitingQueueForRM,
} from "./gameQueue";
import { GameQueueType } from "../types/types";

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

      console.log(waitingQueueForRM);
    } else if (userId && mode === "F") {
      // Handle mode F if necessary
    } else {
      ws.close();
      console.log("Lost connection");
    }

    ws.on("message", (message) => {
      console.log("message");
      const messageString = JSON.parse(message.toString());

      const { type, data } = messageString;
      console.log(type, data.gameId);
      const clients = gameQueue.get(data.gameId);

      switch (type) {
        case "move":
          communicatedThen(clients as GameQueueType, data);
          break;

        case "gameOver":
          break;
      }
    });

    ws.on("close", (event: CloseEvent) => {
      console.log("WebSocket connection closed:", event);
    });
  });
};

function communicatedThen(clients: GameQueueType, data: any) {
  if (clients.p1.ws.readyState === 1 && clients.p2.ws.readyState === 1) {
    const parsedJsonMessage = JSON.stringify({
      type: "move",
      move: data.move,
    });
    clients.p1.ws.send(parsedJsonMessage);
    clients.p2.ws.send(parsedJsonMessage);
  }
}
