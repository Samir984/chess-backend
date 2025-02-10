// src/types/types.ts
import { WebSocket } from "ws";

export type WaitingQueueForRMType = {
  userId: string;
  ws: WebSocket;
  createdAt: Date;
  side: "B" | "W";
  playerInfo: {
    name: string;
    image: string;
  };
};

export type GameQueueType = {
  status: string;
  p1: WaitingQueueForRMType;
  p2: WaitingQueueForRMType;
};
