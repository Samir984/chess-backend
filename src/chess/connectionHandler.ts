import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";
import url from "url";
import {
  queueWorker,
  queueWorkerRunning,
  startGame,
  waitingQueueForFM,
  waitingQueueForRM,
} from "./gameQueue";
import { WebSocket } from "ws";

export function connetionHandler(req: IncomingMessage, ws: WebSocket) {
  const reqUrl = req.url ? url.parse(req.url, true) : { query: {} as any };
  const { userId, name, image, mode, gameId } = reqUrl.query;

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
    const gameId = uuidv4();
    waitingQueueForFM.set(gameId, {
      userId: userId as string,
      side: "W",
      ws,
      createdAt: new Date(),
      opponentDetail: { name: name as string, image: image as string },
    });
    ws.send(
      JSON.stringify({
        type: "joiningLink",
        joiningLink: `?gameId=${gameId}&inviterName=${name}&inviterImage=${image}`,
      })
    );
  } else if (userId && mode === "J" && gameId) {
    const inviter = waitingQueueForFM.get(gameId);
    console.log(inviter);
    if (!inviter) {
      ws.send(
        JSON.stringify({
          type: "expiredJoiningLink",
          message: "connetion request was expired",
        })
      );
      ws.close();
      return;
    } else {
      const invitee = {
        userId: userId as string,
        side: "B",
        ws,
        createdAt: new Date(),
        opponentDetail: { name: name as string, image: image as string },
      };
      waitingQueueForFM.delete(gameId);
      startGame(inviter, invitee);
    }
  } else {
    ws.close();
    console.log("Lost connection");
  }
}
