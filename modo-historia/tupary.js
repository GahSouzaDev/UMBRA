// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
// Física do jogo
GRAVITY: 0.6,
PLAYER_SPEED: 4,
JUMP_FORCE: 14,
PLAYER_WIDTH: 40, // Adicionado para controlar a largura do jogador
PLAYER_HEIGHT: 80, // Adicionado para controlar a altura do jogador (proporção 2x1)
CROUCH_HEIGHT: 40, // Metade da altura normal (ajustado para nova proporção)
NORMAL_HEIGHT: 80, // Altura normal do jogador (ajustado para nova proporção)

// Mundo
WORLD_WIDTH: 5000,
WORLD_HEIGHT: 450,
CAMERA_SMOOTHING: 0.08,

// Combate
DAMAGE_FLASH_DURATION: 200,
INVINCIBILITY_DURATION: 1000,

// Regeneração
MANA_REGEN_RATE: 1.5,
HEALTH_REGEN_RATE: 0.05,

// Partículas
MAX_PARTICLES: 200,
SNOW_SPAWN_RATE: 0.15,

// Performance
TARGET_FPS: 60,
DELTA_TIME_CAP: 32,

// Habilidades do Escolhido
UMBRA_FURY_DURATION: 7000, /* Mantido para a classe Chosen One */
UMBRA_FURY_DAMAGE_BOOST: 1.5, /* Mantido para a classe Chosen One */
UMBRA_FURY_SPEED_BOOST: 1.3, /* Mantido para a classe Chosen One */
UMBRA_FURY_DAMAGE_REDUCTION: 0.5, /* Mantido para a classe Chosen One */

