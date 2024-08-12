import { WebSocket } from "ws";

export type WaitingQueueForRMType = {
  userId: string;
  ws: WebSocket;
  createdAt: Date;
  side: "W" | "B";
  opponentDetail: {
    name: string;
    image: string | null;
  };
};

export type GameQueueType = {
  status: string;
  p1: WaitingQueueForRMType;
  p2: WaitingQueueForRMType;
};
