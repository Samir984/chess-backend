import WebSocket from "ws";
import { gameQueue, waitingQueueForFM, waitingQueueForRM } from "./gameQueue";
import { GameQueueType, WaitingQueueForRMType } from "../types/types";
import { UpdateMatch, UpdateMatchInterface } from "../services/match";
import e from "express";

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

    case "closeSocketBeforeJoin":
      handleCloseSocketBeforeJoin(data);
      break;

    // this check will hit by client if any player don't respond for 30 second
    case "checkOpponentPlayerStatus":
      handelCheckOpponentPlayerStatus(clients as GameQueueType, data, gameId);
      break;

    case "quit":
      handleQuit(clients as GameQueueType, data, gameId);
      break;
  }
}

function handelCheckOpponentPlayerStatus(
  clients: GameQueueType,
  data: any,
  gameId: string
) {
  console.log("handelCheckOpponentPlayerStatus function call");
  const { p1, p2 } = clients;

  const opponentSideTOCheck = data.opponentSide;
  const parsedJsonMessage = JSON.stringify({
    type: "opponentPlayerConnectionLost",
    message: "Opponent player connetion lost",
  });
  if (p1.ws.readyState === WebSocket.CLOSED) {
    handleTermination(gameId, p1, p2, "opponentPlayerConnectionLost");
  } else if (p2.ws.readyState === WebSocket.CLOSED) {
    handleTermination(gameId, p1, p2, "opponentPlayerConnectionLost");
  } else {
    console.log("all fine");
  }
}

function handleCloseSocketBeforeJoin(data: any) {
  console.log("handleCloseSocketBeforeJoin function");
  const { mode, inviterId, userId } = data;
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
        "\n\n\n\n new waitingQueueForRM size: ",
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

    if (p1.side === "W" && data.sendTo === "W") {
      console.log("send to W");
      clients.p1.ws.send(parsedJsonMessage);
    } else {
      console.log("send to B");
      clients.p2.ws.send(parsedJsonMessage);
    }

    if (data.status === "isGameOver" || data.status === "isDraw") {
      handleGameOver(clients, data, gameId);
    }
  } else {
    handleTermination(gameId, p1, p2);
  }
}

// Handle player quitting
async function handleQuit(clients: GameQueueType, data: any, gameId: string) {
  const { p1, p2 } = clients;
  const quitter = data.quitter;

  const quitMessage = JSON.stringify({
    type: "quit",
    quitter,
    message: "Your opponent quit the game",
  });

  let payload: UpdateMatchInterface = {
    game_id: gameId,
  };
  if (p1.side === quitter) {
    p2.ws.send(quitMessage);
    payload = {
      ...payload,
      is_quit: true,
      quitter_player: p1.userId,
    };
  } else {
    p1.ws.send(quitMessage);
    payload = {
      ...payload,
      is_quit: true,
      quitter_player: p2.userId,
    };
  }

  await UpdateMatch(payload);
  // Clean up
  gameQueue.delete(gameId);
  p1.ws.close();
  p2.ws.close();
}

// Handle game over scenario
async function handleGameOver(
  clients: GameQueueType,
  data: any,
  gameId: string
) {
  console.log("handleGameOver function call");
  const { p1, p2 } = clients;

  let payload: UpdateMatchInterface = {
    game_id: gameId,
  };

  if (data.status === "isGameOver") {
    console.log(data.status);
    payload = {
      ...payload,
      is_completed: true,
      winner_player: p1.side === data.sendTo ? p2.userId : p1.userId,
    };
  } else if (data.status === "isDraw") {
    console.log(data.status, "payload");
    payload = {
      ...payload,
      is_completed: true,
      is_draw: true,
    };
  }
  console.log(payload);

  await UpdateMatch(payload);
  // Clean up
  gameQueue.delete(gameId);
  p1.ws.close();
  p2.ws.close();
}

function handleTermination(
  gameId: string,
  p1: WaitingQueueForRMType,
  p2: WaitingQueueForRMType,
  terminationLabel?: string
) {
  console.log("Termination function call");

  gameQueue.delete(gameId);
  const parsedJsonMessage = JSON.stringify({
    type: terminationLabel || "unknown",
    message: "Opponent player connetion lost",
  });

  if (p1.ws.readyState === WebSocket.OPEN) {
    p1.ws.send(parsedJsonMessage);
  } else {
    p2.ws.send(parsedJsonMessage);
  }

  if (p1.ws.readyState === WebSocket.OPEN) {
    p1.ws.close();
  }

  // Close player 2's connection if it is open
  if (p2.ws.readyState === WebSocket.OPEN) {
    p2.ws.close();
  }
}
