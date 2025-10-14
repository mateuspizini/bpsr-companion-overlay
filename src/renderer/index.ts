import { SessionManager } from '../core/session';
import { Capture } from '../core/capture';
import type { Hit } from '../core/types';

declare global { interface Window { api: any } }

const ses = new SessionManager();
let running = false;
let onlyParty = true;

const cap = new Capture();
cap.on('hit', (h: Hit) => { if (!running) return; ses.add(h); });
cap.on('error', (e:any) => console.error('capture', e));
cap.start();

const el = (id: string) => document.getElementById(id)!;
const $meDps = el('meDps');
const $meHps = el('meHps');
const $grpDps = el('grpDps');
const $grpHps = el('grpHps');
const $rdps = el('rdps');
const $rhps = el('rhps');
const $table = el('topTable');

(el('btnStart') as HTMLButtonElement).onclick = () => toggle();
(el('btnReset') as HTMLButtonElement).onclick = () => reset();
(el('btnClick') as HTMLButtonElement).onclick = async () => {
  const on = await window.api.toggleClick();
  (el('btnClick') as HTMLButtonElement).innerText = on? 'Passar cliques: ON':'Passar cliques: OFF';
};
(el('btnExportCSV') as HTMLButtonElement).onclick = () => exportCSV();
(el('btnExportJSON') as HTMLButtonElement).onclick = () => exportJSON();
(el('btnBoss') as HTMLButtonElement).onclick = () => ses.markBoss((el('bossName') as HTMLInputElement).value.trim());
(el('btnBossClear') as HTMLButtonElement).onclick = () => ses.clearBoss();
(el('onlyParty') as HTMLInputElement).onchange = (e:any) => onlyParty = e.target.checked;

window.api.onHotkey((t:string)=>{
  if(t==='start-stop') toggle();
  if(t==='reset') reset();
  if(t==='toggle-click') (el('btnClick') as HTMLButtonElement).click();
  if(t==='compact') document.querySelector('.overlay')?.classList.toggle('compact');
});

function toggle(){
  running = !running;
  if(running){
    (el('btnStart') as HTMLButtonElement).innerText = 'Pausar';
    if (ses.current.length === 0) ses.start();
  } else {
    (el('btnStart') as HTMLButtonElement).innerText = 'Iniciar';
    const sess = ses.stop();
    autoLog(sess);
  }
}

function reset(){
  ses.start();
  (el('btnStart') as HTMLButtonElement).innerText = running? 'Pausar':'Iniciar';
}

function stats(){
  const now = Date.now();
  const fiveAgo = now - 5000;
  const meId = 'you'; // TODO: se o feeder fornecer, substituir pelo ID real do jogador
  const cur = ses.current.filter(h=> !onlyParty || h.party);
  const secs = Math.max(((cur.at(-1)?.t ?? now) - (cur[0]?.t ?? now))/1000, 0.001);
  const sum = (f: (h:Hit)=>boolean) => cur.filter(f).reduce((a,h)=>a+h.amount,0);
  const rd = cur.filter(h=>h.t>=fiveAgo);
  const dps = sum(h=>h.type==='damage')/secs;
  const hps = sum(h=>h.type==='heal')/secs;
  const r_dps = rd.filter(h=>h.type==='damage').reduce((a,h)=>a+h.amount,0)/5;
  const r_hps = rd.filter(h=>h.type==='heal').reduce((a,h)=>a+h.amount,0)/5;
  const me_dps = sum(h=>h.type==='damage' && h.sourceId===meId)/secs;
  const me_hps = sum(h=>h.type==='heal' && h.sourceId===meId)/secs;
  $meDps.textContent = fmt(me_dps);
  $meHps.textContent = fmt(me_hps);
  $grpDps.textContent = fmt(dps);
  $grpHps.textContent = fmt(hps);
  $rdps.textContent = fmt(r_dps);
  $rhps.textContent = fmt(r_hps);
  renderTop(cur);
}

function renderTop(cur: Hit[]){
  const map = new Map<string,{name:string; d:number; h:number}>();
  for(const h of cur){
    const k = h.sourceId;
    const o = map.get(k) ?? { name: h.sourceName ?? k, d:0, h:0 };
    if(h.type==='damage') o.d += h.amount; else o.h += h.amount;
    map.set(k,o);
  }
  const arr = Array.from(map.values()).sort((a,b)=> b.d - a.d).slice(0,8);
  $table.innerHTML = '<div class="hdr">Jogador</div><div class="hdr">Dano</div><div class="hdr">Cura</div>' +
    arr.map(r=>`<div>${escapeHtml(r.name)}</div><div>${fmt0(r.d)}</div><div>${fmt0(r.h)}</div>`).join('');
}

function exportCSV(){
  const sess = ses.stop();
  const rows = [['time','source','target','type','amount','party','boss']];
  for(const h of sess.hits){ rows.push([h.t, h.sourceName??h.sourceId, h.targetName??h.targetId, h.type, h.amount, h.party?1:0, h.isBossTarget?1:0] as any); }
  const csv = rows.map(r=>r.join(',')).join('\n');
  window.api.saveFile({ name:`bpsr-${sess.id}.csv`, ext:'csv', data: csv });
  autoLog(sess, csv, 'csv');
}
function exportJSON(){
  const sess = ses.stop();
  const json = JSON.stringify(sess,null,2);
  window.api.saveFile({ name:`bpsr-${sess.id}.json`, ext:'json', data: json });
  autoLog(sess, json, 'json');
}

function autoLog(sess:any, data:string='', ext:'csv'|'json'='json'){
  const name = `bpsr-${sess.id}.${ext}`;
  window.api.autoLog({ name, data });
}

function fmt(n:number){ return n.toLocaleString('pt-BR', {maximumFractionDigits:1}) }
function fmt0(n:number){ return Math.round(n).toLocaleString('pt-BR') }
function escapeHtml(s:string){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'} as any)[m]); }

setInterval(stats, 250);
ses.start();
