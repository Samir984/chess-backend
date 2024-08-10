import { v4 as uuidv4 } from "uuid";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";

export const waitingQueueForRM: WaitingQueueForRMType[] = [];
export const gameQueue = new Map<string, GameQueueType>();

let queueInterval: NodeJS.Timeout;

export const tryMatchPlayer = (type: "knock" | "knock-knock") => {
  console.log("Trying to match player");

  if (waitingQueueForRM.length >= 2) {
    const player1 = waitingQueueForRM.shift()!;
    const player2 = waitingQueueForRM.shift()!;
    if (player1.userId === player2.userId) return;
    startGame(player1, player2);
  } else if (type === "knock") {
    const player = waitingQueueForRM[0];
    if (player) {
      const timeOut =
        new Date().getSeconds() - player.createdAt.getSeconds() > 20;
      console.log(
        "knock",
        new Date().getSeconds() - player.createdAt.getSeconds(),
        timeOut
      );
      if (!timeOut) return;
      const timeOutPlayer = waitingQueueForRM.shift();
      if (timeOutPlayer) {
        timeOutPlayer.ws.close();
      }
    }
  }
};

export function queueWorker(intervalTime: number) {
  console.log(
    "queueWorker running",
    "waitingQueueForRMLength -> ",
    waitingQueueForRM.length,
    "intervalTime->",
    intervalTime
  );
  queueInterval = setInterval(() => {
    tryMatchPlayer("knock-knock");
  }, intervalTime);
}

export function wakeTheQueueManipulator() {
  console.log("wakeTheQueueManipulator wake up");

  setInterval(() => {
    if (queueInterval) {
      clearInterval(queueInterval);
    }
    if (waitingQueueForRM.length > 0) {
      tryMatchPlayer("knock");
    }
    const newQueueWorkerInterval = Math.max(
      1000 - waitingQueueForRM.length * 10,
      100
    ); // Ensure intervalTime is not less than 100ms
    queueWorker(newQueueWorkerInterval);
  }, 10000);
}

export const startGame = (
  p1: WaitingQueueForRMType,
  p2: WaitingQueueForRMType
) => {
  console.log("Starting game");
  const gameId = uuidv4();
  gameQueue.set(gameId, {
    status: "good",
    p1,
    p2,
  });
  console.log(gameQueue);
  p1.ws.send(
    JSON.stringify({
      type: "joined",
      gameId,
      side: p1.side,
      opponent: p2.opponentDetail,
    })
  );
  p2.ws.send(
    JSON.stringify({
      type: "joined",
      gameId,
      side: p2.side,
      opponent: p1.opponentDetail,
    })
  );
};
