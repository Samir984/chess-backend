import { WebSocketServer } from "ws";
import http from "http";
import { setupWebSocketServer } from "./chess/socket";
import { queueWorker, wakeTheQueueManipulator } from "./chess/gameQueue";

// Create a single HTTP server
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    console.log("Server running good");
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Server running ok");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Create a WebSocket server using the same HTTP server
const wss = new WebSocketServer({ server });

// Set up WebSocket server
setupWebSocketServer(wss);

// Start the server
server.listen(8080, () => {
  wakeTheQueueManipulator();
  queueWorker(1000);
  console.log(
    "Server is running on http://localhost:8080 and WebSocket server is running on ws://localhost:8080"
  );
});
