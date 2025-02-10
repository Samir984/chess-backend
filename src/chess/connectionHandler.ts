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
import { addUnderscores, urlShortning } from "../utils/helper";
import { WaitingQueueForRMType } from "../types/types";

export function connetionHandler(req: IncomingMessage, ws: WebSocket) {
  const reqUrl = req.url ? url.parse(req.url, true) : { query: {} as any };
  const { userId, name, image, mode, inviterId } = reqUrl.query;
  const side = waitingQueueForRM.length % 2 === 0 ? "W" : "B";
  
  if (userId && mode === "R") {
    waitingQueueForRM.push({
      userId: userId as string,
      side: side,
      ws,
      createdAt: new Date(),
      playerInfo: { name: name as string, image: image as string },
    });

    if (waitingQueueForRM.length === 1 && !queueWorkerRunning) {
      queueWorker(1000);
    }
  } else if (userId && mode === "F") {
    waitingQueueForFM.set(userId, {
      userId: userId as string,
      side: "W",
      ws,
      createdAt: new Date(),
      playerInfo: { name: name as string, image: image as string },
    });
    ws.send(
      JSON.stringify({
        type: "joiningLink",
        joiningLink: `?inviterId=${userId}&inviterName=${addUnderscores(
          name
        )}&inviterImage=${urlShortning(image)}`,
      })
    );
  } else if (userId && mode === "J" && inviterId) {
    console.log("J mode", inviterId, userId);
    const inviter = waitingQueueForFM.get(inviterId);
    console.log(inviter);
    if (!inviter) {
      ws.send(
        JSON.stringify({
          type: "expiredJoiningLink",
        })
      );
      ws.close();
      return;
    } else {
      const invitee:WaitingQueueForRMType= {
        userId: userId as string,
        side: "B",
        ws,
        createdAt: new Date(),
        playerInfo: { name: name as string, image: image as string },
      };
      waitingQueueForFM.delete(inviterId);
      startGame(inviter, invitee);
    }
  } else {
    ws.close();
    console.log("Lost connection");
  }
}
