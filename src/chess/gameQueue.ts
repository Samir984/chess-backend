// src/gameQueue.ts
import { v4 as uuidv4 } from "uuid";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";

export const waitingQueueForRM: WaitingQueueForRMType[] = [];
export const gameQueue = new Map<string, GameQueueType>();
export const waitingQueueForFM = new Map<string, WaitingQueueForRMType>();

export let queueInterval: NodeJS.Timeout;
export let queueWorkerRunning: boolean;

export const tryMatchPlayer = (type: "knock" | "knock-knock") => {
  console.log("Trying to match player");

  if (waitingQueueForRM.length >= 2) {
    const player1 = waitingQueueForRM.shift()!;
    const player2 = waitingQueueForRM.shift()!;
    // Prevention check as waitingQueue may missed to clean
    if (
      player1.userId === player2.userId ||
      player1.ws.readyState !== player2.ws.readyState
    )
      return;
    startGame(player1, player2);
  } else if (type === "knock") {
    // Removing player after timeout
    const player = waitingQueueForRM[0];
    if (player) {
      const timeOut =
        (new Date().getTime() - player.createdAt.getTime()) / 1000 > 20;
      console.log(
        "knock",
        new Date().getTime() - player.createdAt.getTime(),
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

// short intervel check fro matching users for new game from waitingQueueForRM
export function queueWorker(intervalTime: number) {
  console.log("queue worker start");
  queueWorkerRunning = true;
  queueInterval = setInterval(() => {
    tryMatchPlayer("knock-knock");
  }, intervalTime);
}

// long interval  queue for time manipulation and checking timout in waitingQueueForRM
export function wakeTheQueueManipulator() {
  console.log("wakeTheQueueManipulator wake up");

  setInterval(() => {
    if (queueInterval) {
      clearInterval(queueInterval);
    }
    if (waitingQueueForRM.length > 0) {
      tryMatchPlayer("knock");
    }

    const newQueueWorkerInterval = 1000 - waitingQueueForRM.length * 10;
    if (waitingQueueForRM.length === 0) {
      console.log(
        "waitingQueueForRM Length -> ",
        waitingQueueForRM.length,
        "gameQueue length->",
        gameQueue.size,
        "waitingQueueForFM Length ->",
        waitingQueueForFM.size
      );
      queueWorkerRunning = false;
      return;
    }

    queueWorker(newQueueWorkerInterval);
  }, 5000);
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
