// src/websocket-server.ts
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import url from "url";
import http from "http";
import { debuglog } from "util";

// type Games = {
//   gameId: string;
//   status: "RUNNING" | "PENDING";
// };

const server = http.createServer();
const wss = new WebSocketServer({ server });

const waitingQuees: any = [];

const gameQuees = [];

wss.on("connection", (ws, req) => {
  const reqUrl = req.url ? url.parse(req.url, true) : { query: {} as any };
  const { userId, gameMode } = reqUrl.query;

  console.log(userId);
  // adding user to gamequees
  if (userId) {
    waitingQuees.push({
      userId,
      ws,
    });
    console.log(waitingQuees);
  } else {
    ws.close();
    console.log("lost connectiob");
  }

  ws.on("message", (message) => {
    console.log(JSON.parse(message.toString()));
    const { type, data } = JSON.parse(message.toString());
    console.log(data);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("ddd", client.readyState, client.CLOSED);
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// interface Client extends WebSocket {
//   username?: string;
//   gameId?: string;
// }

// const games: { [key: string]: { [key: string]: Client } } = {};

// wss.on("connection", (ws: Client) => {
//   console.log("New client connected");

//   ws.on("message", (message: WebSocket.MessageEvent) => {
//     const data = JSON.parse(message.toString());
//     console.log(data)

//     switch (data.type) {
//       case "JOIN_GAME":
//         handleJoinGame(ws, data);
//         break;
//       case "MOVE_PIECE":
//         handleMovePiece(ws, data);
//         break;
//       // Add other message types as needed
//     }
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//     handleDisconnect(ws);
//   });

//   ws.on("error", (error: Error) => {
//     console.error("WebSocket error:", error);
//   });

//   ws.send("connctee succesfuly")
// });

// function handleJoinGame(ws: Client, data: any) {
//   const { gameId, username } = data;
//   ws.username = username;
//   ws.gameId = gameId;

//   if (!games[gameId]) {
//     games[gameId] = {};
//   }
//   games[gameId][username] = ws;

//   broadcastGameState(gameId, { type: "PLAYER_JOINED", username });
// }

// function handleMovePiece(ws: Client, data: any) {
//   const { gameId, move } = data;
//   broadcastGameState(gameId, { type: "MOVE_PIECE", move });
// }

// function broadcastGameState(gameId: string, state: any) {
//   const gameClients = games[gameId];
//   for (const username in gameClients) {
//     gameClients[username].send(JSON.stringify(state));
//   }
// }

// function handleDisconnect(ws: Client) {
//   const { gameId, username } = ws;
//   if (gameId && username && games[gameId]) {
//     delete games[gameId][username];
//     broadcastGameState(gameId, { type: "PLAYER_LEFT", username });
//   }
// }

server.listen(8080, () => {
  console.log("WebSocket server is running on ws://localhost:8080");
});
