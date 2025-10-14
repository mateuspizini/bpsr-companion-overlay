import { Hit } from './types';

type Listener = (h: Hit) => void;

export class Capture {
  ws?: WebSocket;
  onHitListeners: Listener[] = [];
  onErrorListeners: ((e: any)=>void)[] = [];

  on(event: 'hit'|'error', cb: any) {
    if (event==='hit') this.onHitListeners.push(cb as Listener);
    else this.onErrorListeners.push(cb);
  }

  emitHit(h: Hit){ for(const cb of this.onHitListeners) cb(h); }
  emitError(e:any){ for(const cb of this.onErrorListeners) cb(e); }

  async start() {
    const targets = ['ws://127.0.0.1:8989/ws', 'ws://127.0.0.1:3000/ws'];
    for (const url of targets) {
      try {
        await this.tryConnect(url);
        return;
      } catch {}
    }
    console.warn('Nenhum feeder WS encontrado em ws://127.0.0.1:{8989,3000}/ws. Rode um contador compatível.');
  }

  async tryConnect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      let opened = false;
      ws.onopen = () => { opened = true; resolve(); };
      ws.onerror = (ev) => { if (!opened) reject(ev); else this.emitError(ev); };
      ws.onclose = () => { /* pode tentar reconectar aqui, se quiser */ };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer));
          if (msg && (msg.type==='hit' || msg.event==='hit' || msg.kind==='hit')) {
            const hit: Hit = {
              t: msg.t || Date.now(),
              sourceId: msg.sourceId ?? msg.srcId ?? 'unknown',
              targetId: msg.targetId ?? msg.tgtId ?? 'unknown',
              amount: Number(msg.amount || msg.value || 0),
              type: (msg.isHeal || msg.type === 'heal' || msg.hitType === 'heal') ? 'heal' : 'damage',
              sourceName: msg.sourceName ?? msg.srcName,
              targetName: msg.targetName ?? msg.tgtName,
              party: !!(msg.party ?? msg.isParty ?? msg.inParty)
            };
            this.emitHit(hit);
          }
        } catch (e) { this.emitError(e); }
      };
      this.ws = ws;
    });
  }
}
