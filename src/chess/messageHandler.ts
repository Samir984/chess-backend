import WebSocket from "ws";
import { gameQueue, waitingQueueForFM, waitingQueueForRM } from "./gameQueue";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";

export function messageHandler(message: WebSocket.RawData) {
  const messageString = JSON.parse(message.toString());
  const { type, data } = messageString;
  const gameId = data.gameId;
  const clients = gameQueue.get(gameId);
  console.log(type, data);

  switch (type) {
    case "move":
      communicatedThen(clients as GameQueueType, data, gameId);
      break;

    case "gameOver":
      setTimeout(
        () =>
          handleGameOver(
            gameId,
            clients?.p1 as WaitingQueueForRMType,
            clients?.p2 as WaitingQueueForRMType
          ),
        3000
      );
      break;

    case "closeSocketBeforeJoin":
      handleCloseSocketBeforeJoin(data);

      break;

    case "quit":
      handleQuit(clients as GameQueueType, data, gameId);
      break;
  }
}

function handleCloseSocketBeforeJoin(data: any) {
  console.log("handleCloseSocketBeforeJoin function\n");
  const { mode, inviterId, userId } = data;
  console.log(inviterId, mode, userId);
  if (mode === "F") {
    waitingQueueForFM.delete(inviterId);
  } else if (mode === "R") {
    const canPerformed = waitingQueueForRM.length < 500;
    if (canPerformed) {
      const updatedWaitingQueueForRM = waitingQueueForRM.filter(
        (player) => player.userId !== userId
      );
      console.log(updatedWaitingQueueForRM);
      waitingQueueForRM.splice(0, waitingQueueForRM.length);
      waitingQueueForRM.push(...updatedWaitingQueueForRM);
      console.log(
        "\n\n\n\nnew waitingQueueForRM size: ",
        waitingQueueForRM.length
      );
    }
  }
}

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
    p2.ws.send(quitMessage);
  } else {
    p1.ws.send(quitMessage);
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
