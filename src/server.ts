import { WebSocketServer } from "ws";
import http from "http";
import { setupWebSocketServer } from "./chess/socket";
import { queueWorker, wakeTheQueueManipulator } from "./chess/gameQueue";

const server = http.createServer();
const wss = new WebSocketServer({ server });

setupWebSocketServer(wss);

server.listen(8080, () => {
  wakeTheQueueManipulator();
  queueWorker(1000);
  console.log("WebSocket server is running on ws://localhost:8080");
});
