import { tryMatchPlayer, waitingQueueForRM } from "../server";

let queueIntervel: NodeJS.Timeout;

export function queueWorker(intervelTime: number) {
  console.log(
    "queueWorker running ",
    "waitingQueueForRMLength -> ",
    waitingQueueForRM.length,
    "intervalTime->",
    intervelTime
  );
  queueIntervel = setInterval(() => {
    tryMatchPlayer();
  }, intervelTime);
}

export function wakeTheQueueManipulator() {
  console.log("wakeTheQueeChecker wake up");

  setInterval(() => {
    if (queueIntervel) {
      clearInterval(queueIntervel);
    }
    const newQueueWorkerInterval = 1000 - waitingQueueForRM.length * 10;

    queueWorker(newQueueWorkerInterval);
  }, 5000);
}
