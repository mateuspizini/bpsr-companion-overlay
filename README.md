# BPSR Companion Overlay (Windows, BRIDGE-only)

Overlay leve em **Electron/JS** para **Blue Protocol: Star Resonance**, com:
- **PT-BR** e **tema escuro** por padrão
- **Overlay clique-through** (não rouba foco)
- **Hotkeys**: `Ctrl+Alt+S` start/pause, `Ctrl+Alt+R` reset, `Ctrl+Alt+T` clique-through, `Ctrl+Alt+C` compacto
- **Export por luta**: **CSV/JSON**
- **Reset rápido**, **filtro de party**, **marcação de boss**
- **Log automático** em `%AppData%/BPSR Companion Overlay/logs`

> **Modo BRIDGE-only**: o app conecta a um **feeder** de eventos via WebSocket (ex.: ferramentas que expõem `ws://127.0.0.1:8989/ws` ou `:3000/ws`). Não modifica o jogo.

## Requisitos
- Windows 10/11
- Node.js 20+ (para rodar a partir do código) — **não é necessário para usar o instalador**
- (Para usar com dados reais) Um **feeder** compatível rodando localmente e expondo `ws://127.0.0.1:8989/ws` (ou `:3000/ws`).

## Baixar e instalar (GitHub Actions)
1. Vá em **Actions** → selecione o workflow **“Build Windows Installer”** → **Run workflow** (ou faça um push na branch `main`).
2. Ao finalizar, baixe o **Artifact** `bpsr-companion-win`.
3. Dentro dele, pegue:
   - `BPSR Companion Overlay Setup X.Y.Z.exe` (instalador), ou
   - `win-unpacked.zip` (portátil)

## Uso
1. Rode o **feeder** (deixa exposto `ws://127.0.0.1:8989/ws` ou `:3000/ws`).
2. Abra **BPSR Companion Overlay**.
3. O overlay se conecta sozinho (status instantâneo).
4. Hotkeys:
   - `Ctrl+Alt+S` iniciar/pausar sessão
   - `Ctrl+Alt+R` reset rápido
   - `Ctrl+Alt+T` alterna clique-through (o jogo recebe os cliques)
   - `Ctrl+Alt+C` modo compacto
5. Use **Export CSV/JSON** para salvar a luta. Logs automáticos ficam em `%AppData%/BPSR Companion Overlay/logs`.

## Desenvolvimento local (opcional)
```bash
npm ci
npm run start
```

## Build local (opcional)
```bash
# Instalador NSIS
npm run build
# Portátil
npx electron-builder --win portable
```

## Observações
- Este projeto é **standalone** e não altera o cliente do jogo.
- Suporte a **DPS/HPS pessoal e aliados próximos** depende do feed enviado pelo feeder (o overlay já tem filtro de party e marcação de boss).
- Projeto focado em **Windows**.
