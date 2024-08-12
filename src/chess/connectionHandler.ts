import { IncomingMessage } from "http";
import url from "url";
import {
  queueWorker,
  queueWorkerRunning,
  waitingQueueForRM,
} from "./gameQueue";
import { WebSocket } from "ws";

export function connetionHandel(req: IncomingMessage, ws: WebSocket) {
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
}
