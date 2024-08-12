import { v4 as uuidv4 } from "uuid";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";

export const waitingQueueForRM: WaitingQueueForRMType[] = [];

export const gameQueue = new Map<string, GameQueueType>();

export let queueInterval: NodeJS.Timeout;
export let queueWorkerRunning: boolean;

export const tryMatchPlayer = (type: "knock" | "knock-knock") => {
  console.log("Trying to match player");

  if (waitingQueueForRM.length >= 2) {
    const player1 = waitingQueueForRM.shift()!;
    const player2 = waitingQueueForRM.shift()!;
    //prevenation checked as waitingQueue may missed to clean
    if (
      player1.userId === player2.userId ||
      player1.ws.readyState !== player2.ws.readyState
    )
      return;
    startGame(player1, player2);
  } else if (type === "knock") {
    // removing player after timeout
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

//  called on server start
export function queueWorker(intervalTime: number) {
  console.log(
    "waitingQueueForRMLength -> ",
    waitingQueueForRM.length,
    "gameQueue lenth->",
    gameQueue.size
  );
  queueWorkerRunning = true;
  queueInterval = setInterval(() => {
    tryMatchPlayer("knock-knock");
  }, intervalTime);
}

//  called on server start
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
        "waitingQueue: ",
        waitingQueueForRM.length,
        "GameQUeue : ",
        gameQueue.size
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

function communicatedThen(clients: GameQueueType, data: any, gameId: string) {
  const { p1, p2 } = clients;
  if (
    p1.ws.readyState === WebSocket.OPEN &&
    p2.ws.readyState === WebSocket.OPEN
  ) {
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
    handleGameOver(gameId, p1, p2);
  }
}

// Handle player quitting
function handleQuit(clients: GameQueueType, data: any, gameId: string) {
  const { p1, p2 } = clients;
  const quitter = data.quitter;

  const quitMessage = JSON.stringify({
    type: "quit",
    quitter,
    message: "Your opponent quit the game",
  });

  if (p1.side === quitter) {
    p1.ws.send(quitMessage);
  } else {
    p2.ws.send(quitMessage);
  }

  // Clean up
  gameQueue.delete(gameId);
  p1.ws.close();
  p2.ws.close();
}

// Handle game over scenario
function handleGameOver(
  gameId: string,
  p1: WaitingQueueForRMType,
  p2: WaitingQueueForRMType
) {
  console.log("handleGameOver function call");

  const gameOverMessage = JSON.stringify({
    type: "close",
    message: "Game terminated",
  });

  p1.ws.send(gameOverMessage);
  p2.ws.send(gameOverMessage);

  // Clean up
  gameQueue.delete(gameId);
  p1.ws.close();
  p2.ws.close();
}