// --- MODIFIED: CAMINHOS DE RECURSOS (AGORA COM SUPORTE A ANIMAÇÕES BASEADAS EM QUADROS) ---
ASSET_PATHS: {
    // Para player_idle, você precisaria de player_idle_00.png, player_idle_01.png, etc.
    player_idle_frames: Array.from({length: 6}, (_, i) => `../assets/personagens/Escolhido/escolhido-parado-${String(i).padStart(2, '0')}.png`), // NEW: Array of frame paths
    player_walk_frames: Array.from({length: 6}, (_, i) => `../assets/personagens/Escolhido/escolhido-andando-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for walk frames
    player_jump_frames: Array.from({length: 1}, (_, i) => `assets/personagens/Escolhido/jump/escolhido-salto-00.png`), // NEW: Placeholder for jump frames
    player_crouch_frames: Array.from({length: 1}, (_, i) => `assets/personagens/Escolhido/crouch/escolhido-abaixar-00.png`), // NEW: Placeholder for crouch frames
    player_attack_u_frames: Array.from({length: 3}, (_, i) => `../assets/personagens/Escolhido/escolhido-ataq-U-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for attack u frames
    player_attack_i_frames: Array.from({length: 4}, (_, i) => `../assets/personagens/Escolhido/escolhido-ataq-I-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for attack i frames
    player_attack_o_frames: Array.from({length: 3}, (_, i) => `../assets/personagens/Escolhido/escolhido-ataq-O-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for attack o frames
    player_ultimate_frames: Array.from({length: 4}, (_, i) => `assets/personagens/Escolhido/ultimate/escolhido-ultimate-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for ultimate frames
    player_damage_frames: Array.from({length: 4}, (_, i) => `../assets/personagens/Escolhido/escolhido-ataq-I-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for damage frames

    sentinel_sprite_frames: Array.from({length: 2}, (_, i) => `assets/inimigos/sentinela-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for sentinel frames
    tarek_sprite_frames: Array.from({length: 2}, (_, i) => `assets/bosses/tarek-${String(i).padStart(2, '0')}.png`), // NEW: Placeholder for tarek frames
    tarek_background: '../assets/fundos/gelo/muralhas-gelo.png', 
    
    // NOVO: Camadas de fundo para o efeito parallax
    // ATENÇÃO: Substitua esses caminhos pelos caminhos reais das suas imagens!
    background_layer_1: '../assets/fundos/gelo/fase1/fase1-1gelo.png', // A mais distante, menor velocidade
    background_layer_2: '../assets/fundos/gelo/fase1/fase1-nuvens-gelo.png', // Camada do meio
    background_layer_3: '', // A mais próxima, maior velocidade

    projectile_i: 'assets/sprites/effects/projectile_i.gif', // Original GIFs can still be used for static images or single-frame effects
    explosion_o: 'assets/sprites/effects/explosion_o.gif', 
    tarek_ice_orb: 'assets/sprites/effects/tarek_ice_orb.gif', 
    tarek_prison: 'assets/sprites/effects/tarek_prison.gif',

    cutscene_gif_1: '../assets/animacoes/AislinsVsFayra.gif', 

    music_menu: '../assets/musicas/gelo/inicio.mp3',
    music_platforming: '../assets/musicas/gelo/batalha na neve.mp3',
    music_boss_tarek: '../assets/musicas/gelo/batalha contra Tarek.mp3',
    sfx_jump: 'assets/audio/sfx/jump.mp3',
    sfx_attack_u: 'assets/audio/sfx/attack_u.mp3',
    sfx_ability_i: 'assets/audio/sfx/ability_i.mp3',
    sfx_ability_o: 'assets/audio/sfx/ability_o.mp3',
    sfx_ability_p: 'assets/audio/sfx/ability_p.mp3',
    sfx_damage_player: 'assets/audio/sfx/damage_player.mp3',
    sfx_damage_enemy: 'assets/audio/sfx/damage_enemy.mp3',
    sfx_level_up: 'assets/audio/sfx/level_up.mp3',
    sfx_boss_roar: 'assets/audio/sfx/boss_roar.mp3',
},
ASSET_LOADED: {} // Objeto para armazenar as imagens e AnimationManager carregados
// --- END MODIFIED ---
};

// ===== CLASSES DE ANIMAÇÃO =====
// Classe para gerenciar animações de sprites
class AnimationManager {
constructor(framesData, frameDelay = 100, loop = true) {
    // framesData é um array de { img: Image, loaded: boolean }
    this.frames = framesData;
    this.frameDelay = frameDelay; // Tempo em ms para cada frame
    this.loop = loop;
    this.currentFrameIndex = 0;
    this.frameTimer = 0; // Tempo acumulado para o próximo frame
    this.isPlaying = true;
    this.onFinishCallback = null; // Callback para animações não-looping
}

// Define o callback a ser chamado quando a animação não-looping termina
onFinish(callback) {
    this.onFinishCallback = callback;
    return this;
}

// Inicia ou retoma a animação
play() {
    this.isPlaying = true;
}

// Pausa a animação
pause() {
    this.isPlaying = false;
}

// Reseta a animação para o primeiro quadro e garante que está tocando
reset() {
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.isPlaying = true; 
}

// NOVO: Adiciona um método para definir se a animação deve fazer loop
setLoop(loop) {
    this.loop = loop;
}

// Atualiza o estado da animação (avança o quadro)
update(deltaTime) {
    if (!this.isPlaying || this.frames.length <= 1) return; // Não anima se só tem um frame ou está parado

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameDelay) {
        this.currentFrameIndex++;
        this.frameTimer = 0;

        if (this.currentFrameIndex >= this.frames.length) {
            if (this.loop) {
                this.currentFrameIndex = 0; // Volta para o início
            } else {
                this.currentFrameIndex = this.frames.length - 1; // Para no último quadro
                this.isPlaying = false; // Para a animação
                if (this.onFinishCallback) {
                    this.onFinishCallback(); // Chama o callback de término
                }
            }
        }
    }
}

// Retorna o objeto { img: Image, loaded: boolean } do quadro atual
getCurrentFrame() {
    if (this.frames.length === 0) return null;
    return this.frames[this.currentFrameIndex];
}

// --- NEW: Get current frame index for debugging ---
getCurrentFrameIndex() {
    return this.currentFrameIndex;
}
// --- END NEW ---
}

// ===== VARIÁVEIS GLOBAIS =====
let canvas, ctx;
let isMobile = false;
let isLandscape = true;

// Estado do jogo
let gameState = {
playerName: '',
playerClass: '', // Inicializa como string vazia
playerHealth: 100,
playerMaxHealth: 100,
playerMana: 100,
playerMaxMana: 100,
playerPosition: { x: 100, y: 300 },
playerVelocity: { x: 0, y: 0 },
playerLevel: 1,
playerXP: 0,
playerNextLevelXP: 100,
playerDamage: 15,
playerSpeed: CONFIG.PLAYER_SPEED,

// Estados do Jogador
isGrounded: false,
isCrouching: false,
isInvincible: false,
invincibilityTimer: 0,
facing: 'right',
currentAnimation: 'idle', // String que define a animação atual (ex: 'idle', 'walk', 'jump')
isUmbraFurious: false, /* Mantido para demonstração da ultimate do Escolhido Original */
umbraFuryTimer: 0,

// Habilidades (cooldowns dinâmicos)
abilitiesCooldown: { U: 0, I: 0, O: 0, P: 0 },
abilitiesMaxCooldown: { U: 0.5, I: 2, O: 4, P: 20 },

// Controle de jogo
gamePaused: false,
inDialog: false,
inCutscene: false,
inMenu: true,
gameStarted: false,

// Câmera
cameraOffset: { x: 0, y: 0 },
targetCameraOffset: { x: 0, y: 0 },

// Fase atual
currentPhase: 0,
currentCheckpoint: 'start',

// Boss fight
inBossFight: false,
bossDefeated: false,

// Tarek Encounter
inTarekEncounter: false,
tarekDialogStep: 0,
tarekDialogCompleted: false, // NOVO: Flag para evitar re-trigger do diálogo de Tarek
tarekEncounterTriggerX: 5500, // NOVO: Posição X para iniciar o encontro com Tarek

// Fixed camera for specific encounters
fixedCamera: false,
fixedCameraTarget: { x: 0, y: 0 }
};

// Arrays de entidades
let platforms = [];
let particles = [];
let backgroundLayers = []; // MODIFIED: Will now store image asset keys and parallax speeds
let enemies = [];
let abilityEffects = [];
let damageNumbers = [];
let checkpoints = [];
let fallingSpikes = [];

// Controles
let keys = {};
let lastTime = 0;
let animationFrameId = null;

// Mobile controls (D-pad)
let mobileControls = {
up: false,
down: false,
left: false,
right: false,
};

// Classes de Personagem
let championClasses = {};
let currentChampion = null;

// Variáveis de estado UI para otimização
let lastPlayerHealth = -1;
let lastPlayerMana = -1;
let lastPlayerXP = -1;
let lastPlayerLevel = -1;
let lastPlayerClass = '';
let lastPlayerDamage = -1;

// Pré-cálculo de cores CSS para performance
let COLOR_HEALTH, COLOR_MANA, COLOR_XP, COLOR_ACCENT_FIRE, COLOR_ACCENT_GOLD, COLOR_ACCENT_BLUE, COLOR_ACCENT_ICE, COLOR_TEXT_LIGHT, COLOR_UMBRA, COLOR_WARRIOR; // Renomeado COLOR_ARCHER para COLOR_UMBRA

let ASSETS_LOADED_COUNT = 0;
let TOTAL_ASSETS_TO_LOAD = 0;

// Global variables for cutscene management
let introSequence = []; // Will be populated by showIntroCutscene
let currentSequenceIndex = 0;

// Gerenciadores de animação para o jogador e inimigos
let playerAnimation = null;
let sentinelAnimation = null;
let tarekAnimation = null; // NOVO: Gerenciador de animação para o Tarek

// ===== SISTEMA DE ÁUDIO =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSources = {};
let currentMusic = null;

async function loadSound(name, url) {
try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioSources[name] = audioBuffer;
} catch (error) {
    //console.error(`Erro ao carregar o áudio '${name}':`, error);
    audioSources[name] = audioContext.createBuffer(2, 22050, 44100); /* Buffer vazio para evitar erros */
} finally {
    ASSETS_LOADED_COUNT++; // Incrementa o contador de assets carregados
}
}

function playSound(name, volume = 1.0) {
if (!audioSources[name]) {
    //console.warn(`Áudio '${name}' não carregado.`);
    return;
}
try {
    const source = audioContext.createBufferSource();
    source.buffer = audioSources[name];
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume * gameSettings.sfxVolume;
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
} catch (error) {
    //.error("Erro ao reproduzir som:", error);
}
}

function playMusic(name, loop = true, volume = 0.7) {
if (currentMusic) {
    try {
        currentMusic.stop();
    } catch (error) {
        //console.error("Erro ao parar música anterior:", error);
    }
    currentMusic = null;
}

if (!audioSources[name]) {
    //console.warn(`Música '${name}' não carregada.`);
    return;
}

try {
    const source = audioContext.createBufferSource();
    source.buffer = audioSources[name];
    source.loop = loop;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume * gameSettings.musicVolume;
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
    currentMusic = source;
} catch (error) {
    //console.error("Erro ao reproduzir música:", error);
}
}

function stopMusic() {
if (currentMusic) {
    try {
        currentMusic.stop();
    } catch (error) {
        //console.error("Erro ao parar música:", error);
    }
    currentMusic = null;
}
}

// ===== DETECÇÃO DE DISPOSITIVO =====
function detectDevice() {
isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            window.innerWidth <= 800 || 
            'ontouchstart' in window;

if (isMobile) {
    checkOrientation();
    window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientation, 100);
    });
    window.addEventListener('resize', checkOrientation);
}
}

function checkOrientation() {
if (!isMobile) return;

isLandscape = window.innerWidth > window.innerHeight;
const orientationWarning = document.getElementById('orientation-warning');

if (!isLandscape) {
    orientationWarning.style.display = 'flex';
    if (gameState.gameStarted && !gameState.gamePaused && !gameState.inMenu) {
        togglePause();
    }
} else {
    orientationWarning.style.display = 'none';
    // Only unpause if game was previously paused by orientation change
    if (gameState.gameStarted && gameState.gamePaused && !gameState.inMenu && !gameState.inCutscene && !gameState.inDialog) {
        togglePause();
    }
}
updateMobileControlsVisibility();
}

// ===== SISTEMA DE COOKIES =====
function setCookie(name, value, days = 30) {
const expires = new Date();
expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
const nameEQ = name + "=";
const ca = document.cookie.split(';');
for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
}
return null;
}

function saveProgress() {
const saveData = {
    playerName: gameState.playerName,
    playerClass: gameState.playerClass,
    playerLevel: gameState.playerLevel,
    playerXP: gameState.playerXP,
    playerNextLevelXP: gameState.playerNextLevelXP, // NOVO: Salvar XP para próximo nível
    playerMaxHealth: gameState.playerMaxHealth,
    playerMaxMana: gameState.playerMaxMana,
    playerDamage: gameState.playerDamage,
    playerSpeed: gameState.playerSpeed,
    currentPhase: gameState.currentPhase,
    currentCheckpoint: gameState.currentCheckpoint,
    bossDefeated: gameState.bossDefeated,
    abilitiesMaxCooldown: gameState.abilitiesMaxCooldown,
    manaRegenRate: CONFIG.MANA_REGEN_RATE,
    tarekDialogCompleted: gameState.tarekDialogCompleted // NOVO: Salvar estado do diálogo Tarek
};

setCookie('tupary_save', JSON.stringify(saveData));
showCheckpointNotification('Progresso Salvo', 'Seu progresso foi salvo com sucesso!');
}

function loadProgress() {
const saveData = getCookie('tupary_save');
if (saveData) {
    try {
        const data = JSON.parse(saveData);
        return data;
    } catch (e) {
        //console.error('Erro ao carregar save:', e);
    }
}
return null;
}

// ===== INICIALIZAÇÃO =====
async function init() {
detectDevice();

canvas = document.getElementById('game-canvas');
ctx = canvas.getContext('2d');

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

initGlobalColors(); // Cores precisam estar disponíveis antes do carregamento de assets para o placeholder
await loadAllAssets(); // NOVO: Carrega todos os assets (imagens e sons)

initChampionClasses();
initEventListeners();
initMobileControls();

const savedData = loadProgress();
if (savedData) {
    populateMainMenuWithSavedData(savedData);
} else {
    playMusic('music_menu', true);
}

gameLoop(0);
}

// --- MODIFIED: Nova função para carregar todos os assets (imagens e sons) ---
async function loadAllAssets() {
const assetPromises = [];

// Calculate total assets for loading progress (if you want a loading bar)
TOTAL_ASSETS_TO_LOAD = 0;
for (const [key, path] of Object.entries(CONFIG.ASSET_PATHS)) {
    if (Array.isArray(path)) { // For frame arrays
        TOTAL_ASSETS_TO_LOAD += path.length;
    } else { // For single files
        TOTAL_ASSETS_TO_LOAD++;
    }
}

for (const [key, path] of Object.entries(CONFIG.ASSET_PATHS)) {
    if (Array.isArray(path)) { // Handle arrays of frame paths
        CONFIG.ASSET_LOADED[key] = []; // Initialize as array for frames
        for (const framePath of path) {
            assetPromises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.src = framePath;
                img.onload = () => {
                    CONFIG.ASSET_LOADED[key].push({ img: img, loaded: true }); 
                    ASSETS_LOADED_COUNT++;
                    // console.log(`Imagem carregada: ${framePath} (${ASSETS_LOADED_COUNT}/${TOTAL_ASSETS_TO_LOAD})`);
                    resolve();
                };
                img.onerror = (e) => {
                    //console.error(`Erro ao carregar imagem '${key}' de '${framePath}':`, e);
                    const placeholder = new Image();
                    placeholder.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent
                    CONFIG.ASSET_LOADED[key].push({ img: placeholder, loaded: false }); // Store loaded: false
                    ASSETS_LOADED_COUNT++;
                    resolve(); 
                };
            }));
        }
    } else if (path.endsWith('.gif') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        assetPromises.push(new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                CONFIG.ASSET_LOADED[key] = { img: img, loaded: true }; 
                ASSETS_LOADED_COUNT++;
                // console.log(`Imagem carregada: ${path} (${ASSETS_LOADED_COUNT}/${TOTAL_ASSETS_TO_LOAD})`);
                resolve();
            };
            img.onerror = (e) => {
                //console.error(`Erro ao carregar imagem '${key}' de '${path}':`, e);
                const placeholder = new Image();
                placeholder.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent
                CONFIG.ASSET_LOADED[key] = { img: placeholder, loaded: false };
                ASSETS_LOADED_COUNT++;
                resolve(); 
            };
        }));
    } else if (path.endsWith('.mp3') || path.endsWith('.wav')) {
        assetPromises.push(loadSound(key, path));
    }
}
await Promise.all(assetPromises);
//console.log("Todos os assets carregados.");

// Inicializar os AnimationManagers após carregar todos os assets com os arrays de frames
playerAnimation = {
    idle: new AnimationManager(CONFIG.ASSET_LOADED.player_idle_frames, 150),
    walk: new AnimationManager(CONFIG.ASSET_LOADED.player_walk_frames, 100),
    jump: new AnimationManager(CONFIG.ASSET_LOADED.player_jump_frames, 100, false), 
    crouch: new AnimationManager(CONFIG.ASSET_LOADED.player_crouch_frames, 100),
    attack_u: new AnimationManager(CONFIG.ASSET_LOADED.player_attack_u_frames, 80, false).onFinish(() => gameState.currentAnimation = 'idle'),
    attack_i: new AnimationManager(CONFIG.ASSET_LOADED.player_attack_i_frames, 100, false).onFinish(() => gameState.currentAnimation = 'idle'),
    attack_o: new AnimationManager(CONFIG.ASSET_LOADED.player_attack_o_frames, 120, false).onFinish(() => gameState.currentAnimation = 'idle'),
    ultimate: new AnimationManager(CONFIG.ASSET_LOADED.player_ultimate_frames, 100).setLoop(true), /* Mantido para Chosen One */
    take_damage: new AnimationManager(CONFIG.ASSET_LOADED.player_damage_frames, 200, false).onFinish(() => gameState.currentAnimation = 'idle')
};

sentinelAnimation = new AnimationManager(CONFIG.ASSET_LOADED.sentinel_sprite_frames, 150); 
tarekAnimation = new AnimationManager(CONFIG.ASSET_LOADED.tarek_sprite_frames, 150); 
}
// --- END MODIFIED ---

/* Nova função: Pré-calcula cores CSS para acesso mais rápido */
function initGlobalColors() {
const rootStyle = getComputedStyle(document.documentElement);
COLOR_HEALTH = rootStyle.getPropertyValue('--health-color');
COLOR_MANA = rootStyle.getPropertyValue('--mana-color');
COLOR_XP = rootStyle.getPropertyValue('--xp-color');
COLOR_ACCENT_FIRE = rootStyle.getPropertyValue('--accent-fire');
COLOR_ACCENT_GOLD = rootStyle.getPropertyValue('--accent-gold');
COLOR_ACCENT_BLUE = rootStyle.getPropertyValue('--accent-blue');
COLOR_ACCENT_ICE = rootStyle.getPropertyValue('--accent-ice');
COLOR_TEXT_LIGHT = rootStyle.getPropertyValue('--text-light');
COLOR_UMBRA = rootStyle.getPropertyValue('--umbra-color'); // Renomeado de COLOR_ARCHER para COLOR_UMBRA
COLOR_WARRIOR = rootStyle.getPropertyValue('--warrior-color');
}

function resizeCanvas() {
const container = document.getElementById('game-container');
const rect = container.getBoundingClientRect();

canvas.width = rect.width;
canvas.height = rect.height;

if (isMobile) {
    updateMobileControlsVisibility();
}
}

function populateMainMenuWithSavedData(savedData) {
document.getElementById('player-name').value = savedData.playerName || '';
if (savedData.playerClass) {
    // Adiciona a classe 'selected' visualmente
    document.querySelector(`[data-class="${savedData.playerClass}"]`)?.classList.add('selected');
    // NOVO: Garantir que o playerClass do gameState seja restaurado,
    // já que validateMenuInputs agora confia mais nele.
    gameState.playerClass = savedData.playerClass; 
}
validateMenuInputs();

// Restaurar apenas os estados relevantes para o jogo, se já estiver iniciado
if (savedData.gameStarted && !savedData.inMenu) {
    // Restaurar estados específicos para evitar problemas
    gameState.playerName = savedData.playerName;
    gameState.playerClass = savedData.playerClass;
    gameState.playerLevel = savedData.playerLevel;
    gameState.playerXP = savedData.playerXP;
    gameState.playerNextLevelXP = savedData.playerNextLevelXP;
    gameState.playerMaxHealth = savedData.playerMaxHealth;
    gameState.playerMaxMana = savedData.playerMaxMana;
    gameState.playerDamage = savedData.playerDamage;
    gameState.playerSpeed = savedData.playerSpeed;
    gameState.currentPhase = savedData.currentPhase;
    gameState.currentCheckpoint = savedData.currentCheckpoint;
    gameState.bossDefeated = savedData.bossDefeated;
    Object.assign(gameState.abilitiesMaxCooldown, savedData.abilitiesMaxCooldown);
    CONFIG.MANA_REGEN_RATE = savedData.manaRegenRate;
    gameState.tarekDialogCompleted = savedData.tarekDialogCompleted;

    document.getElementById('main-menu').style.display = 'none';
    loadPhase(gameState.currentPhase);
    setupCharacter(gameState.playerClass, gameState.playerMaxHealth, gameState.playerMaxMana, gameState.playerDamage, gameState.playerSpeed, gameState.abilitiesMaxCooldown, gameState.manaRegenRate);
    updateAllUI();
    // Verifica se era uma fase de boss para tocar a música correta
    if (gameState.inBossFight) {
        playMusic('music_boss_tarek', true);
    } else {
        playMusic('music_platforming', true);
    }
}
}

// ===== CLASSES DE PERSONAGEM =====
function initChampionClasses() {
championClasses = {
    umbraArcher: { // Renomeado de 'archer' para 'umbraArcher'
        id: 'umbraArcher',
        name: 'Atirador(a) de Umbra',
        type: 'ranged',
        baseHealth: 90,
        baseMana: 140,
        baseSpeed: 4.5,
        baseDamage: 12,
        abilitiesMaxCooldown: { U: 0.6, I: 5, O: 4, P: 15 }, // Cooldown da ultimate alterado
        manaRegenRate: 1.8,
        abilities: [
            {
                key: 'U',
                name: 'Tiro Sombrio',
                description: 'Dispara um projétil de energia sombria à distância.',
                damage: (base) => base * 1.2,
                manaCost: 0,
                cooldown: 0.6,
                execute: function() {
                    playSound('sfx_attack_u');
                    gameState.currentAnimation = 'attack_u'; // Ativa animação de ataque
                    playerAnimation.attack_u.reset(); // Reinicia animação de ataque
                    addAbilityEffect({
                        type: 'energyProjectile',
                        x: gameState.playerPosition.x + (gameState.facing === 'right' ? 55 : -25),
                        y: gameState.playerPosition.y + 20,
                        width: 25,
                        height: 8,
                        duration: 1500,
                        damage: this.damage(gameState.playerDamage),
                        direction: gameState.facing === 'right' ? 1 : -1,
                        speed: 8,
                        origin: 'player',
                        piercing: false
                    });
                }
            },
            {
                key: 'I',
                name: 'Sombra Ágil',
                description: 'Deslocamento rápido que atravessa inimigos e concede invulnerabilidade temporária.',
                damage: (base) => base * 1.0,
                manaCost: 25,
                cooldown: 5,
                execute: function() {
                    playSound('sfx_ability_i');
                    gameState.currentAnimation = 'attack_i'; // Ativa animação
                    playerAnimation.attack_i.reset();
                    gameState.playerVelocity.x = (gameState.facing === 'right' ? 12 : -12);
                    gameState.isInvincible = true;
                    gameState.invincibilityTimer = 1000;
                    addParticles('dashUmbra', gameState.playerPosition.x + 25, gameState.playerPosition.y + 25, 200); // Partículas de Umbra
                }
            },
            {
                key: 'O',
                name: 'Orbe Etéreo',
                description: 'Lança um orbe de energia sombria que perfura múltiplos inimigos.',
                damage: (base) => base * 1.8,
                manaCost: 35,
                cooldown: 4,
                execute: function() {
                    playSound('sfx_ability_o');
                    gameState.currentAnimation = 'attack_o'; // Ativa animação
                    playerAnimation.attack_o.reset();
                    addAbilityEffect({
                        type: 'energyProjectile',
                        x: gameState.playerPosition.x + (gameState.facing === 'right' ? 55 : -25),
                        y: gameState.playerPosition.y + 20,
                        width: 35,
                        height: 35,
                        duration: 3000,
                        damage: this.damage(gameState.playerDamage),
                        direction: gameState.facing === 'right' ? 1 : -1,
                        speed: 6,
                        origin: 'player',
                        piercing: true,
                        hitTargets: []
                    });
                }
            },
            {
                key: 'P',
                name: 'Muralha de Umbra', // NOVO: Nome da Ultimate
                description: 'Invoca uma muralha de energia sombria que bloqueia projéteis inimigos e causa dano ao ser atravessada por inimigos. A muralha é destruída se um inimigo a atravessar.', // NOVO: Descrição
                damage: (base) => base * 3.5, // NOVO: Dano da muralha
                manaCost: 45, // NOVO: Custo de mana
                cooldown: 10, // NOVO: Cooldown
                execute: function() {
                    playSound('sfx_ability_p');
                    // Posição da muralha (50px de largura, centralizada no X, 100px mais alta que o jogador)
                    const wallWidth = 50;
                    const wallHeight = CONFIG.NORMAL_HEIGHT + 100; // Muralha é mais alta que o jogador
                    const wallX = gameState.playerPosition.x + (gameState.facing === 'right' ? 80 : -80) - (wallWidth / 2);
                    const wallY = gameState.playerPosition.y - 100; // Começa 100px acima do player Y

                    addAbilityEffect({
                        type: 'umbraWall',
                        x: wallX,
                        y: wallY,
                        width: wallWidth,
                        height: wallHeight,
                        duration: 5000, // Muralha dura 5 segundos
                        damage: this.damage(gameState.playerDamage),
                        origin: 'player',
                        piercing: false, // Não é um projétil, é uma barreira
                        hitTargets: [], // Para rastrear inimigos atingidos (embora ela se autodestrua)
                        protective: true, // Indica que bloqueia projéteis
                        lifetimeDamageInterval: 500 // Intervalo para aplicar dano a inimigos que tentam atravessar
                    });
                    // Remove flags da ultimate antiga se ainda existirem
                    gameState.isUmbraFurious = false;
                    gameState.umbraFuryTimer = 0;
                }
            }
        ]
    },
    /* A classe 'warrior' foi removida. */
    chosenOne: {
        id: 'chosenOne',
        name: 'Escolhido Original',
        type: 'hybrid',
        baseHealth: 100, baseMana: 100, baseSpeed: 4, baseDamage: 15,
        abilitiesMaxCooldown: { U: 0.5, I: 2, O: 4, P: 20 },
        manaRegenRate: 1.5,
        abilities: [ /* Habilidades dummy, a ultimate 'P' é a relevante */
            { key: 'U', name: 'Ataque Rápido', description: 'Golpe ágil de curta distância.', damage: (base) => base * 1.0, manaCost: 0, cooldown: 0.5, execute: () => {
                gameState.currentAnimation = 'attack_u'; playerAnimation.attack_u.reset();
            } },
            { key: 'I', name: 'Projétil de Energia', description: 'Lança um projétil rápido à distância.', damage: (base) => base * 1.0, manaCost: 15, cooldown: 2, execute: () => {
                gameState.currentAnimation = 'attack_i'; playerAnimation.attack_i.reset();
            } },
            { key: 'O', name: 'Explosão Arcana', description: 'Causa uma explosão de energia.', damage: (base) => base * 1.8, manaCost: 30, cooldown: 4, execute: () => {
                gameState.currentAnimation = 'attack_o'; playerAnimation.attack_o.reset();
            } },
            { key: 'P', name: 'Fúria de Umbra', description: 'Canaliza a energia de Umbra para ficar mais rápido, resistente e poderoso no ataque.', damage: (base) => base, manaCost: 50, cooldown: 20,
                execute: function() {
                    playSound('sfx_ability_p');
                    gameState.isUmbraFurious = true;
                    gameState.umbraFuryTimer = CONFIG.UMBRA_FURY_DURATION;
                    gameState.currentAnimation = 'ultimate';
                    playerAnimation.ultimate.reset();
                }
            }
        ]
    }
};
}

// New helper functions to manage overlay menus
function activateOverlayMenu(menuElementId) {
const menu = document.getElementById(menuElementId);
if (menu) {
    // Use 'flex' or 'block' based on how the menu is styled in CSS
    menu.style.display = menu.classList.contains('cinematic-overlay') || menu.classList.contains('pause-menu') || menu.classList.contains('dialog-container') ? 'flex' : 'block';
    menu.style.pointerEvents = 'auto'; // Explicitly enable pointer events
    // Special case for level-up to apply its animation
    if (menuElementId === 'level-up') {
        menu.style.animation = 'levelUpAnimation 0.8s forwards';
    }
    // console.log(`Menu activated: ${menuElementId}`);
} else {
    //console.warn(`Attempted to activate non-existent menu: ${menuElementId}`);
}
}

function deactivateOverlayMenu(menuElementId) {
const menu = document.getElementById(menuElementId);
if (menu) {
    menu.style.display = 'none';
    menu.style.pointerEvents = 'none'; // Explicitly disable pointer events when hidden
    // Clear animation for level-up when it hides
    if (menuElementId === 'level-up') {
        menu.style.animation = '';
    }
    // console.log(`Menu deactivated: ${menuElementId}`);
} else {
    //console.warn(`Attempted to deactivate non-existent menu: ${menuElementId}`);
}
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
/* Menu Principal */
document.getElementById('player-name').addEventListener('input', validateMenuInputs);
document.getElementById('player-name').addEventListener('keydown', handlePlayerNameEnter); /* NEW: Handle Enter key on name input */
document.querySelectorAll('.class-option').forEach(option => {
    option.addEventListener('click', (e) => {
        const className = e.currentTarget.dataset.class;
        selectClass(className);
    });
});
document.getElementById('start-game-btn').addEventListener('click', startGame);

/* Controles de teclado */
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

/* Botões da UI */
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen); /* NEW: Fullscreen button listener */
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('restart-btn').addEventListener('click', restartFromCheckpoint);
document.getElementById('save-btn').addEventListener('click', saveProgress);
document.getElementById('exit-btn').addEventListener('click', exitToMenu);
document.getElementById('skip-btn').addEventListener('click', showNextSequenceStep); // Ligado à função global de avanço de cutscene

/* Habilidades desktop e mobile */
document.querySelectorAll('.ability-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const key = e.currentTarget.dataset.key;
        if (key) useAbility(key);
    });
    // NOVO: Adiciona suporte a toque para dispositivos móveis
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Previne o clique "fantasma" após o toque
        const key = e.currentTarget.dataset.key;
        if (key) useAbility(key);
    });
});

/* Level up (com escolhas) */
document.querySelectorAll('.upgrade-option').forEach(option => {
    option.addEventListener('click', (e) => {
        const upgrade = e.currentTarget.dataset.upgrade;
        applyUpgrade(upgrade);
    });
});
}

/* NEW: Handle Enter key press on player name input */
function handlePlayerNameEnter(e) {
if (e.key === 'Enter' && gameState.inMenu) {
    const startBtn = document.getElementById('start-game-btn');
    if (!startBtn.disabled) {
        startGame();
        e.preventDefault(); // Prevent default Enter behavior
    }
}
}

function handleKeyDown(e) {
if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
}
keys[e.key.toLowerCase()] = true;

if (e.key === 'Escape' && gameState.gameStarted && !gameState.inMenu && !gameState.inCutscene) {
    togglePause();
}

if ((e.key === ' ' || e.key === 'Enter') && gameState.inCutscene) {
    showNextSequenceStep(); // Avança a cutscene com Espaço/Enter
}

if (['u', 'i', 'o', 'p'].includes(e.key.toLowerCase()) && 
    !gameState.gamePaused && !gameState.inDialog && !gameState.inCutscene && !gameState.inMenu) {
    useAbility(e.key.toUpperCase());
}
}

function handleKeyUp(e) {
keys[e.key.toLowerCase()] = false;
}

// ===== CONTROLES MOBILE =====
function initMobileControls() {
/* D-pad */
document.getElementById('mobile-up').addEventListener('touchstart', (e) => { e.preventDefault(); mobileControls.up = true; });
document.getElementById('mobile-up').addEventListener('touchend', () => mobileControls.up = false);
document.getElementById('mobile-down').addEventListener('touchstart', (e) => { e.preventDefault(); mobileControls.down = true; });
document.getElementById('mobile-down').addEventListener('touchend', () => mobileControls.down = false);
document.getElementById('mobile-left').addEventListener('touchstart', (e) => { e.preventDefault(); mobileControls.left = true; });
document.getElementById('mobile-left').addEventListener('touchend', () => mobileControls.left = false);
document.getElementById('mobile-right').addEventListener('touchstart', (e) => { e.preventDefault(); mobileControls.right = true; });
document.getElementById('mobile-right').addEventListener('touchend', () => mobileControls.right = false);

// Botões de Habilidade MOBILE-ACTION-BUTTONS REMOVIDOS - Usar os botões desktop/UI
updateMobileControlsVisibility();
}

function updateMobileControlsVisibility() {
const mobileControlsDiv = document.getElementById('mobile-controls');
// NOVO: Apenas o D-pad é controlado aqui. Os botões de habilidade desktop são sempre visíveis.
if (isMobile && isLandscape) {
    mobileControlsDiv.style.display = 'grid';
} else {
    mobileControlsDiv.style.display = 'none';
}
}

// ===== MENU PRINCIPAL =====
function validateMenuInputs() {
const name = document.getElementById('player-name').value.trim();
// --- LINHA MODIFICADA AQUI ---
// Antes: const selectedClass = document.querySelector('.class-option.selected');
// Agora: Verifica diretamente se gameState.playerClass tem um valor (ou seja, foi selecionado)
const classIsSelected = !!gameState.playerClass; 
// -----------------------------
const startBtn = document.getElementById('start-game-btn');

if (name.length >= 2 && classIsSelected) {
    startBtn.disabled = false;
} else {
    startBtn.disabled = true;
}
}

function selectClass(className) {
document.querySelectorAll('.class-option').forEach(option => {
    option.classList.remove('selected');
});
const selectedOption = document.querySelector(`[data-class="${className}"]`);
if (selectedOption) {
    selectedOption.classList.add('selected');
    gameState.playerClass = className; // ISSO É IMPORTANTE: Define a classe no estado do jogo
    validateMenuInputs(); // Chama a validação após a seleção
}
}

function startGame() {
const name = document.getElementById('player-name').value.trim();
if (name.length < 2 || !gameState.playerClass) return; // Garante que a classe foi selecionada

gameState.playerName = name;
gameState.inMenu = false;
gameState.gameStarted = true;

document.getElementById('main-menu').style.display = 'none';

setupCharacter(gameState.playerClass);

if (isMobile) {
    updateMobileControlsVisibility();
}

stopMusic();
showIntroCutscene(); // Inicia a cutscene
}

/* Adaptação de setupCharacter para receber apenas o nome da classe, ou dados salvos */
function setupCharacter(playerClass, health = null, mana = null, damage = null, speed = null, abilitiesMaxCooldown = null, manaRegenRate = null) {
currentChampion = championClasses[playerClass];

gameState.playerMaxHealth = health !== null ? health : currentChampion.baseHealth;
gameState.playerHealth = gameState.playerMaxHealth;
gameState.playerMaxMana = mana !== null ? mana : currentChampion.baseMana;
gameState.playerMana = gameState.playerMaxMana;
gameState.playerSpeed = speed !== null ? speed : currentChampion.baseSpeed;
gameState.playerDamage = damage !== null ? damage : currentChampion.baseDamage;

/* Sobrescreve os cooldowns e taxa de regeneração com os da classe ou salvos */
Object.assign(gameState.abilitiesMaxCooldown, abilitiesMaxCooldown !== null ? abilitiesMaxCooldown : currentChampion.abilitiesMaxCooldown);
CONFIG.MANA_REGEN_RATE = manaRegenRate !== null ? manaRegenRate : currentChampion.manaRegenRate;

updateAbilityTooltips();
updateAllUI();
}

function updateAbilityTooltips() {
if (!currentChampion) return;

currentChampion.abilities.forEach(ability => {
    const key = ability.key.toLowerCase();
    const nameEl = document.getElementById(`tooltip-${key}-name`);
    const descEl = document.getElementById(`tooltip-${key}-desc`);
    const costEl = document.getElementById(`tooltip-${key}-cost`);
    
    if (nameEl) nameEl.textContent = ability.name;
    if (descEl) descEl.textContent = ability.description;
    if (costEl) costEl.textContent = `Custo: ${ability.manaCost} Mana`;
});
}

function exitToMenu() {
saveProgress();

/* Reinicia o estado do jogo para o menu principal */
gameState = {
    playerName: '',
    playerClass: '',
    playerHealth: 100, playerMaxHealth: 100,
    playerMana: 100, playerMaxMana: 100,
    playerPosition: { x: 100, y: 300 },
    playerVelocity: { x: 0, y: 0 },
    playerLevel: 1, playerXP: 0, playerNextLevelXP: 100,
    playerDamage: 15, playerSpeed: CONFIG.PLAYER_SPEED,
    isGrounded: false, isCrouching: false, isInvincible: false, facing: 'right', currentAnimation: 'idle',
    isUmbraFurious: false, umbraFuryTimer: 0,
    abilitiesCooldown: { U: 0, I: 0, O: 0, P: 0 },
    abilitiesMaxCooldown: { U: 0.5, I: 2, O: 4, P: 20 },
    gamePaused: false, inDialog: false, inCutscene: false,
    inMenu: true,
    gameStarted: false,
    cameraOffset: { x: 0, y: 0 }, targetCameraOffset: { x: 0, y: 0 },
    currentPhase: 0, currentCheckpoint: 'start',
    inBossFight: false, bossDefeated: false,
    inTarekEncounter: false, tarekDialogStep: 0, tarekDialogCompleted: false, // NOVO: resetar
    tarekEncounterTriggerX: 5500, // NOVO: resetar
    fixedCamera: false, fixedCameraTarget: { x: 0, y: 0 }
};

/* Limpa todas as entidades */
platforms = []; enemies = []; abilityEffects = []; particles = []; damageNumbers = []; checkpoints = []; fallingSpikes = [];
/* Garante que todos os menus são explicitamente desativados */
deactivateOverlayMenu('pause-menu');
deactivateOverlayMenu('level-up');
deactivateOverlayMenu('dialog-container');
deactivateOverlayMenu('cinematic-overlay'); 
// NOVO: Esconder barra de vida do boss ao sair para o menu
document.getElementById('boss-name').style.display = 'none';
document.getElementById('boss-health-bar').style.display = 'none';


/* Exibe o menu principal */
document.getElementById('main-menu').style.display = 'flex';
document.getElementById('player-name').value = '';
document.querySelectorAll('.class-option').forEach(option => option.classList.remove('selected'));
document.getElementById('start-game-btn').disabled = true;

updateAllUI(); /* Limpa os últimos valores para forçar atualização ao carregar */
ctx.clearRect(0, 0, canvas.width, canvas.height);

stopMusic();
playMusic('music_menu', true);
}

// ===== SISTEMA DE FASES E NARRATIVA =====
function loadPhase(phaseNumber) {
gameState.currentPhase = phaseNumber;

gameState.playerPosition = { x: 100, y: 300 };
gameState.playerVelocity = { x: 0, y: 0 };
gameState.isGrounded = false;
gameState.isCrouching = false;

enemies = [];
abilityEffects = [];
particles = [];
damageNumbers = [];
fallingSpikes = [];

switch(phaseNumber) {
    case 1:
        setupPhase1_MuralhasAurora();
        stopMusic();
        playMusic('music_platforming', true);
        // NOVO: Garantir que barra de vida do boss esteja escondida ao carregar fase normal
        document.getElementById('boss-name').style.display = 'none';
        document.getElementById('boss-health-bar').style.display = 'none';
        break;
    case 2:
        setupPhase1_TarekEncounter();
        break;
    case 3:
        setupPhase1_TarekBossFight();
        break;
    default:
        setupPhase1_MuralhasAurora();
}

gameState.cameraOffset = { x: 0, y: 0 };
gameState.targetCameraOffset = { x: 0, y: 0 };
}

function setupPhase1_MuralhasAurora() {
platforms = [
    { x: 0, y: 400, width: 6000, height: 50, type: 'ground' },
    { x: 200, y: 350, width: 80, height: 20, type: 'platform' },
    { x: 350, y: 300, width: 80, height: 20, type: 'platform', slippery: true },
    { x: 500, y: 250, width: 100, height: 20, type: 'platform' },
    { x: 700, y: 320, width: 120, height: 20, type: 'platform' },
    { x: 900, y: 380, width: 50, height: 20, type: 'platform' },
    
    { x: 1100, y: 400, width: 150, height: 50, type: 'ground' },
    { x: 1100, y: 350, width: 150, height: 50, type: 'spike' },
    { x: 1300, y: 400, width: 100, height: 50, type: 'ground' },
    { x: 1500, y: 300, width: 80, height: 20, type: 'platform' },
    { x: 1700, y: 250, width: 100, height: 20, type: 'platform' },
    { x: 2000, y: 350, width: 120, height: 20, type: 'platform' },
    { x: 2300, y: 400, width: 200, height: 50, type: 'ground' },
    { x: 2300, y: 350, width: 200, height: 50, type: 'spike' },
    { x: 2600, y: 300, width: 80, height: 20, type: 'platform' },
    { x: 2800, y: 250, width: 100, height: 20, type: 'platform' },
    { x: 3100, y: 400, width: 150, height: 50, type: 'ground' },
    { x: 3400, y: 350, width: 80, height: 20, type: 'platform' },
    { x: 3600, y: 300, width: 100, height: 20, type: 'platform' },
    { x: 3900, y: 400, width: 200, height: 50, type: 'ground' },
    { x: 4200, y: 350, width: 80, height: 20, type: 'platform' },
    { x: 4400, y: 300, width: 100, height: 20, type: 'platform' },
    { x: 4700, y: 250, width: 120, height: 20, type: 'platform' },
    { x: 5000, y: 400, width: 1000, height: 50, type: 'ground' },
];

fallingSpikes = [
    { x: 800, y: -50, width: 30, height: 30, speed: 2, active: false },
    { x: 1200, y: -50, width: 30, height: 30, speed: 2, active: false },
    { x: 1800, y: -50, width: 30, height: 30, speed: 2, active: false },
    { x: 2400, y: -50, width: 30, height: 30, speed: 2, active: false },
    { x: 3000, y: -50, width: 30, height: 30, speed: 2, active: false },
    { x: 3800, y: -50, width: 30, height: 30, speed: 2, active: false },
    { x: 4500, y: -50, width: 30, height: 30, speed: 2, active: false },
];

enemies = [
    {
        type: 'sentinel',
        position: { x: 600, y: 300 },
        health: 50, maxHealth: 50, damage: 10, speed: 1,
        patrolRange: 100, xpValue: 10, direction: 1, attackCooldown: 0 // XP reduzido
    },
    {
        type: 'sentinel',
        position: { x: 1600, y: 250 },
        health: 50, maxHealth: 50, damage: 10, speed: 1,
        patrolRange: 120, xpValue: 10, direction: 1, attackCooldown: 0 // XP reduzido
    },
    {
        type: 'sentinel',
        position: { x: 2700, y: 250 },
        health: 50, maxHealth: 50, damage: 10, speed: 1,
        patrolRange: 100, xpValue: 10, direction: -1, attackCooldown: 0 // XP reduzido
    },
    {
        type: 'sentinel',
        position: { x: 3700, y: 300 },
        health: 50, maxHealth: 50, damage: 10, speed: 1,
        patrolRange: 150, xpValue: 10, direction: 1, attackCooldown: 0 // XP reduzido
    },
    {
        type: 'sentinel',
        position: { x: 4600, y: 250 },
        health: 50, maxHealth: 50, damage: 10, speed: 1,
        patrolRange: 100, xpValue: 10, direction: -1, attackCooldown: 0 // XP reduzido
    }
];

checkpoints = [
    { x: 1000, y: 350, width: 50, height: 50, name: 'checkpoint1', description: 'Primeiro Checkpoint' },
    // Removed original checkpoint2 and checkpoint3 based on user request
];

// MODIFIED: Configuração das camadas de fundo com imagens para parallax
backgroundLayers = [
    // type: 'parallax_image' indica que esta camada é para o novo sistema de parallax
    // assetKey deve corresponder a uma chave em CONFIG.ASSET_PATHS
    // parallaxSpeed determina quão rápido a camada se move em relação à câmera
    { type: 'parallax_image', assetKey: 'background_layer_1', parallaxSpeed: 0.1, yOffset: 0 }, // Fundo mais distante, menor velocidade
    { type: 'parallax_image', assetKey: 'background_layer_2', parallaxSpeed: 0.3, yOffset: -50 }, // Meio, um pouco abaixo
    { type: 'parallax_image', assetKey: 'background_layer_3', parallaxSpeed: 0.7, yOffset: -100 } // Frente, mais abaixo
];

CONFIG.WORLD_WIDTH = 6000;

gameState.inTarekEncounter = false;
gameState.tarekDialogStep = 0;
// gameState.tarekDialogCompleted não resetar aqui, é salvo no progresso
gameState.fixedCamera = false;
}

function setupPhase1_TarekEncounter() {
platforms = [
    { x: 0, y: 400, width: canvas.width, height: 50, type: 'ground' }
];
enemies = [];
checkpoints = [];

backgroundLayers = [ // NOVO: background será handled por renderBackground usando image
    { type: 'image', assetKey: 'tarek_background' }
];

gameState.fixedCamera = true;
gameState.fixedCameraTarget = { x: 0, y: 0 };
gameState.playerPosition = { x: 150, y: 300 };
gameState.playerVelocity = { x: 0, y: 0 };

const tarek = {
    type: 'boss_dialogue',
    name: 'Tarek, o Guerreiro',
    position: { x: 600, y: 300 },
    facing: 'left',
    health: 1, maxHealth: 1,
    damage: 0
};
enemies.push(tarek);

gameState.inTarekEncounter = true;
// NOVO: Esconder barra de vida do boss no encontro de diálogo
document.getElementById('boss-name').style.display = 'none';
document.getElementById('boss-health-bar').style.display = 'none';

startTarekDialogue();
}

function setupPhase1_TarekBossFight() {
platforms = [
    { x: 0, y: 400, width: canvas.width, height: 50, type: 'ground' }
];
enemies = [];
checkpoints = [];

backgroundLayers = [ // NOVO: background será handled por renderBackground usando image
    { type: 'image', assetKey: 'tarek_background' }
];

if (isMobile) {
gameState.fixedCamera = true;
gameState.fixedCameraTarget = { x: 0, y: 100 };
gameState.playerPosition = { x: 150, y: 300 };
}
else{
gameState.fixedCamera = true;
gameState.fixedCameraTarget = { x: 0, y: 0 };
gameState.playerPosition = { x: 150, y: 300 };
}

gameState.playerHealth = gameState.playerMaxHealth;
gameState.playerMana = gameState.playerMaxMana;
updateHealthBar();
updateManaBar();

triggerBossFight();
stopMusic();
playMusic('music_boss_tarek', true);
}

// ===== CUTSCENES E NARRATIVA =====
// Global variables for cutscene management
// (Moved here for clarity and to ensure global scope)
// let introSequence = []; // Already declared globally at the top of script
// let currentSequenceIndex = 0; // Already declared globally at the top of script

function showIntroCutscene() {
gameState.inCutscene = true;
activateOverlayMenu('cinematic-overlay'); // Ativa o overlay da cutscene
document.getElementById('skip-btn').textContent = 'Próximo'; // Garante o texto do botão
// Define a sequência da intro aqui. Ela será usada pela função showNextSequenceStep.
introSequence = [
    {
        title: "O DESEQUILÍBRIO",
        text: "O mundo treme sob o peso do desequilíbrio. Ignys, o Reino do Fogo, deseja guerra e já move suas tropas em direção aos reinos vizinhos.",
        gif: null
    },
    {
        title: "O CORAÇÃO DE GELO",
        text: "Em Tupãry, o Coração de Gelo guarda a metade maligna de Anhangá, o espírito que traz caos.",
        gif: CONFIG.ASSET_LOADED.cutscene_gif_1.img // Usar o objeto da imagem real
    },
    {
        title: "A CONVOCAÇÃO",
        text: `Umbra convoca você, ${gameState.playerName}, o Escolhido: recuperar o Coração de Gelo e impedir que Ignys obtenha poder suficiente para dominar todos os reinos.`,
        gif: null
    },
    {
        title: "O DESTINO",
        text: "Cada passo, cada luta, cada escolha será decisiva para a sobrevivência de todos.",
        gif: null
    }
];

currentSequenceIndex = 0; // Reinicia o índice para cada nova cutscene
// console.log("showIntroCutscene called. Starting cutscene sequence.");
showNextSequenceStep(); // Exibe o primeiro passo da cutscene
}

function showNextSequenceStep() {
const titleElement = document.getElementById('cinematic-title');
const textElement = document.getElementById('cinematic-text');
const gifElement = document.getElementById('cutscene-gif');

// console.log(`showNextSequenceStep called. Current index: ${currentSequenceIndex}`);

if (currentSequenceIndex < introSequence.length) {
    const sequence = introSequence[currentSequenceIndex];
    
    titleElement.textContent = sequence.title;
    textElement.textContent = sequence.text;
    
    // Reinicia animações CSS para garantir o efeito fadeIn
    titleElement.style.animation = 'none';
    textElement.style.animation = 'none';
    void titleElement.offsetWidth; // Força reflow
    void textElement.offsetWidth;
    titleElement.style.animation = 'fadeInText 2s forwards';
    textElement.style.animation = 'fadeInText 3s forwards 0.5s';

    // Gerencia a exibição do GIF
    if (sequence.gif) {
        gifElement.src = sequence.gif.src;
        gifElement.style.display = 'block';
        // console.log(`Displaying GIF: ${sequence.gif.src}`);
    } else {
        gifElement.style.display = 'none';
        gifElement.src = ''; // Limpa a URL para evitar que a imagem anterior persista
        // console.log("No GIF for this sequence step.");
    }
    
    currentSequenceIndex++;
    // console.log(`currentSequenceIndex incremented to: ${currentSequenceIndex}`);
} else {
    // console.log("End of introSequence. Calling endIntro().");
    endIntro(); // Termina a cutscene se todos os passos foram mostrados
}
}

function endIntro() {
// console.log("endIntro called. Hiding cinematic overlay and loading phase 1.");
deactivateOverlayMenu('cinematic-overlay'); // Desativa o overlay da cutscene
gameState.inCutscene = false;
loadPhase(1); // Inicia a fase 1 do jogo
}

// A função skipCutscene foi mantida mas não será mais chamada pelo botão "Próximo"
// Ela pode ser usada por outras lógicas se você precisar de um "pular tudo" em algum momento
function skipCutscene() {
// console.log("skipCutscene called - this should only be called if a dedicated skip button existed.");
deactivateOverlayMenu('cinematic-overlay'); // Desativa o overlay da cutscene
gameState.inCutscene = false;

if (gameState.currentPhase === 0) {
    loadPhase(1);
}
}

function showDialog(speaker, text, options = null) {
gameState.inDialog = true;
gameState.gamePaused = true;
activateOverlayMenu('dialog-container'); // Ativa o container de diálogo

const speakerElement = document.getElementById('dialog-speaker');
const textElement = document.getElementById('dialog-text');
const optionsElement = document.getElementById('dialog-options');

speakerElement.textContent = speaker;
textElement.textContent = text;

optionsElement.innerHTML = ''; // Limpa as opções anteriores

if (options && options.length > 0) {
    options.forEach((option, index) => {
        const button = document.createElement('div');
        button.className = 'dialog-option';
        button.textContent = option.text;
        button.addEventListener('click', () => {
            deactivateOverlayMenu('dialog-container'); // Desativa o container de diálogo
            gameState.inDialog = false;
            gameState.gamePaused = false;
            if (option.action) option.action();
        });
        optionsElement.appendChild(button);
    });
} else {
    const button = document.createElement('div');
    button.className = 'dialog-option';
    button.textContent = 'Continuar';
    button.addEventListener('click', () => {
        deactivateOverlayMenu('dialog-container'); // Desativa o container de diálogo
        gameState.inDialog = false;
        gameState.gamePaused = false;
    });
    optionsElement.appendChild(button);
}
}

function startTarekDialogue() {
gameState.tarekDialogStep = 0;
const tarekDialogs = [
    { speaker: "TAREK, O GUERREIRO", text: `Então você é ${gameState.playerName}, o tal Escolhido?` },
    { speaker: "TAREK, O GUERREIRO", text: "Estas muralhas não são lugar para forasteiros fracos." },
    { speaker: "TAREK, O GUERREIRO", text: "Prove que merece passar por aqui, ou volte de onde veio!" }
];

function showTarekLine() {
    if (gameState.tarekDialogStep < tarekDialogs.length) {
        const line = tarekDialogs[gameState.tarekDialogStep];
        showDialog(line.speaker, line.text, [{ text: "Continuar", action: () => {
            gameState.tarekDialogStep++;
            showTarekLine();
        }}]);
    } else {
        gameState.tarekDialogCompleted = true; // NOVO: Marcar diálogo como completo
        gameState.inTarekEncounter = false;
        loadPhase(3); // Inicia a fase da batalha com Tarek
    }
}
showTarekLine();
}

// ===== SISTEMA DE CHECKPOINTS =====
function saveCheckpoint(checkpointName) {
gameState.currentCheckpoint = checkpointName;

const checkpointData = {
    name: checkpointName,
    phase: gameState.currentPhase,
    position: { ...gameState.playerPosition },
    health: gameState.playerHealth,
    mana: gameState.playerMana,
    xp: gameState.playerXP,
    level: gameState.playerLevel,
    playerNextLevelXP: gameState.playerNextLevelXP, // NOVO: Salvar XP para próximo nível
    playerClass: gameState.playerClass,
    playerMaxHealth: gameState.playerMaxHealth,
    playerMaxMana: gameState.playerMaxMana,
    playerDamage: gameState.playerDamage,
    abilitiesMaxCooldown: gameState.abilitiesMaxCooldown,
    manaRegenRate: CONFIG.MANA_REGEN_RATE,
    tarekDialogCompleted: gameState.tarekDialogCompleted // NOVO: Salvar estado do diálogo Tarek
};

setCookie('tupary_checkpoint', JSON.stringify(checkpointData));
// showCheckpointNotification('Checkpoint Salvo', `Progresso salvo em: ${getCheckpointDescription(checkpointName)}`); /* REMOVED: No visual notification */
//console.log(`Checkpoint Salvo: ${getCheckpointDescription(checkpointName)}`); /* NEW: Log to console instead */
}

function loadCheckpoint() {
const checkpointData = getCookie('tupary_checkpoint');
if (checkpointData) {
    try {
        const data = JSON.parse(checkpointData);
        
        gameState.currentPhase = data.phase;
        gameState.currentCheckpoint = data.name;
        gameState.playerPosition = { ...data.position };
        gameState.playerHealth = data.health;
        gameState.playerMana = data.mana;
        gameState.playerXP = data.xp;
        gameState.playerLevel = data.level;
        gameState.playerNextLevelXP = data.playerNextLevelXP; // NOVO: Carregar XP para próximo nível
        gameState.playerClass = data.playerClass;
        gameState.tarekDialogCompleted = data.tarekDialogCompleted; // NOVO: Carregar estado do diálogo Tarek
        setupCharacter(data.playerClass, data.playerMaxHealth, data.playerMaxMana, data.playerDamage, data.playerSpeed, data.abilitiesMaxCooldown, data.manaRegenRate);
        loadPhase(data.phase);
        updateAllUI();
        return true;
    } catch (e) {
        //console.error('Erro ao carregar checkpoint:', e);
    }
}
return false;
}

function getCheckpointDescription(checkpointName) {
const checkpoint = checkpoints.find(cp => cp.name === checkpointName);
return checkpoint ? checkpoint.description : 'Localização Desconhecida';
}

function showCheckpointNotification(title, description) {
// Function body intentionally left empty to suppress visual notification
//console.log(`Checkpoint Notification Suppressed: ${title} - ${description}`);
}

function restartFromCheckpoint() {
togglePause(); // Primeiro despausa o jogo para que a lógica de "loadPhase" possa ser executada

if (loadCheckpoint()) {
    // showCheckpointNotification('Checkpoint Carregado', 'Retornando ao último checkpoint salvo...'); /* REMOVED: No visual notification */
    //console.log('Checkpoint Carregado: Retornando ao último checkpoint salvo...'); /* NEW: Log to console */
} else {
    // Se não houver checkpoint, apenas reinicia a fase atual com vida cheia
    loadPhase(gameState.currentPhase);
    gameState.playerHealth = gameState.playerMaxHealth;
    gameState.playerMana = gameState.playerMaxMana;
    updateAllUI();
}
// NOVO: Garantir que barra de vida do boss esteja escondida ao reiniciar checkpoint (se não estiver na fase do boss)
document.getElementById('boss-name').style.display = 'none';
document.getElementById('boss-health-bar').style.display = 'none';
}

// ===== LOOP PRINCIPAL DO JOGO =====
function gameLoop(timestamp) {
let deltaTime = timestamp - lastTime;
lastTime = timestamp;

deltaTime = Math.min(deltaTime, CONFIG.DELTA_TIME_CAP);

if (!gameState.gamePaused && gameState.gameStarted) {
    if (!gameState.inCutscene && !gameState.inDialog) {
        update(deltaTime);
    }
    render(deltaTime); // NOVO: Passar deltaTime para render
} else if (gameState.inMenu) {
    renderMenu();
} else {
    render(deltaTime); // NOVO: Passar deltaTime para render mesmo pausado para animações de UI
}

animationFrameId = requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
updatePlayer(deltaTime);
updateEnemies(deltaTime);
updateAbilityEffects(deltaTime);
updateParticles(deltaTime);
updateDamageNumbers(deltaTime);
updateCooldowns(deltaTime);
updateRegeneration(deltaTime);
updateCamera(deltaTime);
updateFallingSpikes(deltaTime);

if (gameState.currentPhase === 1) {
    checkCheckpoints();
}

checkGameConditions();
}

function updatePlayer(deltaTime) {
let moveX = 0;
if (keys['a'] || keys['arrowleft'] || mobileControls.left) moveX = -1;
if (keys['d'] || keys['arrowright'] || mobileControls.right) moveX = 1;

let currentSpeed = gameState.playerSpeed;
if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) { /* Lógica mantida para Escolhido Original */
    currentSpeed *= CONFIG.UMBRA_FURY_SPEED_BOOST;
    gameState.umbraFuryTimer -= deltaTime;
    if (gameState.umbraFuryTimer <= 0) {
        gameState.isUmbraFurious = false;
        playerAnimation.ultimate.setLoop(false); // Parar loop da ultimate
    }
}

gameState.playerVelocity.x = moveX * currentSpeed;

if ((keys['w'] || keys['arrowup'] || keys[' '] || mobileControls.up) && gameState.isGrounded && !gameState.isCrouching) {
    gameState.playerVelocity.y = -CONFIG.JUMP_FORCE;
    gameState.isGrounded = false;
    playSound('sfx_jump');
    addParticles('jumpDust', gameState.playerPosition.x + CONFIG.PLAYER_WIDTH / 2, gameState.playerPosition.y + CONFIG.PLAYER_HEIGHT, 8);
    
    keys['w'] = false; keys['arrowup'] = false; keys[' '] = false; mobileControls.up = false;
}

if (keys['s'] || keys['arrowdown'] || mobileControls.down) {
    if (!gameState.isCrouching && gameState.isGrounded) {
        gameState.isCrouching = true;
        gameState.playerPosition.y += CONFIG.NORMAL_HEIGHT - CONFIG.CROUCH_HEIGHT;
    }
} else {
    if (gameState.isCrouching) {
        const newY = gameState.playerPosition.y - (CONFIG.NORMAL_HEIGHT - CONFIG.CROUCH_HEIGHT);
        if (canStandUp(gameState.playerPosition.x, newY)) {
            gameState.isCrouching = false;
            gameState.playerPosition.y = newY;
        }
    }
}

gameState.playerVelocity.y += CONFIG.GRAVITY;

// --- MODIFIED: Limit falling speed ---
if (gameState.playerVelocity.y > 15) { 
    gameState.playerVelocity.y = 15;
}
// --- END MODIFIED ---

gameState.playerPosition.x += gameState.playerVelocity.x;
gameState.playerPosition.y += gameState.playerVelocity.y;

checkPlatformCollisions();
checkEnemyCollisions();
checkEffectCollisions();
checkFallingSpikeCollisions();

updatePlayerAnimation(deltaTime); // NOVO: Passar deltaTime para atualização da animação

if (moveX > 0) gameState.facing = 'right';
if (moveX < 0) gameState.facing = 'left';

if (!gameState.fixedCamera) {
    if (gameState.playerPosition.x < 0) {
        gameState.playerPosition.x = 0;
        gameState.playerVelocity.x = 0;
    }
    if (gameState.playerPosition.x > CONFIG.WORLD_WIDTH - CONFIG.PLAYER_WIDTH) {
        gameState.playerPosition.x = CONFIG.WORLD_WIDTH - CONFIG.PLAYER_WIDTH;
        gameState.playerVelocity.x = 0;
    }
    // NOVO: Gatilho preciso para o encontro com Tarek
    if (gameState.currentPhase === 1 && gameState.playerPosition.x >= gameState.tarekEncounterTriggerX && !gameState.tarekDialogCompleted) {
        loadPhase(2); // Transita para a fase do encontro com Tarek
    }
} else {
    if (gameState.playerPosition.x < 0) gameState.playerPosition.x = 0;
    if (gameState.playerPosition.x > canvas.width - CONFIG.PLAYER_WIDTH) gameState.playerPosition.x = canvas.width - CONFIG.PLAYER_WIDTH;
}

if (gameState.playerPosition.y > CONFIG.WORLD_HEIGHT + 100) {
    takeDamage(gameState.playerMaxHealth);
}

if (gameState.isInvincible) {
    gameState.invincibilityTimer -= deltaTime;
    if (gameState.invincibilityTimer <= 0) {
        gameState.isInvincible = false;
    }
}
}

function canStandUp(x, y) {
const playerWidth = CONFIG.PLAYER_WIDTH;
const playerHeight = CONFIG.NORMAL_HEIGHT;

for (const platform of platforms) {
    if (x < platform.x + platform.width &&
        x + playerWidth > platform.x &&
        y < platform.y + platform.height &&
        y + playerHeight > platform.y) {
        return false;
    }
}
return true;
}

// --- MODIFIED: Refined Platform Collision Detection ---
function checkPlatformCollisions() {
gameState.isGrounded = false;
const playerWidth = CONFIG.PLAYER_WIDTH;
const playerHeight = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;
let onPlatform = false;

for (const platform of platforms) {
    // Check for collision
    if (gameState.playerPosition.x < platform.x + platform.width &&
        gameState.playerPosition.x + playerWidth > platform.x &&
        gameState.playerPosition.y < platform.y + platform.height &&
        gameState.playerPosition.y + playerHeight > platform.y) {
        
        if (platform.type === 'spike') {
            takeDamage(10);
            continue; // Continue to check for other collisions after taking spike damage
        }

        // Collision from top (landing)
        if (gameState.playerVelocity.y >= 0 && 
    gameState.playerPosition.y + playerHeight - gameState.playerVelocity.y <= platform.y) {
    
    const fallSpeed = gameState.playerVelocity.y; // guarda velocidade da queda
    
    gameState.playerPosition.y = platform.y - playerHeight;
    gameState.playerVelocity.y = 0;
    onPlatform = true;
    
    if (fallSpeed > 8) { // agora funciona corretamente
        addParticles('landDust', gameState.playerPosition.x + CONFIG.PLAYER_WIDTH / 2, gameState.playerPosition.y + playerHeight, 8);
        screenShake(3, 150);
    }
    
    if (platform.slippery && Math.abs(gameState.playerVelocity.x) > 0) {
        gameState.playerVelocity.x *= 1.2;
    }
}

        // Collision from bottom (hitting head)
        else if (gameState.playerVelocity.y < 0 && 
                gameState.playerPosition.y - gameState.playerVelocity.y >= platform.y + platform.height) {
            gameState.playerPosition.y = platform.y + platform.height;
            gameState.playerVelocity.y = 0;
        }
        // Collision from sides (horizontal)
        else if (gameState.playerVelocity.x !== 0) {
            // Determine which side was hit and adjust position and velocity
            if (gameState.playerPosition.x + playerWidth - gameState.playerVelocity.x <= platform.x) { // Hit from left
                gameState.playerPosition.x = platform.x - playerWidth;
            } else if (gameState.playerPosition.x - gameState.playerVelocity.x >= platform.x + platform.width) { // Hit from right
                gameState.playerPosition.x = platform.x + platform.width;
            }
            gameState.playerVelocity.x = 0; // Stop horizontal movement
        }
    }
}
gameState.isGrounded = onPlatform; // Update isGrounded based on whether any platform was hit from above
}
// --- END MODIFIED ---

function checkEnemyCollisions() {
if (gameState.isInvincible) return;

const playerWidth = CONFIG.PLAYER_WIDTH;
const playerHeight = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;
const playerHalfWidth = playerWidth / 2;
const playerHalfHeight = playerHeight / 2;
const playerCenterX = gameState.playerPosition.x + playerHalfWidth;
const playerCenterY = gameState.playerPosition.y + playerHalfHeight;

for (const enemy of enemies) {
    if (enemy.type === 'boss_dialogue') continue;

    const enemyWidth = enemy.type === 'boss' ? 70 : 50;
    const enemyHeight = enemy.type === 'boss' ? 70 : 50;
    const enemyHalfWidth = enemyWidth / 2;
    const enemyHalfHeight = enemyHeight / 2;
    const enemyCenterX = enemy.position.x + enemyHalfWidth;
    const enemyCenterY = enemy.position.y + enemyHalfHeight;

    const dx = playerCenterX - enemyCenterX;
    const dy = playerCenterY - enemyCenterY;
    const distanceSq = dx * dx + dy * dy; /* Usando distância ao quadrado */
    const collisionThresholdSq = (playerHalfWidth + enemyHalfWidth - 10) * (playerHalfHeight + enemyHalfHeight - 10); /* Ajuste para melhor sensibilidade */
    if (distanceSq < collisionThresholdSq) {
        takeDamage(enemy.damage);
        
        const knockbackForce = 8;
        gameState.playerVelocity.x = dx > 0 ? knockbackForce : -knockbackForce;
        gameState.playerVelocity.y = -5;
        
        break;
    }
}
}

function checkEffectCollisions() {
for (let i = abilityEffects.length - 1; i >= 0; i--) {
    const effect = abilityEffects[i];
    
    if (effect.damage && effect.origin === 'player' && effect.active !== false) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (enemy.type === 'boss_dialogue') continue;

            if (effect.hitTargets && effect.hitTargets.includes(enemy)) {
                continue;
            }
            
            const enemyWidth = enemy.type === 'boss' ? 70 : 50;
            const enemyHeight = enemy.type === 'boss' ? 70 : 50;
            const enemyHalfWidth = enemyWidth / 2;
            const enemyHalfHeight = enemyHeight / 2;
            const enemyCenterX = enemy.position.x + enemyHalfWidth;
            const enemyCenterY = enemy.position.y + enemyHalfHeight;

            const effectHalfWidth = effect.width / 2;
            const effectHalfHeight = effect.height / 2;
            const effectCenterX = effect.x + effectHalfWidth;
            const effectCenterY = effect.y + effectHalfHeight;

            const dx = enemyCenterX - effectCenterX;
            const dy = enemyCenterY - effectCenterY;
            const distanceSq = dx * dx + dy * dy;
            const collisionThresholdSq = (enemyHalfWidth + effectHalfWidth) * (enemyHalfHeight + effectHalfHeight);
            
            if (distanceSq < collisionThresholdSq) {
                enemy.health -= effect.damage;
                playSound('sfx_damage_enemy');
                
                if (effect.hitTargets) {
                    effect.hitTargets.push(enemy);
                }
                
                showDamageNumber(effect.damage, enemy.position.x + enemyHalfWidth, enemy.position.y);
                addParticles('hitSpark', enemy.position.x + enemyHalfWidth, enemy.position.y + enemyHalfHeight, 8);
                screenShake(2, 100);
                
                if (effect.knockback) {
                    const knockDirection = (enemy.position.x + enemyHalfWidth) - (effect.x + effectHalfWidth) > 0 ? 1 : -1;
                    enemy.position.x += knockDirection * effect.knockback;
                }

                if (effect.freezeChance && Math.random() < effect.freezeChance) {
                    enemy.frozen = true;
                    enemy.frozenTimer = 2000;
                }
                
                if (enemy.health <= 0) {
                    gainXP(enemy.xpValue);
                    addParticles('deathExplosion', enemy.position.x + enemyHalfWidth, enemy.position.y + enemyHalfHeight, 20);
                    screenShake(4, 200);
                    enemies.splice(j, 1);
                    
                    if (enemy.type === 'boss') {
                        defeatBoss(enemy);
                    }
                }
                
                if (!effect.piercing && !effect.areaEffect && effect.type !== 'umbraWall') { // NEW: Umbra Wall doesn't disappear on enemy hit, only if passed through
                    effect.active = false;
                }
            }
        }
    }
    
    if (effect.damage && effect.origin === 'enemy' && !gameState.isInvincible && effect.active !== false) {
        const playerWidth = CONFIG.PLAYER_WIDTH;
        const playerHeight = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;
        const playerHalfWidth = playerWidth / 2;
        const playerHalfHeight = playerHeight / 2;
        const playerCenterX = gameState.playerPosition.x + playerHalfWidth;
        const playerCenterY = gameState.playerPosition.y + playerHalfHeight;

        const effectHalfWidth = effect.width / 2;
        const effectHalfHeight = effect.height / 2;
        const effectCenterX = effect.x + effectHalfWidth;
        const effectCenterY = effect.y + effectHalfHeight;

        const dx = playerCenterX - effectCenterX;
        const dy = playerCenterY - effectCenterY;
        const distanceSq = dx * dx + dy * dy;
        const collisionThresholdSq = (playerHalfWidth + effectHalfWidth) * (playerHalfHeight + effectHalfHeight);
        
        if (distanceSq < collisionThresholdSq) {
            takeDamage(effect.damage);
            effect.active = false;
        }
    }
}
}

function updatePlayerAnimation(deltaTime) {
// Atualiza o AnimationManager com o deltaTime
// Garante que o AnimationManager correto esteja sendo atualizado, mesmo se a animação tiver terminado
if (playerAnimation[gameState.currentAnimation]) {
    playerAnimation[gameState.currentAnimation].update(deltaTime);
}

// A lógica de transição de animação deve vir DEPOIS de atualizar o AnimationManager atual
// para que o frameTimer seja incrementado corretamente.
if (gameState.isInvincible) {
    // Animação de dano tem prioridade visualmente.
    // Se não estiver já na animação de dano ou se ela tiver terminado, ativa.
    if (gameState.currentAnimation !== 'take_damage' || !playerAnimation.take_damage.isPlaying) {
        gameState.currentAnimation = 'take_damage';
            playerAnimation.take_damage.reset();
    }
} else if (playerAnimation.attack_u.isPlaying || playerAnimation.attack_i.isPlaying || playerAnimation.attack_o.isPlaying) {
    // Manter animação de ataque se estiver em curso.
    // gameState.currentAnimation já foi setado na função useAbility().
    // Não sobrescrever se a animação de ataque ainda está rodando.
} else if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) { /* Lógica mantida para Chosen One */
    if (gameState.currentAnimation !== 'ultimate') {
        gameState.currentAnimation = 'ultimate';
        playerAnimation.ultimate.reset();
    }
} else if (gameState.isCrouching) {
    if (gameState.currentAnimation !== 'crouch') {
        gameState.currentAnimation = 'crouch';
        playerAnimation.crouch.reset();
    }
} else if (!gameState.isGrounded) {
    if (gameState.currentAnimation !== 'jump') {
        gameState.currentAnimation = 'jump';
        playerAnimation.jump.reset(); // Reinicia a animação de pulo
    }
} else if (Math.abs(gameState.playerVelocity.x) > 0.1) {
    if (gameState.currentAnimation !== 'walk') {
        gameState.currentAnimation = 'walk';
        playerAnimation.walk.reset(); // Reinicia a animação de andar
    }
} else {
    if (gameState.currentAnimation !== 'idle') {
        gameState.currentAnimation = 'idle';
        playerAnimation.idle.reset(); // Reinicia a animação de idle
    }
}
}

function updateEnemies(deltaTime) {
for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    
    if (enemy.type === 'boss_dialogue') {
        // NOVO: Atualiza a animação do boss de diálogo
        tarekAnimation.update(deltaTime);
        continue;
    }

    if (enemy.frozen) {
        enemy.frozenTimer -= deltaTime;
        if (enemy.frozenTimer <= 0) {
            enemy.frozen = false;
        }
        continue;
    }
    
    if (enemy.type === 'sentinel' && enemy.pattern === 'patrol') {
        updateEnemyPatrol(enemy, deltaTime);
        sentinelAnimation.update(deltaTime); // NOVO: Atualiza animação do sentinela
    }
    
    if (enemy.type === 'sentinel') {
        updateEnemyAI(enemy, deltaTime);
    } else if (enemy.type === 'boss') {
        updateBossAI(enemy, deltaTime);
        tarekAnimation.update(deltaTime); // NOVO: Atualiza animação do boss
    }
    
    enemy.velocity = enemy.velocity || { x: 0, y: 0 };
    enemy.velocity.y += CONFIG.GRAVITY;
    
    enemy.position.x += enemy.velocity.x;
    enemy.position.y += enemy.velocity.y;
    
    checkEnemyPlatformCollisions(enemy);
}
}

function updateEnemyPatrol(enemy, deltaTime) {
if (!enemy.direction) {
    enemy.direction = 1;
    enemy.patrolStartX = enemy.position.x;
}

enemy.position.x += enemy.speed * enemy.direction;

if (enemy.position.x > enemy.patrolStartX + enemy.patrolRange) {
    enemy.direction = -1;
} else if (enemy.position.x < enemy.patrolStartX - enemy.patrolRange) {
    enemy.direction = 1;
}
}

function updateEnemyAI(enemy, deltaTime) {
const distanceToPlayer = Math.abs(enemy.position.x - gameState.playerPosition.x);
const playerInRange = distanceToPlayer < 200;

if (playerInRange) {
    enemy.attackCooldown = (enemy.attackCooldown || 0) - deltaTime;
    if (enemy.attackCooldown <= 0) {
        enemyAttack(enemy);
        enemy.attackCooldown = 2000 + Math.random() * 1000;
    }
    
    if (distanceToPlayer > 60) {
        const direction = gameState.playerPosition.x > enemy.position.x ? 1 : -1;
        enemy.position.x += direction * enemy.speed * 0.5;
    }
}
}

function enemyAttack(enemy) {
const direction = gameState.playerPosition.x > enemy.position.x ? 1 : -1;

switch(enemy.type) {
    case 'sentinel':
        addAbilityEffect({
            type: 'enemyIceShot',
            x: enemy.position.x + (direction > 0 ? 50 : -25),
            y: enemy.position.y + 15,
            width: 20,
            height: 6,
            duration: 2000,
            damage: enemy.damage,
            direction: direction,
            speed: 5,
            origin: 'enemy'
        });
        
        addParticles('enemyMuzzle', enemy.position.x + 25, enemy.position.y + 15, 6);
        break;
}
}

function checkEnemyPlatformCollisions(enemy) {
enemy.isGrounded = false;
const enemyWidth = enemy.type === 'boss' ? 70 : 50;
const enemyHeight = enemy.type === 'boss' ? 70 : 50;

for (const platform of platforms) {
    if (platform.type === 'spike') continue;

    if (enemy.position.x < platform.x + platform.width &&
        enemy.position.x + enemyWidth > platform.x &&
        enemy.position.y < platform.y + platform.height &&
        enemy.position.y + enemyHeight > platform.y) {
        
        if (enemy.velocity.y > 0 && 
            enemy.position.y + enemyHeight - enemy.velocity.y <= platform.y) {
            enemy.position.y = platform.y - enemyHeight;
            enemy.velocity.y = 0;
            enemy.isGrounded = true;
        }
    }
}
}

function updateAbilityEffects(deltaTime) {
for (let i = abilityEffects.length - 1; i >= 0; i--) {
    const effect = abilityEffects[i];
    effect.timer -= deltaTime;
    
    switch(effect.type) {
        case 'energyProjectile':
        case 'enemyIceShot':
        case 'bossIceOrb':
            effect.x += effect.speed * effect.direction;
            if (Math.random() < 0.4) {
                let trailColor;
                if (effect.type === 'bossIceOrb') trailColor = COLOR_ACCENT_ICE;
                else if (currentChampion.id === 'umbraArcher') trailColor = COLOR_UMBRA; // Usa a nova cor de Umbra
                else trailColor = COLOR_ACCENT_BLUE;
                addParticles('projectileTrail', effect.x + effect.width/2, effect.y + effect.height/2, 2, trailColor);
            }
            break;
        case 'bossDash':
            if (effect.followBoss && effect.followBoss.position) {
                effect.x = effect.followBoss.position.x;
                effect.y = effect.followBoss.position.y;
            }
            break;
        case 'bossPrison':
            if (effect.delay && effect.delay > 0) {
                effect.delay -= deltaTime;
                if (effect.delay <= 0) {
                    effect.active = true;
                    addParticles('prisonActivate', effect.x + effect.width/2, effect.y + effect.height/2, 20);
                }
            }
            if (effect.trapping && effect.active) {
                const playerInTrap =
                    gameState.playerPosition.x > effect.x - 20 &&
                    gameState.playerPosition.x < effect.x + effect.width + 20 &&
                    gameState.playerPosition.y > effect.y - 10 &&
                    gameState.playerPosition.y < effect.y + effect.height + 10;
                
                if (playerInTrap) {
                    gameState.playerVelocity.x *= 0.1;
                    gameState.playerVelocity.y *= 0.1;
                    
                    if (Math.random() < 0.05) {
                        takeDamage(effect.damage * (deltaTime / 1000));
                    }
                }
            }
            break;
        case 'closeOrb':
            effect.x += effect.speed * effect.direction;
            /* Check for max distance for the orb to explode */
            const initialOrbDistance = 150; // Distance after which orb will explode even if no collision
            const distanceTraveled = Math.sqrt(Math.pow(effect.x - effect.startX, 2) + Math.pow(effect.y - effect.startY, 2));

            if (effect.explosive && (effect.timer < effect.duration - 1000 || distanceTraveled > initialOrbDistance)) {
                addAbilityEffect({
                    type: 'arcaneExplosion', /* Reutiliza o efeito de explosão */
                    x: effect.x - 30,
                    y: effect.y - 30,
                    width: 90,
                    height: 90,
                    duration: 400,
                    damage: effect.damage,
                    origin: effect.origin
                });
                playSound('sfx_ability_o'); /* Som de explosão (ou som customizado para orbe) */
                screenShake(6, 250);
                effect.active = false; /* Desativa o orbe para remoção */
            }
            break;
        case 'defensivePrison':
            if (effect.damageOverTime) {
                const enemiesInArea = enemies.filter(e => 
                    e.position.x < effect.x + effect.width && e.position.x + 50 > effect.x &&
                    e.position.y < effect.y + effect.height && e.position.y + 50 > effect.y
                );
                enemiesInArea.forEach(enemy => {
                    if (Math.random() < 0.1) {
                        enemy.health -= effect.damage * (deltaTime / 1000);
                        playSound('sfx_damage_enemy');
                        showDamageNumber(effect.damage * (deltaTime / 1000), enemy.position.x + 25, enemy.position.y);
                        if (enemy.health <= 0) {
                            gainXP(enemy.xpValue);
                            addParticles('deathExplosion', enemy.position.x + 25, enemy.position.y + 25, 20);
                            screenShake(4, 200);
                            enemies.splice(enemies.indexOf(enemy), 1);
                        }
                    }
                });
            }
            if (effect.protective) {
                /* Lógica para proteger o jogador dentro da prisão */
                /* Ex: Se um projétil inimigo colide com a prisão, ele é destruído */
                const enemyProjectiles = abilityEffects.filter(ae => ae.origin === 'enemy' && (ae.type.includes('Projectile') || ae.type.includes('Orb')));
                enemyProjectiles.forEach(proj => {
                    if (proj.x < effect.x + effect.width && proj.x + proj.width > effect.x &&
                        proj.y < effect.y + effect.height && proj.y + effect.height > effect.y) {
                        proj.active = false; /* Destrói o projétil inimigo */
                    }
                });
            }
            break;
        case 'umbraWall': // NEW: Lógica para a Muralha de Umbra
            // Bloquear projéteis inimigos
            for (let k = abilityEffects.length - 1; k >= 0; k--) {
                const otherEffect = abilityEffects[k];
                // Verifica se é um projétil inimigo e colide com a muralha
                if (otherEffect.origin === 'enemy' && (otherEffect.type.includes('Shot') || otherEffect.type.includes('Orb') || otherEffect.type.includes('Projectile')) && otherEffect.active !== false) {
                    if (otherEffect.x < effect.x + effect.width &&
                        otherEffect.x + otherEffect.width > effect.x &&
                        otherEffect.y < effect.y + effect.height &&
                        otherEffect.y + otherEffect.height > effect.y) {
                        otherEffect.active = false; // Destrói o projétil
                        addParticles('hitSpark', otherEffect.x, otherEffect.y, 5, COLOR_ACCENT_ICE); // Feedback visual
                    }
                }
            }

            // Causa dano e é destruída se um inimigo passar por ela
            if (effect.lastDamageTime === undefined) effect.lastDamageTime = Date.now();
            if (Date.now() - effect.lastDamageTime >= effect.lifetimeDamageInterval) {
                enemies.forEach(enemy => {
                    const enemyWidth = enemy.type === 'boss' ? 70 : 50;
                    const enemyHeight = enemy.type === 'boss' ? 70 : 50;
                    // Checa colisão da muralha com o inimigo
                    if (enemy.position.x < effect.x + effect.width &&
                        enemy.position.x + enemyWidth > effect.x &&
                        enemy.position.y < effect.y + effect.height &&
                        enemy.position.y + enemyHeight > effect.y) {
                        
                        enemy.health -= effect.damage; // Aplica dano ao inimigo
                        playSound('sfx_damage_enemy');
                        showDamageNumber(effect.damage, enemy.position.x + enemyWidth / 2, enemy.position.y);
                        addParticles('hitSpark', enemy.position.x + enemyWidth / 2, enemy.position.y + enemyHeight / 2, 10);
                        screenShake(3, 100);

                        effect.active = false; // Destrói a muralha
                        addParticles('explosion', effect.x + effect.width / 2, effect.y + effect.height / 2, 20, COLOR_UMBRA); // Animação de destruição
                        screenShake(5, 200);

                        if (enemy.health <= 0) {
                            gainXP(enemy.xpValue);
                            // Remove o inimigo do array
                            const enemyIndex = enemies.indexOf(enemy);
                            if (enemyIndex > -1) {
                                enemies.splice(enemyIndex, 1);
                            }
                            if (enemy.type === 'boss') {
                                defeatBoss(enemy);
                            }
                        }
                    }
                });
                effect.lastDamageTime = Date.now();
            }
            break;
    }
    
    if (effect.timer <= 0 || effect.active === false) {
        abilityEffects.splice(i, 1);
    }
}
}

function updateParticles(deltaTime) {
for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    particle.x += particle.vx * (deltaTime / 16);
    particle.y += particle.vy * (deltaTime / 16);
    
    if (particle.gravity) {
        particle.vy += CONFIG.GRAVITY * 0.3;
    }
    
    particle.life -= deltaTime;
    
    if (particle.life < particle.maxLife * 0.3) {
        particle.alpha = particle.life / (particle.maxLife * 0.3);
    }
}
/* Remove partículas mortas e limita o número total de partículas */
particles = particles.filter(p => p.life > 0);
if (particles.length > CONFIG.MAX_PARTICLES) {
    particles.splice(0, particles.length - CONFIG.MAX_PARTICLES); /* Remove as partículas mais antigas */
}

if (!gameState.inMenu && !gameState.gamePaused) {
    if (Math.random() < CONFIG.SNOW_SPAWN_RATE) {
        addParticles('snow', gameState.cameraOffset.x + Math.random() * canvas.width, -10 + gameState.cameraOffset.y, 1);
    }
}
}

function updateDamageNumbers(deltaTime) {
const damageContainer = document.getElementById('particle-container');
const existingNumbers = damageContainer.querySelectorAll('.damage-number, .xp-number');

existingNumbers.forEach(number => {
    const timeLeft = parseFloat(number.dataset.timeLeft) - deltaTime;
    number.dataset.timeLeft = timeLeft;
    
    if (timeLeft <= 0) {
        number.remove();
    }
});
}

function updateCooldowns(deltaTime) {
for (const key in gameState.abilitiesCooldown) {
    if (gameState.abilitiesCooldown[key] > 0) {
        gameState.abilitiesCooldown[key] -= deltaTime / 1000;
        updateCooldownVisual(key);
    }
}
}

function updateCooldownVisual(key) {
const btn = document.getElementById(`ability-${key.toLowerCase()}`);
const overlay = btn?.querySelector('.cooldown-overlay');

if (btn && overlay) {
    const cooldownRatio = gameState.abilitiesCooldown[key] / gameState.abilitiesMaxCooldown[key];
    
    if (cooldownRatio > 0) {
        btn.classList.add('cooldown');
        const angle = 360 * (1 - cooldownRatio);
        overlay.style.background = `conic-gradient(from 0deg, transparent ${angle}deg, rgba(0, 0, 0, 0.8) ${angle}deg)`;
    } else {
        btn.classList.remove('cooldown');
        overlay.style.background = '';
    }
}
}

function updateRegeneration(deltaTime) {
if (gameState.playerMana < gameState.playerMaxMana) {
    gameState.playerMana += CONFIG.MANA_REGEN_RATE * (deltaTime / 1000);
    gameState.playerMana = Math.min(gameState.playerMana, gameState.playerMaxMana);
    updateManaBar();
}

if (gameState.playerHealth < gameState.playerMaxHealth && !gameState.isInvincible) {
    gameState.playerHealth += CONFIG.HEALTH_REGEN_RATE * (deltaTime / 1000);
    gameState.playerHealth = Math.min(gameState.playerHealth, gameState.playerMaxHealth);
    updateHealthBar();
}
}

function updateCamera(deltaTime) {
if (gameState.fixedCamera) {
    gameState.cameraOffset.x = gameState.fixedCameraTarget.x;
    gameState.cameraOffset.y = gameState.fixedCameraTarget.y;
    return;
}

gameState.targetCameraOffset.x = gameState.playerPosition.x - canvas.width / 2;
gameState.targetCameraOffset.y = gameState.playerPosition.y - canvas.height / 2;
gameState.targetCameraOffset.x = Math.max(0, Math.min(gameState.targetCameraOffset.x, CONFIG.WORLD_WIDTH - canvas.width));
gameState.targetCameraOffset.y = Math.max(-100, Math.min(gameState.targetCameraOffset.y, CONFIG.WORLD_HEIGHT - canvas.height + 100));

gameState.cameraOffset.x += (gameState.targetCameraOffset.x - gameState.cameraOffset.x) * CONFIG.CAMERA_SMOOTHING;
gameState.cameraOffset.y += (gameState.targetCameraOffset.y - gameState.cameraOffset.y) * CONFIG.CAMERA_SMOOTHING;
}

function updateFallingSpikes(deltaTime) {
for (let i = fallingSpikes.length - 1; i >= 0; i--) {
    const spike = fallingSpikes[i];
    
    if (!spike.active && 
        gameState.playerPosition.x > spike.x - 100 &&
        gameState.playerPosition.x < spike.x + spike.width + 100 &&
        gameState.playerPosition.y > spike.y) {
        spike.active = true;
    }
    
    if (spike.active) {
        spike.y += spike.speed;
        
        if (spike.y > CONFIG.WORLD_HEIGHT + 100) {
            fallingSpikes.splice(i, 1);
        }
    }
}
}

function checkFallingSpikeCollisions() {
if (gameState.isInvincible) return;

const playerWidth = CONFIG.PLAYER_WIDTH;
const playerHeight = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;
for (const spike of fallingSpikes) {
    if (!spike.active) continue;
    
    if (gameState.playerPosition.x < spike.x + spike.width &&
        gameState.playerPosition.x + playerWidth > spike.x &&
        gameState.playerPosition.y < spike.y + spike.height &&
        gameState.playerPosition.y + playerHeight > spike.y) {
        
        takeDamage(15);
        addParticles('hitSpark', spike.x + spike.width/2, spike.y + spike.height/2, 10);
        break;
    }
}
}

function checkCheckpoints() {
const playerWidth = CONFIG.PLAYER_WIDTH;
const playerHeight = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;

for (const checkpoint of checkpoints) {
    if (gameState.playerPosition.x < checkpoint.x + checkpoint.width &&
        gameState.playerPosition.x + playerWidth > checkpoint.x &&
        gameState.playerPosition.y < checkpoint.y + checkpoint.height &&
        gameState.playerPosition.y + playerHeight > checkpoint.y) {
        
        if (gameState.currentCheckpoint !== checkpoint.name) {
            saveCheckpoint(checkpoint.name);
        }
        break;
    }
}
}

function checkGameConditions() {
if (gameState.playerHealth <= 0) {
    gameOver();
}
}

// ===== SISTEMA DE HABILIDADES =====
function useAbility(key) {
if (!currentChampion || gameState.abilitiesCooldown[key] > 0) return;

const ability = currentChampion.abilities.find(a => a.key === key);
if (!ability) return;

if (gameState.playerMana < ability.manaCost) {
    flashScreen(COLOR_MANA, 200);
    return;
}

gameState.playerMana -= ability.manaCost;
gameState.abilitiesCooldown[key] = ability.cooldown;
ability.execute();
updateManaBar();
}

function addAbilityEffect(effect) {
effect.timer = effect.duration || 1000;
effect.origin = effect.origin || 'player';
effect.active = effect.active !== false;
effect.hitTargets = effect.hitTargets || [];

/* Adiciona posição inicial para cálculo de distância em closeOrb */
if (effect.type === 'closeOrb') {
    effect.startX = effect.x;
    effect.startY = effect.y;
}

abilityEffects.push(effect);
}

// ===== SISTEMA DE PARTÍCULAS =====
function addParticles(type, x, y, count, color = null) {
for (let i = 0; i < count; i++) {
    const particle = createParticle(type, x, y, color);
    particles.push(particle);
}
}

function createParticle(type, x, y, customColor = null) {
const baseParticle = {
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    size: 2 + Math.random() * 3,
    alpha: 1,
    gravity: false,
    type: type
};

switch(type) {
    case 'snow':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 1 + Math.random() * 2,
            size: 2 + Math.random() * 4,
            color: customColor || '#ffffff',
            life: 8000 + Math.random() * 4000,
            maxLife: 12000
        };
    case 'jumpDust':
    case 'landDust':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 3,
            vy: -1 - Math.random() * 2,
            color: customColor || '#aaaaaa',
            life: 400 + Math.random() * 200,
            maxLife: 600,
            gravity: true
        };
    case 'hitSpark':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: customColor || '#ffff00',
            life: 300 + Math.random() * 200,
            maxLife: 500
        };
    case 'deathExplosion':
    case 'explosion':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: customColor || (Math.random() > 0.5 ? COLOR_ACCENT_FIRE : COLOR_ACCENT_GOLD), /* Cores baseadas nas variáveis */
            life: 800 + Math.random() * 400,
            maxLife: 1200,
            size: 3 + Math.random() * 5
        };
    case 'projectileTrail':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: customColor || (currentChampion.id === 'umbraArcher' ? COLOR_UMBRA : COLOR_ACCENT_BLUE), // Usa a nova cor de Umbra
            life: 300 + Math.random() * 200,
            maxLife: 500,
            size: 1 + Math.random() * 2
        };
    case 'umbraFuria':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: customColor || COLOR_ACCENT_GOLD,
            life: 500 + Math.random() * 300,
            maxLife: 800,
            size: 3 + Math.random() * 4,
            gravity: false
        };
    case 'bossIntro':
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: customColor || COLOR_ACCENT_FIRE,
            life: 1000 + Math.random() * 500,
            maxLife: 1500,
            size: 4 + Math.random() * 6
        };
    case 'dashUmbra': // Nova partícula para o dash de Umbra
        return {
            ...baseParticle,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 4,
            color: customColor || COLOR_UMBRA,
            life: 400 + Math.random() * 300,
            maxLife: 700
        };
    default:
        return { ...baseParticle, color: customColor || '#ffffff', life: 500, maxLife: 500 };
}
}

// ===== SISTEMA DE DANO E COMBATE =====
function takeDamage(amount) {
if (gameState.isInvincible) return;

let finalDamage = amount;
if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) { /* Lógica mantida para Escolhido Original */
    finalDamage *= CONFIG.UMBRA_FURY_DAMAGE_REDUCTION;
}

gameState.playerHealth -= finalDamage;
gameState.playerHealth = Math.max(0, gameState.playerHealth);

playSound('sfx_damage_player');

gameState.isInvincible = true;
gameState.invincibilityTimer = CONFIG.INVINCIBILITY_DURATION;

flashScreen(COLOR_HEALTH, CONFIG.DAMAGE_FLASH_DURATION);
screenShake(5, 300);
showDamageNumber(finalDamage, gameState.playerPosition.x + CONFIG.PLAYER_WIDTH / 2, gameState.playerPosition.y, true);

updateHealthBar();

if (gameState.playerHealth <= 0) {
    gameOver();
}
}

function showDamageNumber(damage, x, y, isPlayerDamage = false) {
const damageContainer = document.getElementById('particle-container');
const damageNumber = document.createElement('div');

damageNumber.className = isPlayerDamage ? 'damage-number' : 'damage-number';
damageNumber.textContent = Math.round(damage);
damageNumber.style.left = (x - gameState.cameraOffset.x) + 'px';
damageNumber.style.top = (y - gameState.cameraOffset.y) + 'px';
damageNumber.style.color = isPlayerDamage ? COLOR_HEALTH : COLOR_TEXT_LIGHT;
damageNumber.dataset.timeLeft = '1000';

damageContainer.appendChild(damageNumber);
}

function gainXP(amount) {
gameState.playerXP += amount;

const xpContainer = document.getElementById('particle-container');
const xpNumber = document.createElement('div');
xpNumber.className = 'xp-number';
xpNumber.textContent = `+${amount} XP`;
xpNumber.style.left = (gameState.playerPosition.x + CONFIG.PLAYER_WIDTH / 2 - gameState.cameraOffset.x) + 'px';
xpNumber.style.top = (gameState.playerPosition.y - gameState.cameraOffset.y) + 'px';
xpNumber.dataset.timeLeft = '1500';
xpContainer.appendChild(xpNumber);

addParticles('xpGain', gameState.playerPosition.x + CONFIG.PLAYER_WIDTH / 2, gameState.playerPosition.y, 8, COLOR_XP);

if (gameState.playerXP >= gameState.playerNextLevelXP) {
    levelUp();
}

updateXPBar();
updatePlayerStats();
}

function levelUp() {
playSound('sfx_level_up');
gameState.playerLevel++;
gameState.playerXP -= gameState.playerNextLevelXP;
gameState.playerNextLevelXP = Math.floor(gameState.playerNextLevelXP * 1.8); // NOVO: XP para próximo nível escala mais rápido

flashScreen(COLOR_XP, 500);
addParticles('umbraFuria', gameState.playerPosition.x + CONFIG.PLAYER_WIDTH / 2, gameState.playerPosition.y + CONFIG.PLAYER_HEIGHT / 2, 30);

showLevelUpMenu();
}

function showLevelUpMenu() {
activateOverlayMenu('level-up'); // Usa o helper
gameState.gamePaused = true; // Pausa o jogo quando o menu de level up está ativo
}

function applyUpgrade(upgradeType) {
switch(upgradeType) {
    case 'health':
        gameState.playerMaxHealth += 25;
        gameState.playerHealth = gameState.playerMaxHealth;
        break;
    case 'mana':
        gameState.playerMaxMana += 35;
        gameState.playerMana = gameState.playerMaxMana;
        CONFIG.MANA_REGEN_RATE *= 1.5;
        break;
    case 'damage':
        gameState.playerDamage += 8;
        break;
    case 'speed':
        gameState.playerSpeed += 0.8;
        for (const key in gameState.abilitiesMaxCooldown) {
            gameState.abilitiesMaxCooldown[key] *= 0.85;
        }
        break;
}

deactivateOverlayMenu('level-up'); // Usa o helper
gameState.gamePaused = false; // Retoma o jogo

updateAllUI();
saveProgress();
}

// ===== BOSS FIGHT - TAREK =====
function triggerBossFight() {
gameState.inBossFight = true;
gameState.fixedCamera = true;

playSound('sfx_boss_roar');

const tarek = {
    type: 'boss',
    name: 'Tarek, o Guerreiro',
    position: { x: canvas.width - 150, y: 300 },
    facing: 'left',
    health: 500,
    maxHealth: 500,
    damage: 25,
    speed: 1.5,
    velocity: { x: 0, y: 0 },
    isGrounded: false,
    xpValue: 250, // NOVO: XP do boss reduzido
    
    aiState: 'combat',
    aiTimer: 0,
    attackCooldown: 0,
    lastAttack: 0,
    
    abilities: [
        { name: 'Golpe Devastador', cooldown: 3000, range: 80, damage: 35 },
        { name: 'Investida Gélida', cooldown: 6000, range: 300, damage: 45 },
        { name: 'Orbe Congelante', cooldown: 5000, range: 400, damage: 30 },
        { name: 'Prisão de Gelo', cooldown: 10000, range: 200, damage: 20 }
    ]
};

enemies.push(tarek);

document.getElementById('boss-name').style.display = 'block';
document.getElementById('boss-health-bar').style.display = 'block';
updateBossHealthBar(tarek);

saveCheckpoint('tarek_fight_start');

screenShake(8, 500);
flashScreen(COLOR_ACCENT_FIRE, 300);
addParticles('bossIntro', tarek.position.x + 35, tarek.position.y + 35, 40);
}

function updateBossAI(boss, deltaTime) {
const distanceToPlayer = Math.abs(boss.position.x - gameState.playerPosition.x);
const currentTime = Date.now();

const arenaLeft = 50;
const arenaRight = canvas.width - 120;
if (boss.position.x < arenaLeft) {
    boss.position.x = arenaLeft;
    boss.velocity.x = 0;
}
if (boss.position.x > arenaRight) {
    boss.position.x = arenaRight;
    boss.velocity.x = 0;
}

if (boss.health < boss.maxHealth * 0.4 && !boss.enraged) {
    boss.enraged = true;
    boss.speed *= 1.3;
    boss.damage *= 1.1;
    boss.abilities.forEach(ab => ab.cooldown *= 0.8);

    flashScreen(COLOR_ACCENT_FIRE, 500);
    addParticles('bossIntro', boss.position.x + 35, boss.position.y + 35, 50);

    showDialog("TAREK", "Você... é mais forte do que pensei! Mas não vou cair facilmente!", []);
}

boss.abilities.forEach(ability => {
    if (currentTime - (ability.lastUsed || 0) < ability.cooldown) {
        ability.ready = false;
    } else {
        ability.ready = true;
    }
});

boss.aiTimer += deltaTime;

switch(boss.aiState) {
    case 'combat':
        let chosenAbility = null;
        const rand = Math.random();

        if (distanceToPlayer < boss.abilities[0].range && boss.abilities[0].ready) {
            chosenAbility = boss.abilities[0];
        } else if (distanceToPlayer > 100 && distanceToPlayer < boss.abilities[1].range && boss.abilities[1].ready) {
            chosenAbility = boss.abilities[1];
        } else if (distanceToPlayer > 150 && boss.abilities[2].ready) {
            chosenAbility = boss.abilities[2];
        } else if (boss.abilities[3].ready && rand < 0.3) {
            chosenAbility = boss.abilities[3];
        }
        
        if (chosenAbility && boss.aiTimer > 500) {
            executeBossAbility(boss, chosenAbility);
            boss.aiState = 'attacking';
            boss.aiTimer = 0;
        } else {
            moveBossTowardsPlayer(boss, distanceToPlayer);
        }
        break;
        
    case 'attacking':
        if (boss.aiTimer > 1000) {
            boss.aiState = 'combat';
            boss.aiTimer = 0;
        }
        break;
}
updateBossHealthBar(boss);
}

function moveBossTowardsPlayer(boss, distance) {
if (distance > 50) {
    const direction = gameState.playerPosition.x > boss.position.x ? 1 : -1;
    boss.position.x += direction * boss.speed;
    boss.facing = direction === 1 ? 'right' : 'left';

    if (gameState.isGrounded && gameState.playerPosition.y < boss.position.y - 50 && boss.isGrounded) {
        boss.velocity.y = -CONFIG.JUMP_FORCE * 0.8;
        boss.isGrounded = false;
    }
} else {
    boss.velocity.x = 0;
}
}

function executeBossAbility(boss, ability) {
const direction = gameState.playerPosition.x > boss.position.x ? 1 : -1;
ability.lastUsed = Date.now();

switch(ability.name) {
    case 'Golpe Devastador':
        addAbilityEffect({
            type: 'bossSlash',
            x: boss.position.x + (direction > 0 ? 70 : -50),
            y: boss.position.y + 10,
            width: 70,
            height: 30,
            duration: 300,
            damage: ability.damage,
            origin: 'enemy',
            knockback: 20
        });
        screenShake(6, 300);
        break;
    case 'Investida Gélida':
        boss.velocity.x = direction * 10;
        addAbilityEffect({
            type: 'bossDash',
            x: boss.position.x,
            y: boss.position.y,
            width: 70,
            height: 50,
            duration: 800,
            damage: ability.damage,
            origin: 'enemy',
            followBoss: boss
        });
        addParticles('dashIce', boss.position.x + 35, boss.position.y + 35, 30);
        screenShake(8, 400);
        break;
    case 'Orbe Congelante':
        addAbilityEffect({
            type: 'bossIceOrb',
            x: boss.position.x + (direction > 0 ? 80 : -30),
            y: boss.position.y + 20,
            width: 40,
            height: 40,
            duration: 3000,
            damage: ability.damage,
            direction: direction,
            speed: 4,
            origin: 'enemy'
        });
        break;
    case 'Prisão de Gelo':
        for (let i = 0; i < 3; i++) {
            const offsetX = (i - 1) * 80;
            addAbilityEffect({
                type: 'bossPrison',
                x: gameState.playerPosition.x + offsetX - 15,
                y: gameState.playerPosition.y - 60,
                width: 30,
                height: 120,
                duration: 5000,
                damage: ability.damage,
                origin: 'enemy',
                trapping: true,
                delay: i * 200,
                active: false
            });
        }
        screenShake(5, 600);
        break;
}
}

function updateBossHealthBar(boss) {
const healthFill = document.getElementById('boss-health-fill');
const healthPercentage = (boss.health / boss.maxHealth) * 100;
healthFill.style.width = healthPercentage + '%';

if (healthPercentage > 60) {
    healthFill.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
} else if (healthPercentage > 30) {
    healthFill.style.background = 'linear-gradient(90deg, #ff9800, #ffc107)';
} else {
    healthFill.style.background = 'linear-gradient(90deg, #f44336, #e53935)';
}
}

function defeatBoss(boss) {
gameState.bossDefeated = true;
gameState.inBossFight = false;

stopMusic();

document.getElementById('boss-name').style.display = 'none';
document.getElementById('boss-health-bar').style.display = 'none';

flashScreen(COLOR_ACCENT_GOLD, 800);
screenShake(10, 1000);
addParticles('victoryExplosion', boss.position.x + 35, boss.position.y + 35, 60);

gainXP(boss.xpValue);

const bossIndex = enemies.indexOf(boss);
if (bossIndex > -1) {
    enemies.splice(bossIndex, 1);
}

setTimeout(() => {
    showDialog(
        "TAREK",
        `Impressionante, ${gameState.playerName}... Você realmente tem a força de um Escolhido. Pode passar, mas saiba que desafios ainda maiores o aguardam adiante.`,
        [
            {
                text: "Obrigado pela luta honrosa, Tarek.",
                action: () => {
                    showDialog(
                        "TAREK",
                        "Que os ventos gelados guiem seus passos, Escolhido. E que você encontre o que procura antes que seja tarde demais.",
                        [
                            {
                                text: "Fim da Primeira Jornada", // Texto final ajustado
                                action: () => {
                                    saveCheckpoint('boss_defeated');
                                    showDialog(
                                        "NARRAÇÃO",
                                        "Com Tarek derrotado, o caminho para o interior de Tupãry está aberto. Mas esta é apenas a primeira de muitas provações que aguardam o Escolhido...",
                                        [
                                            {
                                                text: "Fim da Demo (Avance para a Missão 2 em breve)",
                                                action: () => showVictoryScreen()
                                            }
                                        ]
                                    );
                                }
                            }
                        ]
                    );
                }
            }
        ]
    );
}, 2000);
}

// ===== EFEITOS VISUAIS =====
function screenShake(intensity, duration) {
if (!gameSettings.screenShake) return;
const gameContainer = document.getElementById('game-container');
const originalTransform = gameContainer.style.transform;

const startTime = Date.now();

function shake() {
    const elapsed = Date.now() - startTime;
    if (elapsed < duration) {
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        
        const offsetX = (Math.random() - 0.5) * currentIntensity;
        const offsetY = (Math.random() - 0.5) * currentIntensity;
        
        gameContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(shake);
    } else {
        gameContainer.style.transform = originalTransform;
    }
}

shake();
}

function flashScreen(color, duration) {
const flash = document.getElementById('screen-flash');
flash.style.background = color;
flash.classList.add('active');

setTimeout(() => {
    flash.classList.remove('active');
}, duration);
}

// ===== RENDERIZAÇÃO =====
function render(deltaTime) { // NOVO: Recebe deltaTime
ctx.clearRect(0, 0, canvas.width, canvas.height);

renderBackground();
renderPlatforms();
renderFallingSpikes();
renderAbilityEffects();
renderPlayer();
renderEnemies();
renderParticles();

if (window.DEBUG_MODE) {
    renderDebugInfo();
}
}

function renderMenu() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--primary-dark'));
gradient.addColorStop(0.3, getComputedStyle(document.documentElement).getPropertyValue('--primary-medium'));
gradient.addColorStop(0.7, getComputedStyle(document.documentElement).getPropertyValue('--primary-light'));
gradient.addColorStop(1, '#2c3e50');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderBackground() {
const cameraX = (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
const cameraY = (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);

// Se for um background estático (como o do Tarek), renderiza e sai
if (backgroundLayers.length > 0 && backgroundLayers[0].type === 'image') {
    const imgAssetData = CONFIG.ASSET_LOADED[backgroundLayers[0].assetKey];
    if (imgAssetData && imgAssetData.loaded) {
        ctx.drawImage(imgAssetData.img, 0, 0, canvas.width, canvas.height);
        return;
    }
}

// Fundo degradê padrão se não houver imagens de parallax ou se não estiverem carregadas
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--primary-dark'));
gradient.addColorStop(0.3, getComputedStyle(document.documentElement).getPropertyValue('--primary-medium'));
gradient.addColorStop(0.7, getComputedStyle(document.documentElement).getPropertyValue('--primary-light'));
gradient.addColorStop(1, '#2c3e50');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// NOVO: Renderiza as camadas de fundo com parallax usando imagens
backgroundLayers.forEach(layer => {
    if (layer.type === 'parallax_image') {
        const imgAssetData = CONFIG.ASSET_LOADED[layer.assetKey];
        if (imgAssetData && imgAssetData.loaded) {
            const img = imgAssetData.img;
            const parallaxX = (cameraX * layer.parallaxSpeed) % img.width; // Offset X para o parallax
            const imgY = layer.yOffset; // Ajuste vertical da imagem (opcional)

            // Desenha a imagem várias vezes para cobrir toda a largura do mundo (tiling)
            // Calcula quantas vezes a imagem precisa ser desenhada para preencher a tela
            const numTiles = Math.ceil(canvas.width / img.width) + 1; // +1 para garantir que não haja lacunas no scroll
            for (let i = 0; i < numTiles; i++) {
                // Calcula a posição X para desenhar cada "tile" da imagem
                // Subtrai parallaxX para simular o movimento da câmera
                // Adiciona img.width * i para posicionar os tiles lado a lado
                const drawX = -parallaxX + (img.width * i);
                ctx.drawImage(img, drawX, imgY, img.width, canvas.height - imgY); // Ajusta a altura da imagem para preencher até a parte inferior
            }
        }
    }
});

ctx.globalAlpha = 1;
}

function renderPlatforms() {
for (const platform of platforms) {
    const x = platform.x - (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
    const y = platform.y - (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);
    if (x + platform.width < -50 || x > canvas.width + 50 || 
        y + platform.height < -50 || y > canvas.height + 50) {
        continue;
    }
    
    if (platform.type === 'ground' || platform.type === 'platform') {
        if (platform.slippery) {
            const iceGradient = ctx.createLinearGradient(x, y, x, y + platform.height);
            iceGradient.addColorStop(0, COLOR_ACCENT_ICE);
            iceGradient.addColorStop(0.5, '#bbdefb');
            iceGradient.addColorStop(1, '#90caf9');
            ctx.fillStyle = iceGradient;
        } else {
            const stoneGradient = ctx.createLinearGradient(x, y, x, y + platform.height);
            stoneGradient.addColorStop(0, '#5a5a5a');
            stoneGradient.addColorStop(0.5, '#4a4a4a');
            stoneGradient.addColorStop(1, '#3a3a3a');
            ctx.fillStyle = stoneGradient;
        }
        ctx.fillRect(x, y, platform.width, platform.height);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, platform.width, platform.height);
    } else if (platform.type === 'spike') {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--spike-color');
        ctx.beginPath();
        for (let i = 0; i < platform.width; i += 10) {
            ctx.moveTo(x + i, y + platform.height);
            ctx.lineTo(x + i + 5, y);
            ctx.lineTo(x + i + 10, y + platform.height);
            ctx.fill();
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, platform.width, platform.height);
    }
}
}

function renderFallingSpikes() {
for (const spike of fallingSpikes) {
    if (!spike.active) continue;
    
    const x = spike.x - (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
    const y = spike.y - (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);
    
    if (x + spike.width < -50 || x > canvas.width + 50 || 
        y + spike.height < -50 || y > canvas.height + 50) {
        continue;
    }
    
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--spike-color');
    ctx.beginPath();
    ctx.moveTo(x, y + spike.height);
    ctx.lineTo(x + spike.width/2, y);
    ctx.lineTo(x + spike.width, y + spike.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
}
}

function renderPlayer() {
const x = gameState.playerPosition.x - (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
const y = gameState.playerPosition.y - (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);
const width = CONFIG.PLAYER_WIDTH; // Usar a largura definida no CONFIG
const height = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT; // Usar altura definida no CONFIG

if (x + width < -50 || x > canvas.width + 50 || y + height < -50 || y > canvas.height + 50) {
    return;
}

if (gameState.isInvincible && Math.floor(Date.now() / 100) % 2) {
    ctx.globalAlpha = 0.5; // Efeito de piscar durante a invencibilidade
}

// NOVO: Usa o AnimationManager para obter o quadro atual
let currentFrameData = playerAnimation[gameState.currentAnimation].getCurrentFrame();
let playerImage = currentFrameData ? currentFrameData.img : null;
let imageLoaded = currentFrameData ? currentFrameData.loaded : false;


if (playerImage && imageLoaded) {
    ctx.save(); // Salva o estado atual do canvas
    if (gameState.facing === 'left') {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1); // Espelha a imagem horizontalmente
        ctx.drawImage(playerImage, 0, 0, width, height); // Desenha a imagem espelhada
    } else {
        ctx.drawImage(playerImage, x, y, width, height); // Desenha a imagem normalmente
    }
    ctx.restore(); // Restaura o estado anterior do canvas

        // --- NEW: Debug Animation Info (if enabled) ---
    if (window.DEBUG_MODE && playerAnimation[gameState.currentAnimation] && playerAnimation[gameState.currentAnimation].frames.length > 1) {
        const debugInfoDiv = document.getElementById('debug-animation-info');
        debugInfoDiv.style.display = 'block';
        debugInfoDiv.textContent = `Anim: ${gameState.currentAnimation} [${playerAnimation[gameState.currentAnimation].getCurrentFrameIndex()}/${playerAnimation[gameState.currentAnimation].frames.length - 1}]`;
    } else if (window.DEBUG_MODE) {
        document.getElementById('debug-animation-info').style.display = 'none';
    }
} else {
    // Fallback: Desenha um retângulo colorido se o GIF não carregar ou se o frame for um placeholder
    let playerColor;
    if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) {
        playerColor = COLOR_ACCENT_GOLD;
    } else if (currentChampion.id === 'umbraArcher') { // Usar a nova cor
        playerColor = COLOR_UMBRA;
    } else {
        playerColor = COLOR_ACCENT_BLUE;
    }
    ctx.fillStyle = playerColor;
    ctx.fillRect(x, y, width, height);
}

ctx.globalAlpha = 1; // Reseta a opacidade global
}

function renderEnemies() {
for (const enemy of enemies) {
    const x = enemy.position.x - (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
    const y = enemy.position.y - (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);
    const width = enemy.type === 'boss' || enemy.type === 'boss_dialogue' ? 70 : 50;
    const height = enemy.type === 'boss' || enemy.type === 'boss_dialogue' ? 70 : 50;
    
    if (x + width < -50 || x > canvas.width + 50 || y + height < -50 || y > canvas.height + 50) {
        continue;
    }
    
    if (enemy.frozen) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = COLOR_ACCENT_ICE;
        ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
    }
    
    if (enemy.type === 'sentinel') {
        renderSentinel(enemy, x, y, width, height);
    } else if (enemy.type === 'boss' || enemy.type === 'boss_dialogue') {
        renderBoss(enemy, x, y, width, height);
    }
    
    if (enemy.health < enemy.maxHealth && enemy.health > 0 && enemy.type !== 'boss_dialogue') {
        const barWidth = width + 10;
        const barHeight = 6;
        const barX = x - 5;
        const barY = y - 15;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    if ((enemy.type === 'boss' || enemy.type === 'boss_dialogue') && enemy.name) {
        ctx.fillStyle = COLOR_TEXT_LIGHT;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, x + width/2, y - 25);
        ctx.textAlign = 'left';
    }
    
    ctx.globalAlpha = 1;
}
}

function renderSentinel(enemy, x, y, width, height) {
// NOVO: Usa o AnimationManager para o sentinel
const sentinelFrameData = sentinelAnimation.getCurrentFrame();
const sentinelImage = sentinelFrameData ? sentinelFrameData.img : null;
const imageLoaded = sentinelFrameData ? sentinelFrameData.loaded : false;

if (sentinelImage && imageLoaded) {
    ctx.drawImage(sentinelImage, x, y, width, height);
} else {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(x + 10, y + 10, width - 20, height - 20);

    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(x + 15, y + 5, 4, 4);
    ctx.fillRect(x + 31, y + 5, 4, 4);
}
}

function renderBoss(enemy, x, y, width, height) {
const bossWidth = 70;
const bossHeight = 70;
const bossX = x;
const bossY = y;

if (enemy.enraged) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(bossX - 5, bossY - 5, bossWidth + 10, bossHeight + 10);
}

// NOVO: Usa o AnimationManager para o Tarek
const bossFrameData = tarekAnimation.getCurrentFrame();
const bossImage = bossFrameData ? bossFrameData.img : null;
const imageLoaded = bossFrameData ? bossFrameData.loaded : false;

if (bossImage && imageLoaded) {
    ctx.save();
    if (enemy.facing === 'left') {
        ctx.translate(bossX + bossWidth, bossY);
        ctx.scale(-1, 1);
        ctx.drawImage(bossImage, 0, 0, bossWidth, bossHeight);
    } else {
        ctx.drawImage(bossImage, bossX, bossY, bossWidth, bossHeight);
    }
    ctx.restore();
} else {
    const bossGradient = ctx.createLinearGradient(bossX, bossY, bossX, bossY + bossHeight);
    bossGradient.addColorStop(0, '#a0522d');
    bossGradient.addColorStop(0.5, '#8b4513');
    bossGradient.addColorStop(1, '#692e0e');
    
    ctx.fillStyle = bossGradient;
    ctx.fillRect(bossX, bossY, bossWidth, bossHeight);
    
    ctx.fillStyle = '#4a2d1d';
    ctx.fillRect(bossX + 10, bossY + 15, bossWidth - 20, 20);

    ctx.fillStyle = COLOR_ACCENT_FIRE;
    ctx.fillRect(bossX + 20, bossY + 8, 6, 6);
    ctx.fillRect(bossX + bossWidth - 26, bossY + 8, 6, 6);
}
}

function renderAbilityEffects() {
for (const effect of abilityEffects) {
    const x = effect.x - (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
    const y = effect.y - (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);
    
    if (x + effect.width < -50 || x > canvas.width + 50 || 
        y + effect.height < -50 || y > canvas.height + 50 || !effect.active) {
        continue;
    }
    
    switch(effect.type) {
        case 'meleeAttack':
            renderMeleeAttack(effect, x, y);
            break;
        case 'energyProjectile':
            renderEnergyProjectile(effect, x, y);
            break;
        case 'arcaneExplosion':
            renderArcaneExplosion(effect, x, y);
            break;
        case 'bossSlash':
            renderBossSlash(effect, x, y);
            break;
        case 'bossIceOrb':
            renderBossIceOrb(effect, x, y);
            break;
        case 'bossPrison':
            renderBossPrison(effect, x, y);
            break;
        case 'enemyIceShot':
            renderEnemyIceShot(effect, x, y);
            break;
        case 'chargeAttack':
            renderChargeAttack(effect, x, y);
            break;
        case 'closeOrb':
            renderCloseOrb(effect, x, y);
            break;
        case 'crystalBarrier':
            renderCrystalBarrier(effect, x, y);
            break;
        case 'defensivePrison':
            renderDefensivePrison(effect, x, y);
            break;
        case 'umbraWall': // NEW: Renderização da Muralha de Umbra
            ctx.fillStyle = 'rgba(123, 0, 153, 0.6)'; // Cor de Umbra com transparência
            ctx.fillRect(x, y, effect.width, effect.height);

            // Adicionar uma borda brilhante
            ctx.strokeStyle = COLOR_UMBRA; // Cor de Umbra sólida
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15; // Efeito de brilho
            ctx.shadowColor = COLOR_UMBRA;
            ctx.strokeRect(x, y, effect.width, effect.height);
            ctx.shadowBlur = 0; // Resetar sombra para não afetar outros elementos
            break;
    }
}
}

function renderMeleeAttack(effect, x, y) {
const alpha = 1 - (effect.duration - effect.timer) / effect.duration;
ctx.globalAlpha = alpha * 0.8;

ctx.fillStyle = (currentChampion.id === 'chosenOne' && effect.umbraBoosted) ? COLOR_ACCENT_GOLD : COLOR_TEXT_LIGHT;
ctx.fillRect(x, y, effect.width, effect.height);

ctx.globalAlpha = 1;
}

function renderEnergyProjectile(effect, x, y) {
ctx.fillStyle = currentChampion.id === 'umbraArcher' ? COLOR_UMBRA : COLOR_ACCENT_BLUE; // Usa a nova cor de Umbra
ctx.fillRect(x, y, effect.width, effect.height);
}

function renderArcaneExplosion(effect, x, y) {
const progress = 1 - (effect.timer / effect.duration);            
const maxRadius = effect.width / 2;
const currentRadius = maxRadius * progress;

ctx.globalAlpha = (1 - progress) * 0.7;

const gradient = ctx.createRadialGradient(
    x + effect.width/2, y + effect.height/2, 0,
    x + effect.width/2, y + effect.height/2, currentRadius
);
gradient.addColorStop(0, COLOR_ACCENT_GOLD);
gradient.addColorStop(0.5, COLOR_ACCENT_GOLD);
gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');

ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(x + effect.width/2, y + effect.height/2, currentRadius, 0, Math.PI * 2);
ctx.fill();

ctx.globalAlpha = 1;
}

function renderBossSlash(effect, x, y) {
const alpha = 1 - (effect.duration - effect.timer) / effect.duration;

ctx.globalAlpha = alpha;
ctx.fillStyle = COLOR_ACCENT_FIRE;
ctx.fillRect(x, y, effect.width, effect.height);
ctx.globalAlpha = 1;
}

function renderBossIceOrb(effect, x, y) {
ctx.fillStyle = COLOR_ACCENT_ICE;
ctx.beginPath();
ctx.arc(x + effect.width/2, y + effect.height/2, effect.width/2, 0, Math.PI * 2);
ctx.fill();
}

function renderBossPrison(effect, x, y) {
ctx.fillStyle = 'rgba(168, 208, 230, 0.7)';
ctx.fillRect(x, y, effect.width, effect.height);

ctx.strokeStyle = COLOR_ACCENT_ICE;
ctx.lineWidth = 3;
ctx.strokeRect(x, y, effect.width, effect.height);
}

function renderEnemyIceShot(effect, x, y) {
ctx.fillStyle = COLOR_ACCENT_ICE;
ctx.fillRect(x, y, effect.width, effect.height);
}

function renderChargeAttack(effect, x, y) {
const alpha = 1 - (effect.duration - effect.timer) / effect.duration;
ctx.globalAlpha = alpha * 0.7;
ctx.fillStyle = COLOR_WARRIOR;
ctx.fillRect(x, y, effect.width, effect.height);
ctx.globalAlpha = 1;
}

function renderCloseOrb(effect, x, y) {
ctx.fillStyle = COLOR_WARRIOR;
ctx.beginPath();
ctx.arc(x + effect.width/2, y + effect.height/2, effect.width/2, 0, Math.PI * 2);
ctx.fill();
}

function renderCrystalBarrier(effect, x, y) {
ctx.fillStyle = 'rgba(144, 224, 239, 0.6)';
ctx.fillRect(x, y, effect.width, effect.height);
ctx.strokeStyle = COLOR_ACCENT_ICE;
ctx.lineWidth = 3;
ctx.strokeRect(x, y, effect.width, effect.height);
}

function renderDefensivePrison(effect, x, y) {
ctx.fillStyle = 'rgba(102, 187, 106, 0.6)';
ctx.fillRect(x, y, effect.width, effect.height);
ctx.strokeStyle = COLOR_WARRIOR;
ctx.lineWidth = 3;
ctx.strokeRect(x, y, effect.width, effect.height);
}

function renderParticles() {
for (const particle of particles) {
    const x = particle.x - (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x);
    const y = particle.y - (gameState.fixedCamera ? gameState.fixedCameraTarget.y : gameState.cameraOffset.y);
    
    if (x < -20 || x > canvas.width + 20 || y < -20 || y > canvas.height + 20) {
        continue;
    }
    
    ctx.globalAlpha = particle.alpha || 1;
    ctx.fillStyle = particle.color;
    
    switch(particle.type) {
        case 'snow':
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        default:
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

ctx.globalAlpha = 1;
}

function renderDebugInfo() {
if (!window.DEBUG_MODE) return;

ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
ctx.fillRect(10, canvas.height - 150, 200, 140);

ctx.fillStyle = '#00ff00';
ctx.font = '12px monospace';
ctx.fillText(`FPS: ${Math.round(1000 / (Date.now() - lastTime))}`, 15, canvas.height - 130);
ctx.fillText(`Player: ${Math.round(gameState.playerPosition.x)}, ${Math.round(gameState.playerPosition.y)}`, 15, canvas.height - 115);
ctx.fillText(`Velocity: ${Math.round(gameState.playerVelocity.x)}, ${Math.round(gameState.playerVelocity.y)}`, 15, canvas.height - 100);
ctx.fillText(`Camera: ${Math.round(gameState.cameraOffset.x)}, ${Math.round(gameState.cameraOffset.y)}`, 15, canvas.height - 85);
ctx.fillText(`Enemies: ${enemies.length}`, 15, canvas.height - 70);
ctx.fillText(`Particles: ${particles.length}`, 15, canvas.height - 55);
ctx.fillText(`Effects: ${abilityEffects.length}`, 15, canvas.height - 40);
ctx.fillText(`Grounded: ${gameState.isGrounded}`, 15, canvas.height - 25);
ctx.fillText(`Animation: ${gameState.currentAnimation}`, 15, canvas.height - 10);
}

// ===== ATUALIZAÇÃO DE UI (Otimizada) =====
function updateAllUI() {
updateHealthBar();
updateManaBar();
updateXPBar();
updatePlayerStats();
}

function updateHealthBar() {
const healthFill = document.getElementById('health-fill');
const healthText = document.getElementById('health-text');

const currentHealth = Math.round(gameState.playerHealth);
const currentMaxHealth = gameState.playerMaxHealth;

if (currentHealth !== lastPlayerHealth || currentMaxHealth !== parseFloat(healthFill.dataset.maxHealth)) {
    const percentage = (currentHealth / currentMaxHealth) * 100;
    healthFill.style.width = percentage + '%';
    healthText.textContent = `${currentHealth}/${currentMaxHealth}`;
    healthFill.dataset.maxHealth = currentMaxHealth.toString(); /* Armazena o maxHealth no dataset para comparação futura */
    lastPlayerHealth = currentHealth;
}
}

function updateManaBar() {
const manaFill = document.getElementById('mana-fill');
const manaText = document.getElementById('mana-text');

const currentMana = Math.round(gameState.playerMana);
const currentMaxMana = gameState.playerMaxMana;

if (currentMana !== lastPlayerMana || currentMaxMana !== parseFloat(manaFill.dataset.maxMana)) {
    const percentage = (currentMana / currentMaxMana) * 100;
    manaFill.style.width = percentage + '%';
    manaText.textContent = `${currentMana}/${currentMaxMana}`;
    manaFill.dataset.maxMana = currentMaxMana.toString();
    lastPlayerMana = currentMana;
}
}

function updateXPBar() {
const xpFill = document.getElementById('xp-fill');
const xpText = document.getElementById('xp-text');

const currentXP = gameState.playerXP;
const currentNextLevelXP = gameState.playerNextLevelXP;

if (currentXP !== lastPlayerXP || currentNextLevelXP !== parseFloat(xpFill.dataset.nextLevelXP)) {
    const percentage = (currentXP / currentNextLevelXP) * 100;
    xpFill.style.width = percentage + '%';
    xpText.textContent = `${currentXP}/${currentNextLevelXP}`;
    xpFill.dataset.nextLevelXP = currentNextLevelXP.toString();
    lastPlayerXP = currentXP;
}
}

function updatePlayerStats() {
const levelEl = document.getElementById('player-level');
const classEl = document.getElementById('player-class');
const damageEl = document.getElementById('player-damage');

if (levelEl && gameState.playerLevel !== lastPlayerLevel) {
    levelEl.textContent = gameState.playerLevel;
    lastPlayerLevel = gameState.playerLevel;
}
if (classEl && currentChampion && currentChampion.name.split(' ')[0] !== lastPlayerClass) {
    classEl.textContent = currentChampion.name.split(' ')[0];
    lastPlayerClass = currentChampion.name.split(' ')[0];
}
if (damageEl && Math.round(gameState.playerDamage) !== lastPlayerDamage) {
    damageEl.textContent = Math.round(gameState.playerDamage);
    lastPlayerDamage = Math.round(gameState.playerDamage);
}
}

// ===== CONTROLE DE JOGO =====
function togglePause() {
if (gameState.inMenu || gameState.inCutscene || gameState.inDialog) return;

gameState.gamePaused = !gameState.gamePaused;

if (gameState.gamePaused) {
    activateOverlayMenu('pause-menu'); // Ativa o menu de pausa
    stopMusic();
} else {
    deactivateOverlayMenu('pause-menu'); // Desativa o menu de pausa
    if (gameState.inBossFight) {
        playMusic('music_boss_tarek', true);
    } else {
        playMusic('music_platforming', true);
    }
}
}

/* NEW: Fullscreen Toggle */
function toggleFullscreen() {
if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
        //console.error(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
    });
} else {
    document.exitFullscreen();
}
}

function gameOver() {
gameState.gamePaused = true;
stopMusic();

flashScreen('rgba(0, 0, 0, 0.8)', 1000);

setTimeout(() => {
    // Garante que todos os menus possíveis são fechados antes de mostrar o diálogo de game over
    deactivateOverlayMenu('pause-menu');
    deactivateOverlayMenu('level-up');
    deactivateOverlayMenu('cinematic-overlay');
    // showDialog já ativa dialog-container com pointer-events auto
    showDialog(
        "SISTEMA",
        `${gameState.playerName} foi derrotado... Mas a jornada não termina aqui. O destino de todos os reinos ainda depende de suas escolhas.`,
        [
            {
                text: "Voltar ao último checkpoint",
                action: () => {
                    restartFromCheckpoint();
                }
            },
            {
                text: "Reiniciar fase atual",
                action: () => {
                    loadPhase(gameState.currentPhase);
                    gameState.gamePaused = false;
                }
            },
            {
                text: "Voltar ao menu principal",
                action: () => {
                    exitToMenu();
                }
            }
        ]
    );
}, 1500);
}

function showVictoryScreen() {
const overlay = document.getElementById('cinematic-overlay');
const titleElement = document.getElementById('cinematic-title');
const textElement = document.getElementById('cinematic-text');
const gifElement = document.getElementById('cutscene-gif'); // Ocultar GIF na tela de vitória
gifElement.style.display = 'none';
gifElement.src = '';

activateOverlayMenu('cinematic-overlay'); // Ativa o overlay de cutscene para a tela de vitória
titleElement.textContent = "VITÓRIA!";
textElement.innerHTML = `
    <p>Parabéns, ${gameState.playerName}!</p>
    <br>
    <p>Você completou a primeira parte da jornada em Tupãry. Tarek foi derrotado e o caminho para o interior do reino gelado está aberto.</p>
    <br>
    <p>Mas esta é apenas a primeira de muitas provações. O Coração de Gelo ainda aguarda, e Ignys se aproxima...</p>
    <br>
    <p><strong>Estatísticas Finais:</strong></p>
    <p>Nível Alcançado: ${gameState.playerLevel}</p>
    <p>Classe: ${currentChampion ? currentChampion.name : 'Desconhecida'}</p>
    <p>XP Total: ${gameState.playerXP}</p>
    <br>
    <p><em>Obrigado por jogar Tupãry: O Reino Congelado!</em></p>
    <p><em>Mais capítulos em breve...</em></p>
`;

titleElement.style.animation = 'none';
textElement.style.animation = 'none';
void titleElement.offsetWidth;
void textElement.offsetWidth;
titleElement.style.animation = 'fadeInText 2s forwards';
textElement.style.animation = 'fadeInText 3s forwards 1s';

const skipBtn = document.getElementById('skip-btn');
skipBtn.textContent = 'Voltar ao Menu';
// Altera o comportamento do botão para voltar ao menu
skipBtn.onclick = () => {
    setCookie('tupary_save', '', -1);
    setCookie('tupary_checkpoint', '', -1);
    exitToMenu();
};
}

// ===== SISTEMA DE CONFIGURAÇÕES =====
const gameSettings = {
volume: 0.7,
sfxVolume: 0.8,
musicVolume: 0.6,
showFPS: false,
particleQuality: 'high',
screenShake: true,

load: function() {
    const saved = getCookie('tupary_settings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            Object.assign(this, settings);
        } catch (e) {
            //console.error('Erro ao carregar configurações:', e);
        }
    }
},

save: function() {
    setCookie('tupary_settings', JSON.stringify(this));
}
};

// ===== OTIMIZAÇÕES DE PERFORMANCE =====
function optimizePerformance() {
const fps = 1000 / (Date.now() - lastTime);

if (fps < 30) {
    CONFIG.MAX_PARTICLES = Math.max(50, CONFIG.MAX_PARTICLES - 10);
    CONFIG.SNOW_SPAWN_RATE *= 0.8;
} else if (fps > 55) {
    CONFIG.MAX_PARTICLES = Math.min(200, CONFIG.MAX_PARTICLES + 5);
    CONFIG.SNOW_SPAWN_RATE = Math.min(0.15, CONFIG.SNOW_SPAWN_RATE * 1.1);
}
}

// ===== INICIALIZAÇÃO FINAL =====
function finalizeInitialization() {
gameSettings.load();

if (window.location.hash === '#debug') {
    window.DEBUG_MODE = true;
}

setInterval(optimizePerformance, 5000);

console.log('Tupãry: O Reino Congelado - Inicializado com sucesso!');
}

// ===== EVENTOS DE JANELA =====
window.addEventListener('beforeunload', (e) => {
if (gameState.gameStarted && !gameState.inMenu) {
    saveProgress();
}
});

window.addEventListener('visibilitychange', () => {
if (document.hidden && gameState.gameStarted && !gameState.inMenu && !gameState.gamePaused) {
    togglePause();
}
});

// ===== INÍCIO DO JOGO =====
window.addEventListener('DOMContentLoaded', () => {
init();
finalizeInitialization();
});

// ===== EXPOSIÇÃO GLOBAL PARA DEBUG =====
if (window.DEBUG_MODE) {
window.gameState = gameState;
window.CONFIG = CONFIG;
window.enemies = enemies;
window.particles = particles;
window.abilityEffects = abilityEffects;
window.platforms = platforms;

window.debugCommands = {
    godMode: () => {
        gameState.playerMaxHealth = 9999;
        gameState.playerHealth = 9999;
        gameState.playerMaxMana = 9999;
        gameState.playerMana = 9999;
        updateAllUI();
    },
    
    levelUp: () => {
        gainXP(gameState.playerNextLevelXP);
    },
    
    teleport: (x, y) => {
        gameState.playerPosition.x = x || 4800;
        gameState.playerPosition.y = y || 300;
    },
    
    spawnBoss: () => {
        loadPhase(3);
    },
    
    clearEnemies: () => {
        enemies.length = 0;
    },
    
    addParticles: (type, count) => {
        addParticles(type || 'snow', gameState.playerPosition.x, gameState.playerPosition.y, count || 50);
    }
};
}
