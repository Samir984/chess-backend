import WebSocket, { WebSocketServer } from "ws";
import {
  queueWorker,
  wakeTheQueueManipulator,
} from "./chess/continuousMatching";
import { v4 as uuidv4 } from "uuid";
import url from "url";
import http from "http";

// Create an HTTP server and WebSocket server
const server = http.createServer();
const wss = new WebSocketServer({ server });

// Define types for player and game queue
export type waitingQueueForRMType = {
  userId: string;
  ws: WebSocket;
  createdAt: Date;
  side: string;
  opponentDetail: {
    name: string;
    image: string;
  };
};

export type GameQueueType = {
  status: string;
  p1: waitingQueueForRMType;
  p2: waitingQueueForRMType;
};

// Initialize game queues and waiting queues
export const waitingQueueForRM: waitingQueueForRMType[] = [];

export const gameQueue = new Map<string, GameQueueType>();

export const tryMatchPlayer = (type: "knock" | "knock-knock") => {
  console.log("Trying to match player");

  if (waitingQueueForRM.length >= 2) {
    const player1 = waitingQueueForRM.shift() as waitingQueueForRMType;
    const player2 = waitingQueueForRM.shift() as waitingQueueForRMType;
    // prevent same user to join each other

    if (player1.userId === player2.userId) return;
    startGame(player1, player2);
  } else if (type === "knock") {
    const player = waitingQueueForRM[0];
    const timeOut =
      new Date().getSeconds() - player.createdAt.getSeconds() > 20
        ? true
        : false;

    console.log(
      "knock",
      new Date().getSeconds() - player.createdAt.getSeconds(),
      new Date().getSeconds() - player.createdAt.getSeconds() > 20
    );
    if (!timeOut) return;
    const timeOutPlayer = waitingQueueForRM.shift() as waitingQueueForRMType;
    console.log("deletePlayer", waitingQueueForRM);
    player.ws.close();
  }
};

const startGame = (p1: waitingQueueForRMType, p2: waitingQueueForRMType) => {
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

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  const reqUrl = req.url ? url.parse(req.url, true) : { query: {} as any };
  const { userId, name, image, mode } = reqUrl.query;

  if (userId && mode === "R") {
    waitingQueueForRM.push({
      userId,
      side: waitingQueueForRM.length % 2 === 0 ? "W" : "B",
      ws,
      createdAt: new Date(),
      opponentDetail: { name, image },
    });

    console.log(waitingQueueForRM);
  } else if (userId && mode === "F") {
  } else {
    ws.close();
    console.log("Lost connection");
  }

  ws.on("message", (message) => {
    const { type, data } = JSON.parse(message.toString());
    console.log(type, data);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  });

  ws.on("close", (event) => {
    console.log("WebSocket connection closed:", event);
  });
});

// Start the HTTP server
server.listen(8080, () => {
  wakeTheQueueManipulator();
  queueWorker(1000);
  console.log("WebSocket server is running on ws://localhost:8080");
});
