import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import url from "url";
import http from "http";

// Create an HTTP server and WebSocket server
const server = http.createServer();
const wss = new WebSocketServer({ server });
// Define types for player and game queue
type WaitingQueueType = {
  userId: string;
  ws: WebSocket;
  side: string;
  opponentDetail: {
    name: string;
    image: string;
  };
};

type GameQueueType = {
  status: string;
  p1: WaitingQueueType;
  p2: WaitingQueueType;
};

// Initialize game queues and waiting queues
const waitingQueue: WaitingQueueType[] = [];
const gameQueue = new Map<string, GameQueueType>();

// Handle player matching and game start
const handleMatchNotFound = () => {
  console.log("Handling match not found");
  const intervalId = setInterval(() => {
    console.log("Interval running", waitingQueue.length);
    tryMatchPlayer("intervalMatcher", intervalId);
  }, 1000);

  setTimeout(() => {
    if (waitingQueue.length > 0) {
      clearInterval(intervalId);
      console.log("Interval cleared");
      const singlePlayer = waitingQueue.shift() as WaitingQueueType;
      console.log(`Waiting queue length: ${waitingQueue.length}`);
      singlePlayer.ws.close();
    }
  }, 20000);
};

const tryMatchPlayer = (
  type: "firstTry" | "intervalMatcher",
  intervalId?: NodeJS.Timeout
) => {
  console.log("Trying to match player");

  if (waitingQueue.length >= 2) {
    const player1 = waitingQueue.shift() as WaitingQueueType;
    const player2 = waitingQueue.shift() as WaitingQueueType;

    console.log(type, intervalId);
    if (type === "intervalMatcher") {
      console.log("killing interval");
      clearInterval(intervalId);
    }

    startGame(player1, player2);
  } else if (type === "firstTry") {
    handleMatchNotFound();
  }
};

const startGame = (p1: WaitingQueueType, p2: WaitingQueueType) => {
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
    waitingQueue.push({
      userId,
      side: waitingQueue.length % 2 === 0 ? "W" : "B",
      ws,
      opponentDetail: { name, image },
    });

    tryMatchPlayer("firstTry");
    console.log(waitingQueue);
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
  console.log("WebSocket server is running on ws://localhost:8080");
});
