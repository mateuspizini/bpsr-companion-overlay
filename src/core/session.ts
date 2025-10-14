import { Hit } from './types';

export class SessionManager {
  current: Hit[] = [];
  history: { id: string; boss?: string; startedAt: number; endedAt?: number; hits: Hit[] }[] = [];
  bossName?: string;

  start() { this.current = []; this.bossName = undefined; }
  stop() {
    const id = new Date().toISOString().replace(/[:.]/g, '-');
    const sess = { id, boss: this.bossName, startedAt: this.current[0]?.t ?? Date.now(), endedAt: Date.now(), hits: this.current };
    this.history.push(sess);
    return sess;
  }
  markBoss(name: string) { this.bossName = name; }
  clearBoss() { this.bossName = undefined; }
  add(hit: Hit) { if (this.bossName && hit.targetName === this.bossName) hit.isBossTarget = true; this.current.push(hit); }
}
