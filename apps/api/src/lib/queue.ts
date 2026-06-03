import { EventEmitter } from "node:events";

type Task<T> = () => Promise<T>;

export class AnalysisQueue extends EventEmitter {
  private readonly concurrency: number;
  private readonly pending: Array<() => void> = [];
  private active = 0;

  constructor(concurrency = 2) {
    super();
    this.concurrency = concurrency;
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = () => {
        this.active += 1;
        void task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.active -= 1;
            this.emit("drain", { active: this.active, queued: this.pending.length });
            this.pump();
          });
      };

      this.pending.push(run);
      this.emit("enqueue", { active: this.active, queued: this.pending.length });
      this.pump();
    });
  }

  private pump(): void {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const next = this.pending.shift();
      next?.();
    }
  }
}
