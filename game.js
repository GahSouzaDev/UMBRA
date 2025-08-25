// game.js
// Ponto de entrada do jogo. Setup do canvas, input, loop principal, UI DOM, resize, cenas e integrações.

import { SceneManager } from "./scenes.js";
import { Net } from "./websocket.js";

// ---------- Input ----------
class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.jumpPressed = false;
    this.attackPressed = false;
    this.pausePressed = false;
    this.pointerTapped = false;

    // Estados de teclas para evitar repetição
    this._keysDown = new Set();

    // Eventos teclado
    window.addEventListener("keydown", (e) => this.onKeyDown(e), { passive: false });
    window.addEventListener("keyup", (e) => this.onKeyUp(e), { passive: false });

    // Eventos pointer/touch para detectar "tap"
    window.addEventListener("pointerdown", (e) => {
      this.pointerTapped = true;
      // Evita scroll em mobile
      if (e.pointerType === "touch") e.preventDefault();
    }, { passive: false });
  }

  onKeyDown(e) {
    const k = e.key.toLowerCase();
    // Limitar comportamentos default de setas e espaço
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      e.preventDefault();
    }
    if (this._keysDown.has(k)) return;
    this._keysDown.add(k);

    if (k === "a" || k === "arrowleft") this.left = true;
    if (k === "d" || k === "arrowright") this.right = true;
    if (k === " " || k === "z") this.jumpPressed = true;
    if (k === "x" || k === "c") this.attackPressed = true;
    if (k === "escape") this.pausePressed = true;
  }

  onKeyUp(e) {
    const k = e.key.toLowerCase();
    this._keysDown.delete(k);

    if (k === "a" || k === "arrowleft") this.left = false;
    if (k === "d" || k === "arrowright") this.right = false;
    // jumpPressed e attackPressed são eventos one-shot (consumidos no update)
  }

  // Mobile helpers
  pressLeft(v) { this.left = v; }
  pressRight(v) { this.right = v; }
  pressJump() { this.jumpPressed = true; }
  pressAttack() { this.attackPressed = true; }
  pressPause() { this.pausePressed = true; }

  anyPressed() {
    return this._keysDown.size > 0 || this.left || this.right || this.jumpPressed || this.attackPressed || this.pausePressed;
  }

  resetPressed() {
    this.pointerTapped = false;
  }
}

// ---------- Jogo ----------
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.input = new Input();
    this.sceneManager = new SceneManager(this);
    this.lastTime = performance.now();
    this.accum = 0;
    this.fixedDt = 1 / 60;
    this.fps = 0;

    // WebSocket (opcional)
    this.net = new Net();
    this.net.init("ws://localhost:8080");

    // UI DOM
    this.hudScore = document.getElementById("hud-score");
    this.hudHealth = document.getElementById("hud-health");
    this.hudLevel = document.getElementById("hud-level");
    this.pauseBtn = document.getElementById("pause-btn");
    this.fsBtn = document.getElementById("fs-btn");
    this.wsToggle = document.getElementById("ws-toggle");

    // Bind UI
    this.bindUI();

    // Mobile controls
    this.bindMobileControls();

    // Resize e DPI
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());

    // Inicia na cena de menu
    this.changeScene("menu");

    // Inicia loop
    requestAnimationFrame((t) => this.loop(t));
  }

  bindUI() {
    this.pauseBtn.addEventListener("click", () => {
      this.input.pressPause();
    });
    this.fsBtn.addEventListener("click", () => {
      this.toggleFullscreen();
    });
    this.wsToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        console.log("[UI] Online ativado");
        this.net.connect();
      } else {
        console.log("[UI] Online desativado");
        this.net.disconnect();
      }
    });
  }

  bindMobileControls() {
    const setHold = (el, fnDown, fnUp) => {
      const down = (e) => {
        e.preventDefault();
        fnDown();
      };
      const up = (e) => {
        e.preventDefault();
        fnUp();
      };
      el.addEventListener("touchstart", down, { passive: false });
      el.addEventListener("touchend", up, { passive: false });
      el.addEventListener("touchcancel", up, { passive: false });
      el.addEventListener("mousedown", down);
      el.addEventListener("mouseup", up);
      el.addEventListener("mouseleave", up);
    };

    const leftBtn = document.querySelector('[data-dir="left"]');
    const rightBtn = document.querySelector('[data-dir="right"]');
    const jumpBtn = document.querySelector('[data-action="jump"]');
    const attackBtn = document.querySelector('[data-action="attack"]');

    setHold(leftBtn, () => this.input.pressLeft(true), () => this.input.pressLeft(false));
    setHold(rightBtn, () => this.input.pressRight(true), () => this.input.pressRight(false));

    // Ações são one-shot (jump/attack), mas em mobile queremos permitir toques repetidos
    jumpBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.input.pressJump(); }, { passive: false });
    attackBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.input.pressAttack(); }, { passive: false });
    jumpBtn.addEventListener("mousedown", (e) => { e.preventDefault(); this.input.pressJump(); });
    attackBtn.addEventListener("mousedown", (e) => { e.preventDefault(); this.input.pressAttack(); });
  }

  updateHUD(player) {
    if (!player) return;
    this.hudScore.textContent = `Score: ${player.score}`;
    this.hudHealth.textContent = `Vida: ${player.health}`;
    this.hudLevel.textContent = `Fase: 1-1`;
  }

  handleResize() {
    // Mantém 16:9 responsivo e ajusta DPI
    const maxW = Math.min(window.innerWidth, 1280);
    const width = maxW;
    const height = Math.floor((width * 9) / 16);
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // limitar para performance

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = width;
    this.height = height;

    // Atualiza camera se cena de jogo estiver ativa
    if (this.sceneManager.current && this.sceneManager.current.camera) {
      this.sceneManager.current.camera.w = this.width;
      this.sceneManager.current.camera.h = this.height;
    }
    console.log("[Resize] canvas", this.canvas.width, "x", this.canvas.height, "dpr:", dpr);
  }

  toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(err => console.warn("Falha fullscreen:", err));
    } else {
      document.exitFullscreen?.();
    }
  }

  changeScene(name, data) {
    this.sceneManager.change(name, data);
  }

  loop(t) {
    const dt = Math.min(0.033, (t - this.lastTime) / 1000);
    this.lastTime = t;

    // FPS simples
    this.fps = Math.round(1 / dt);

    // Update e Render
    this.sceneManager.update(dt);
    this.sceneManager.render(this.ctx);

    // Reset flags one-shot
    this.input.resetPressed();

    requestAnimationFrame((tt) => this.loop(tt));
  }
}

// ---------- Bootstrap ----------
const canvas = document.getElementById("game");
const game = new Game(canvas);

// Expor para debug no console
window.__game = game;
console.log("[Bootstrap] jogo iniciado");