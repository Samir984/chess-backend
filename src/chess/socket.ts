import { WebSocket, WebSocketServer } from "ws";
import url from "url";
import {
  gameQueue,
  queueWorker,
  queueWorkerRunning,
  waitingQueueForRM,
} from "./gameQueue";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";

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
      const gameId = data.gameId;
      const clients = gameQueue.get(gameId);

      switch (type) {
        case "move":
          communicatedThen(clients as GameQueueType, data, gameId);
          break;

        case "gameOver":
          setTimeout(
            () =>
              handelTermination(
                gameId,
                clients?.p1 as WaitingQueueForRMType,
                clients?.p2 as WaitingQueueForRMType
              ),
            1000
          );
          break;

        case "quiet":
          break;
      }
    });

    ws.on("close", (code, reason) => {
      console.log("WebSocket connection closed:", code, reason.toString());
    });
  });
};

function communicatedThen(clients: GameQueueType, data: any, gameId: string) {
  const { p1, p2 } = clients;
  if (p1.ws.readyState === 1 && p2.ws.readyState === 1) {
    const parsedJsonMessage = JSON.stringify({
      type: "move",
      move: data.move,
    });

    if (p1.side === "W" && data.nextTurn === "W") {
      console.log("send to W");
      clients.p1.ws.send(parsedJsonMessage);
    } else {
      console.log("send to B");
      clients.p2.ws.send(parsedJsonMessage);
    }
  } else {
    handelTermination(gameId, p1, p2);
  }
}

//handel termination
function handelTermination(
  gameId: string,
  p1: WaitingQueueForRMType,
  p2: WaitingQueueForRMType
) {
  console.log("termination function call");
  gameQueue.delete(gameId);
  p1.ws.close();
  p2.ws.close();
}
