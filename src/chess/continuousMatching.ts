import { tryMatchPlayer, waitingQueueForRM } from "../server";

let queueIntervel: NodeJS.Timeout;

//small intervel queue
export function queueWorker(intervelTime: number) {
  console.log(
    "queueWorker running ",
    "waitingQueueForRMLength -> ",
    waitingQueueForRM.length,
    "intervalTime->",
    intervelTime
  );
  queueIntervel = setInterval(() => {
    tryMatchPlayer("knock-knock");
  }, intervelTime);
}

//long intervel queue
export function wakeTheQueueManipulator() {
  console.log("wakeTheQueeChecker wake up");

  setInterval(() => {
    if (queueIntervel) {
      clearInterval(queueIntervel);
    }
    if (waitingQueueForRM.length > 0) {
      tryMatchPlayer("knock");
    }
    const newQueueWorkerInterval = 1000 - waitingQueueForRM.length * 10;
    queueWorker(newQueueWorkerInterval);
  }, 10000);
}
