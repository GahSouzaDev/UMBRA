// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    // Física do jogo
    GRAVITY: 0.6,
    PLAYER_SPEED: 4,
    JUMP_FORCE: 14,
    CROUCH_HEIGHT: 30,
    NORMAL_HEIGHT: 50,
    
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

    // Habilidades do Escolhido (Poderes de Umbra para a classe 'chosenOne' - Removido classes como padrão)
    UMBRA_FURY_DURATION: 7000,
    UMBRA_FURY_DAMAGE_BOOST: 1.5,
    UMBRA_FURY_SPEED_BOOST: 1.3,
    UMBRA_FURY_DAMAGE_REDUCTION: 0.5,

    // CAMINHOS DE RECURSOS (Placeholders - Crie essas pastas e arquivos!)
    ASSET_PATHS: {
        player_idle: 'assets/personagens/Escolhido/gifs/escolhido-parado01.gif',
        player_walk: 'assets/sprites/player/walk.gif',
        player_jump: 'assets/sprites/player/jump.gif',
        player_crouch: 'assets/sprites/player/crouch.gif',
        player_attack_u: 'assets/sprites/player/attack_u.gif',
        player_attack_i: 'assets/sprites/player/attack_i.gif',
        player_attack_o: 'assets/sprites/player/attack_o.gif',
        player_ultimate: 'assets/sprites/player/ultimate_form.gif',

        sentinel_sprite: '',
        tarek_sprite: 'assets/sprites/bosses/tarek.gif',

        projectile_i: 'assets/sprites/effects/projectile_i.gif',
        explosion_o: 'assets/sprites/effects/explosion_o.gif',
        tarek_ice_orb: 'assets/sprites/effects/tarek_ice_orb.gif',
        tarek_prison: 'assets/sprites/effects/tarek_prison.gif',

        music_menu: 'assets/audio/music/menu.mp3',
        music_platforming: 'assets/audio/music/platforming.mp3',
        music_boss_tarek: 'assets/audio/music/tarek_boss.mp3',
        sfx_jump: 'assets/audio/sfx/jump.mp3',
        sfx_attack_u: 'assets/audio/sfx/attack_u.mp3',
        sfx_ability_i: 'assets/audio/sfx/ability_i.mp3',
        sfx_ability_o: 'assets/audio/sfx/ability_o.mp3',
        sfx_ability_p: 'assets/audio/sfx/ability_p.mp3',
        sfx_damage_player: 'assets/audio/sfx/damage_player.mp3',
        sfx_damage_enemy: 'assets/audio/sfx/damage_enemy.mp3',
        sfx_level_up: 'assets/audio/sfx/level_up.mp3',
        sfx_boss_roar: 'assets/audio/sfx/boss_roar.mp3',
    }
};

// ===== VARIÁVEIS GLOBAIS =====
let canvas, ctx;
let isMobile = false;
let isLandscape = true;

// Estado do jogo
let gameState = {
    playerName: '',
    playerClass: '',
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
    currentAnimation: 'idle',
    isUmbraFurious: false, /* Mantido para demonstração da ultimate do Escolhido */
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
    tarekDialogCompleted: false,

    // Fixed camera for specific encounters
    fixedCamera: false,
    fixedCameraTarget: { x: 0, y: 0 }
};

// Arrays de entidades
let platforms = [];
let particles = [];
let backgroundLayers = [];
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
    abilityU: false,
    abilityI: false,
    abilityO: false,
    abilityP: false
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
let COLOR_HEALTH, COLOR_MANA, COLOR_XP, COLOR_ACCENT_FIRE, COLOR_ACCENT_GOLD, COLOR_ACCENT_BLUE, COLOR_ACCENT_ICE, COLOR_TEXT_LIGHT, COLOR_ARCHER, COLOR_WARRIOR;


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
        console.error(`Erro ao carregar o áudio '${name}':`, error);
        audioSources[name] = audioContext.createBuffer(2, 22050, 44100); /* Buffer vazio para evitar erros */
    }
}

function playSound(name, volume = 1.0) {
    if (!audioSources[name]) {
        console.warn(`Áudio '${name}' não carregado.`);
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
        console.error("Erro ao reproduzir som:", error);
    }
}

function playMusic(name, loop = true, volume = 0.7) {
    if (currentMusic) {
        try {
            currentMusic.stop();
        } catch (error) {
            console.error("Erro ao parar música anterior:", error);
        }
        currentMusic = null;
    }

    if (!audioSources[name]) {
        console.warn(`Música '${name}' não carregada.`);
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
        console.error("Erro ao reproduzir música:", error);
    }
}

function stopMusic() {
    if (currentMusic) {
        try {
            currentMusic.stop();
        } catch (error) {
            console.error("Erro ao parar música:", error);
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
        if (gameState.gameStarted && gameState.gamePaused && !gameState.inMenu && !gameState.inCutscene) {
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
        playerMaxHealth: gameState.playerMaxHealth,
        playerMaxMana: gameState.playerMaxMana,
        playerDamage: gameState.playerDamage,
        playerSpeed: gameState.playerSpeed,
        currentPhase: gameState.currentPhase,
        currentCheckpoint: gameState.currentCheckpoint,
        bossDefeated: gameState.bossDefeated,
        abilitiesMaxCooldown: gameState.abilitiesMaxCooldown,
        manaRegenRate: CONFIG.MANA_REGEN_RATE
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
            console.error('Erro ao carregar save:', e);
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
    
    await loadAllSounds();
    
    initGlobalColors(); /* Pré-calcula as cores CSS */
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

async function loadAllSounds() {
    const soundPromises = [];
    for (const [key, path] of Object.entries(CONFIG.ASSET_PATHS)) {
        soundPromises.push(loadSound(key, path));
    }
    await Promise.all(soundPromises);
    console.log("Todos os assets de áudio carregados.");
}

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
    COLOR_ARCHER = rootStyle.getPropertyValue('--archer-color');
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

function populateMainMenuWithSavedData(data) {
    document.getElementById('player-name').value = data.playerName || '';
    if (data.playerClass) {
        selectClass(data.playerClass);
    }
    validateMenuInputs();

    Object.assign(gameState, data);
    
    if (gameState.gameStarted && !gameState.inMenu) {
        document.getElementById('main-menu').style.display = 'none';
        loadPhase(gameState.currentPhase);
        setupCharacter(gameState.playerClass, gameState.playerMaxHealth, gameState.playerMaxMana, gameState.playerDamage, gameState.playerSpeed, gameState.abilitiesMaxCooldown, gameState.manaRegenRate);
        updateAllUI();
        playMusic('music_platforming', true);
    }
}

// ===== CLASSES DE PERSONAGEM =====
function initChampionClasses() {
    championClasses = {
        archer: {
            id: 'archer',
            name: 'Atirador Gélido',
            type: 'ranged',
            baseHealth: 90,
            baseMana: 140,
            baseSpeed: 4.5,
            baseDamage: 12,
            abilitiesMaxCooldown: { U: 0.6, I: 5, O: 4, P: 8 },
            manaRegenRate: 1.8,
            abilities: [
                {
                    key: 'U',
                    name: 'Tiro Gélido',
                    description: 'Dispara um projétil de gelo à distância.',
                    damage: (base) => base * 1.2,
                    manaCost: 0,
                    cooldown: 0.6,
                    execute: function() {
                        playSound('sfx_attack_u');
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
                    name: 'Investida Rápida',
                    description: 'Dash rápido que atravessa inimigos e concede invulnerabilidade temporária.',
                    damage: (base) => base * 1.0,
                    manaCost: 25,
                    cooldown: 5,
                    execute: function() {
                        playSound('sfx_ability_i');
                        gameState.playerVelocity.x = (gameState.facing === 'right' ? 12 : -12);
                        gameState.isInvincible = true;
                        gameState.invincibilityTimer = 300;
                        addParticles('dashIce', gameState.playerPosition.x + 25, gameState.playerPosition.y + 25, 20);
                    }
                },
                {
                    key: 'O',
                    name: 'Orbe Perfurante',
                    description: 'Lança um orbe de gelo que atravessa múltiplos inimigos.',
                    damage: (base) => base * 1.8,
                    manaCost: 35,
                    cooldown: 4,
                    execute: function() {
                        playSound('sfx_ability_o');
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
                    name: 'Barreira de Cristal',
                    description: 'Cria uma barreira defensiva à frente que reflete projéteis e danifica inimigos que a tocam.',
                    damage: (base) => base * 0.8,
                    manaCost: 45,
                    cooldown: 8,
                    execute: function() {
                        playSound('sfx_ability_p');
                        addAbilityEffect({
                            type: 'crystalBarrier',
                            x: gameState.playerPosition.x + (gameState.facing === 'right' ? 60 : -80),
                            y: gameState.playerPosition.y - 20,
                            width: 25,
                            height: 90,
                            duration: 5000,
                            damage: this.damage(gameState.playerDamage),
                            origin: 'player',
                            blocking: true,
                            reflecting: true
                        });
                    }
                }
            ]
        },
        
        warrior: {
            id: 'warrior',
            name: 'Guerreiro do Gelo',
            type: 'melee',
            baseHealth: 130,
            baseMana: 100,
            baseSpeed: 3.5,
            baseDamage: 18,
            abilitiesMaxCooldown: { U: 0.8, I: 6, O: 5, P: 10 },
            manaRegenRate: 1.2,
            abilities: [
                {
                    key: 'U',
                    name: 'Golpe Glacial',
                    description: 'Ataque corpo a corpo poderoso com chance de congelar o inimigo.',
                    damage: (base) => base * 1.5,
                    manaCost: 0,
                    cooldown: 0.8,
                    execute: function() {
                        playSound('sfx_attack_u');
                        addAbilityEffect({
                            type: 'meleeAttack',
                            x: gameState.playerPosition.x + (gameState.facing === 'right' ? 50 : -40),
                            y: gameState.playerPosition.y + 15,
                            width: 40,
                            height: 20,
                            duration: 300,
                            damage: this.damage(gameState.playerDamage),
                            origin: 'player',
                            freezeChance: 0.3
                        });
                    }
                },
                {
                    key: 'I',
                    name: 'Investida Brutal',
                    description: 'Carga devastadora que empurra inimigos e causa dano em área.',
                    damage: (base) => base * 2.5,
                    manaCost: 30,
                    cooldown: 6,
                    execute: function() {
                        playSound('sfx_ability_i');
                        gameState.playerVelocity.x = (gameState.facing === 'right' ? 10 : -10);
                        addAbilityEffect({
                            type: 'chargeAttack',
                            x: gameState.playerPosition.x,
                            y: gameState.playerPosition.y,
                            width: 70,
                            height: 50,
                            duration: 500,
                            damage: this.damage(gameState.playerDamage),
                            origin: 'player',
                            knockback: 15,
                            areaEffect: true
                        });
                        screenShake(8, 300);
                    }
                },
                {
                    key: 'O',
                    name: 'Orbe Próximo',
                    description: 'Lança um orbe de gelo de curto alcance que explode ao contato.',
                    damage: (base) => base * 2.8,
                    manaCost: 40,
                    cooldown: 5,
                    execute: function() {
                        playSound('sfx_ability_o');
                        addAbilityEffect({
                            type: 'closeOrb',
                            x: gameState.playerPosition.x + (gameState.facing === 'right' ? 40 : -40),
                            y: gameState.playerPosition.y + 10,
                            width: 40,
                            height: 40,
                            duration: 1500,
                            damage: this.damage(gameState.playerDamage),
                            direction: gameState.facing === 'right' ? 1 : -1,
                            speed: 4,
                            origin: 'player',
                            explosive: true
                        });
                    }
                },
                {
                    key: 'P',
                    name: 'Prisão Defensiva',
                    description: 'Cria uma prisão que protege e danifica inimigos próximos ao jogador.',
                    damage: (base) => base * 1.2,
                    manaCost: 50,
                    cooldown: 10,
                    execute: function() {
                        playSound('sfx_ability_p');
                        addAbilityEffect({
                            type: 'defensivePrison',
                            x: gameState.playerPosition.x - 20,
                            y: gameState.playerPosition.y - 30,
                            width: 90,
                            height: 110,
                            duration: 6000,
                            damage: this.damage(gameState.playerDamage),
                            origin: 'player',
                            protective: true,
                            damageOverTime: true
                        });
                    }
                }
            ]
        },
        /* A classe 'chosenOne' original, apenas para fins de ultimate */
        chosenOne: {
            id: 'chosenOne',
            name: 'Escolhido Original',
            type: 'hybrid',
            baseHealth: 100, baseMana: 100, baseSpeed: 4, baseDamage: 15,
            abilitiesMaxCooldown: { U: 0.5, I: 2, O: 4, P: 20 },
            manaRegenRate: 1.5,
            abilities: [ /* Habilidades dummy, a ultimate 'P' é a relevante */
                { key: 'U', name: 'Ataque Rápido', description: 'Golpe ágil de curta distância.', damage: (base) => base * 1.0, manaCost: 0, cooldown: 0.5, execute: () => {} },
                { key: 'I', name: 'Projétil de Energia', description: 'Lança um projétil rápido à distância.', damage: (base) => base * 1.0, manaCost: 15, cooldown: 2, execute: () => {} },
                { key: 'O', name: 'Explosão Arcana', description: 'Causa uma explosão de energia.', damage: (base) => base * 1.8, manaCost: 30, cooldown: 4, execute: () => {} },
                { key: 'P', name: 'Fúria de Umbra', description: 'Canaliza a energia de Umbra para ficar mais rápido, resistente e poderoso no ataque.', damage: (base) => base, manaCost: 50, cooldown: 20,
                    execute: function() {
                        playSound('sfx_ability_p');
                        gameState.isUmbraFurious = true;
                        gameState.umbraFuryTimer = CONFIG.UMBRA_FURY_DURATION;
                    }
                }
            ]
        }
    };
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    /* Menu Principal */
    document.getElementById('player-name').addEventListener('input', validateMenuInputs);
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
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartFromCheckpoint);
    document.getElementById('save-btn').addEventListener('click', saveProgress);
    document.getElementById('exit-btn').addEventListener('click', exitToMenu);
    document.getElementById('skip-btn').addEventListener('click', skipCutscene);
    
    /* Habilidades desktop */
    document.querySelectorAll('.ability-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
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

function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;

    if (e.key === 'Escape' && gameState.gameStarted && !gameState.inMenu && !gameState.inCutscene) {
        togglePause();
    }
    
    if ((e.key === ' ' || e.key === 'Enter') && gameState.inCutscene) {
        skipCutscene();
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

    /* Botões de Habilidade */
    document.getElementById('mobile-ability-u').addEventListener('touchstart', (e) => { e.preventDefault(); useAbility('U'); });
    document.getElementById('mobile-ability-i').addEventListener('touchstart', (e) => { e.preventDefault(); useAbility('I'); });
    document.getElementById('mobile-ability-o').addEventListener('touchstart', (e) => { e.preventDefault(); useAbility('O'); });
    document.getElementById('mobile-ability-p').addEventListener('touchstart', (e) => { e.preventDefault(); useAbility('P'); });
    updateMobileControlsVisibility();
}

function updateMobileControlsVisibility() {
    const mobileControlsDiv = document.getElementById('mobile-controls');
    if (isMobile && isLandscape) {
        mobileControlsDiv.style.display = 'grid';
    } else {
        mobileControlsDiv.style.display = 'none';
    }
}

// ===== MENU PRINCIPAL =====
function validateMenuInputs() {
    const name = document.getElementById('player-name').value.trim();
    const selectedClass = document.querySelector('.class-option.selected');
    const startBtn = document.getElementById('start-game-btn');
    
    if (name.length >= 2 && selectedClass) {
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
        gameState.playerClass = className;
        validateMenuInputs();
    }
}

function startGame() {
    const name = document.getElementById('player-name').value.trim();
    if (name.length < 2 || !gameState.playerClass) return;
    
    gameState.playerName = name;
    gameState.inMenu = false;
    gameState.gameStarted = true;
    
    document.getElementById('main-menu').style.display = 'none';
    
    setupCharacter(gameState.playerClass);
    
    if (isMobile) {
        updateMobileControlsVisibility();
    }
    
    stopMusic();
    showIntroCutscene();
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
        inTarekEncounter: false, tarekDialogStep: 0, tarekDialogCompleted: false,
        fixedCamera: false, fixedCameraTarget: { x: 0, y: 0 }
    };

    /* Limpa todas as entidades */
    platforms = []; enemies = []; abilityEffects = []; particles = []; damageNumbers = []; checkpoints = []; fallingSpikes = [];
    
    /* Exibe o menu principal */
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('mobile-controls').style.display = 'none';
    document.getElementById('abilities-container').style.display = 'flex';
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
            patrolRange: 100, xpValue: 20, direction: 1, attackCooldown: 0
        },
        {
            type: 'sentinel',
            position: { x: 1600, y: 250 },
            health: 50, maxHealth: 50, damage: 10, speed: 1,
            patrolRange: 120, xpValue: 20, direction: 1, attackCooldown: 0
        },
        {
            type: 'sentinel',
            position: { x: 2700, y: 250 },
            health: 50, maxHealth: 50, damage: 10, speed: 1,
            patrolRange: 100, xpValue: 20, direction: -1, attackCooldown: 0
        },
        {
            type: 'sentinel',
            position: { x: 3700, y: 300 },
            health: 50, maxHealth: 50, damage: 10, speed: 1,
            patrolRange: 150, xpValue: 20, direction: 1, attackCooldown: 0
        },
        {
            type: 'sentinel',
            position: { x: 4600, y: 250 },
            health: 50, maxHealth: 50, damage: 10, speed: 1,
            patrolRange: 100, xpValue: 20, direction: -1, attackCooldown: 0
        }
    ];

    checkpoints = [
        { x: 1000, y: 350, width: 50, height: 50, name: 'checkpoint1', description: 'Primeiro Checkpoint' },
        { x: 2500, y: 350, width: 50, height: 50, name: 'checkpoint2', description: 'Segundo Checkpoint' },
        { x: 4000, y: 350, width: 50, height: 50, name: 'checkpoint3', description: 'Terceiro Checkpoint' },
    ];
    
    backgroundLayers = [
        { color: '#1a237e', speed: 0.1, type: 'sky' },
        { color: '#283593', speed: 0.3, type: 'mountains' },
        { color: '#3949ab', speed: 0.5, type: 'hills' },
        { color: '#5c6bc0', speed: 0.7, type: 'foreground' }
    ];

    CONFIG.WORLD_WIDTH = 6000;
    
    gameState.inTarekEncounter = false;
    gameState.tarekDialogStep = 0;
    gameState.tarekDialogCompleted = false;
    gameState.fixedCamera = false;
}

function setupPhase1_TarekEncounter() {
    platforms = [
        { x: 0, y: 400, width: canvas.width, height: 50, type: 'ground' }
    ];
    enemies = [];
    checkpoints = [];
    
    backgroundLayers = [
        { color: '#0f1419', speed: 0.1, type: 'sky' },
        { color: '#1a1a2e', speed: 0.3, type: 'mountains' }
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
    startTarekDialogue();
}

function setupPhase1_TarekBossFight() {
    platforms = [
        { x: 0, y: 400, width: canvas.width, height: 50, type: 'ground' }
    ];
    enemies = [];
    checkpoints = [];
    
    backgroundLayers = [
        { color: '#0f1419', speed: 0.1, type: 'sky' },
        { color: '#1a1a2e', speed: 0.3, type: 'mountains' }
    ];

    gameState.fixedCamera = true;
    gameState.fixedCameraTarget = { x: 0, y: 0 };
    gameState.playerPosition = { x: 150, y: 300 };
    
    gameState.playerHealth = gameState.playerMaxHealth;
    gameState.playerMana = gameState.playerMaxMana;
    updateHealthBar();
    updateManaBar();
    
    triggerBossFight();
    stopMusic();
    playMusic('music_boss_tarek', true);
}

// ===== CUTSCENES E NARRATIVA =====
function showIntroCutscene() {
    gameState.inCutscene = true;
    const overlay = document.getElementById('cinematic-overlay');
    const titleElement = document.getElementById('cinematic-title');
    const textElement = document.getElementById('cinematic-text');
    
    overlay.style.display = 'flex';
    
    const introSequence = [
        {
            title: "O DESEQUILÍBRIO",
            text: "O mundo treme sob o peso do desequilíbrio. Ignys, o Reino do Fogo, deseja guerra e já move suas tropas em direção aos reinos vizinhos."
        },
        {
            title: "O CORAÇÃO DE GELO",
            text: "Em Tupãry, o Coração de Gelo guarda a metade maligna de Anhangá, o espírito que traz caos."
        },
        {
            title: "A CONVOCAÇÃO",
            text: `Umbra convoca você, ${gameState.playerName}, o Escolhido: recuperar o Coração de Gelo e impedir que Ignys obtenha poder suficiente para dominar todos os reinos.`
        },
        {
            title: "O DESTINO",
            text: "Cada passo, cada luta, cada escolha será decisiva para a sobrevivência de todos."
        }
    ];
    
    let currentSequence = 0;
    let sequenceTimeout = null;
    
    function showNextSequence() {
        if (currentSequence < introSequence.length) {
            const sequence = introSequence[currentSequence];
            
            titleElement.textContent = sequence.title;
            textElement.textContent = sequence.text;
            
            titleElement.style.animation = 'none';
            textElement.style.animation = 'none';
            void titleElement.offsetWidth;
            void textElement.offsetWidth;
            
            titleElement.style.animation = 'fadeInText 2s forwards';
            textElement.style.animation = 'fadeInText 3s forwards 0.5s';
            
            currentSequence++;
            sequenceTimeout = setTimeout(showNextSequence, 5000);
        } else {
            endIntro();
        }
    }
    
    function endIntro() {
        clearTimeout(sequenceTimeout);
        overlay.style.display = 'none';
        gameState.inCutscene = false;
        loadPhase(1);
    }
    
    const skipBtn = document.getElementById('skip-btn');
    skipBtn.onclick = () => {
        clearTimeout(sequenceTimeout);
        if (currentSequence >= introSequence.length) {
            endIntro();
        } else {
            showNextSequence();
        }
    };
    
    showNextSequence();
}

function skipCutscene() {
    const overlay = document.getElementById('cinematic-overlay');
    overlay.style.display = 'none';
    gameState.inCutscene = false;
    
    if (gameState.currentPhase === 0) {
        loadPhase(1);
    }
}

function showDialog(speaker, text, options = null) {
    gameState.inDialog = true;
    gameState.gamePaused = true;
    const dialogContainer = document.getElementById('dialog-container');
    const speakerElement = document.getElementById('dialog-speaker');
    const textElement = document.getElementById('dialog-text');
    const optionsElement = document.getElementById('dialog-options');
    
    dialogContainer.style.display = 'block';
    speakerElement.textContent = speaker;
    textElement.textContent = text;
    
    optionsElement.innerHTML = '';
    
    if (options && options.length > 0) {
        options.forEach((option, index) => {
            const button = document.createElement('div');
            button.className = 'dialog-option';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                dialogContainer.style.display = 'none';
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
            dialogContainer.style.display = 'none';
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
            gameState.tarekDialogCompleted = true;
            gameState.inTarekEncounter = false;
            loadPhase(3);
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
        playerClass: gameState.playerClass,
        playerMaxHealth: gameState.playerMaxHealth,
        playerMaxMana: gameState.playerMaxMana,
        playerDamage: gameState.playerDamage,
        playerSpeed: gameState.playerSpeed,
        abilitiesMaxCooldown: gameState.abilitiesMaxCooldown,
        manaRegenRate: CONFIG.MANA_REGEN_RATE
    };
    
    setCookie('tupary_checkpoint', JSON.stringify(checkpointData));
    showCheckpointNotification('Checkpoint Salvo', `Progresso salvo em: ${getCheckpointDescription(checkpointName)}`);
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
            gameState.playerClass = data.playerClass;

            setupCharacter(data.playerClass, data.playerMaxHealth, data.playerMaxMana, data.playerDamage, data.playerSpeed, data.abilitiesMaxCooldown, data.manaRegenRate);
            
            loadPhase(data.phase);
            updateAllUI();
            return true;
        } catch (e) {
            console.error('Erro ao carregar checkpoint:', e);
        }
    }
    return false;
}

function getCheckpointDescription(checkpointName) {
    const checkpoint = checkpoints.find(cp => cp.name === checkpointName);
    return checkpoint ? checkpoint.description : 'Localização Desconhecida';
}

function showCheckpointNotification(title, description) {
    const notification = document.getElementById('checkpoint-notification');
    const titleEl = notification.querySelector('.checkpoint-text');
    const descEl = notification.querySelector('.checkpoint-description');
    
    titleEl.textContent = title;
    descEl.textContent = description;
    
    notification.style.display = 'block';
    notification.style.animation = 'checkpointPulse 2s ease-in-out';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

function restartFromCheckpoint() {
    togglePause();
    
    if (loadCheckpoint()) {
        showCheckpointNotification('Checkpoint Carregado', 'Retornando ao último checkpoint salvo...');
    } else {
        loadPhase(gameState.currentPhase);
        gameState.playerHealth = gameState.playerMaxHealth;
        gameState.playerMana = gameState.playerMaxMana;
        updateAllUI();
    }
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
        render();
    } else if (gameState.inMenu) {
        renderMenu();
    } else {
        render();
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
    if (gameState.isUmbraFurious && currentChampion.id === 'chosenOne') {
        currentSpeed *= CONFIG.UMBRA_FURY_SPEED_BOOST;
        gameState.umbraFuryTimer -= deltaTime;
        if (gameState.umbraFuryTimer <= 0) {
            gameState.isUmbraFurious = false;
        }
    }

    gameState.playerVelocity.x = moveX * currentSpeed;
    
    if ((keys['w'] || keys['arrowup'] || keys[' '] || mobileControls.up) && gameState.isGrounded && !gameState.isCrouching) {
        gameState.playerVelocity.y = -CONFIG.JUMP_FORCE;
        gameState.isGrounded = false;
        playSound('sfx_jump');
        addParticles('jumpDust', gameState.playerPosition.x + 25, gameState.playerPosition.y + 50, 8);
        
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
    
    if (gameState.playerVelocity.y > 15) {
        gameState.playerVelocity.y = 15;
    }
    
    gameState.playerPosition.x += gameState.playerVelocity.x;
    gameState.playerPosition.y += gameState.playerVelocity.y;
    
    checkPlatformCollisions();
    checkEnemyCollisions();
    checkEffectCollisions();
    checkFallingSpikeCollisions();
    
    updatePlayerAnimation();
    
    if (moveX > 0) gameState.facing = 'right';
    if (moveX < 0) gameState.facing = 'left';
    
    if (!gameState.fixedCamera) {
        if (gameState.playerPosition.x < 0) {
            gameState.playerPosition.x = 0;
            gameState.playerVelocity.x = 0;
        }
        if (gameState.playerPosition.x > CONFIG.WORLD_WIDTH - 50) {
            gameState.playerPosition.x = CONFIG.WORLD_WIDTH - 50;
            gameState.playerVelocity.x = 0;
            
            if (gameState.currentPhase === 1) {
                loadPhase(2);
            }
        }
    } else {
        if (gameState.playerPosition.x < 0) gameState.playerPosition.x = 0;
        if (gameState.playerPosition.x > canvas.width - 50) gameState.playerPosition.x = canvas.width - 50;
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
    const playerWidth = 50;
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

function checkPlatformCollisions() {
    gameState.isGrounded = false;
    const playerWidth = 50;
    const playerHeight = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;
    
    for (const platform of platforms) {
        if (gameState.playerPosition.x < platform.x + platform.width &&
            gameState.playerPosition.x + playerWidth > platform.x &&
            gameState.playerPosition.y < platform.y + platform.height &&
            gameState.playerPosition.y + playerHeight > platform.y) {
            
            if (platform.type === 'spike') {
                takeDamage(10);
                continue;
            }

            if (gameState.playerVelocity.y > 0 && 
                gameState.playerPosition.y + playerHeight - gameState.playerVelocity.y <= platform.y) {
                gameState.playerPosition.y = platform.y - playerHeight;
                gameState.playerVelocity.y = 0;
                gameState.isGrounded = true;
                
                if (gameState.playerVelocity.y > 8) {
                    addParticles('landDust', gameState.playerPosition.x + 25, gameState.playerPosition.y + playerHeight, 12);
                    screenShake(3, 150);
                }
                
                if (platform.slippery && Math.abs(gameState.playerVelocity.x) > 0) {
                    gameState.playerVelocity.x *= 1.2;
                }
            }
            else if (gameState.playerVelocity.y < 0) {
                gameState.playerPosition.y = platform.y + platform.height;
                gameState.playerVelocity.y = 0;
            }
            else if (gameState.playerVelocity.x !== 0) {
                if (gameState.playerPosition.x < platform.x) {
                    gameState.playerPosition.x = platform.x - playerWidth;
                } else {
                    gameState.playerPosition.x = platform.x + platform.width;
                }
                gameState.playerVelocity.x = 0;
            }
        }
    }
}

function checkEnemyCollisions() {
    if (gameState.isInvincible) return;
    
    const playerWidth = 50;
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
                    
                    if (!effect.piercing && !effect.areaEffect) {
                        effect.active = false;
                    }
                }
            }
        }
        
        if (effect.damage && effect.origin === 'enemy' && !gameState.isInvincible && effect.active !== false) {
            const playerWidth = 50;
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

function updatePlayerAnimation() {
    if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) { /* Fúria de Umbra apenas para o Escolhido */
        gameState.currentAnimation = 'umbra_fury';
    } else if (!gameState.isGrounded) {
        gameState.currentAnimation = 'jump';
    } else if (gameState.isCrouching) {
        gameState.currentAnimation = 'crouch';
    } else if (Math.abs(gameState.playerVelocity.x) > 0.1) {
        gameState.currentAnimation = 'walk';
    } else {
        gameState.currentAnimation = 'idle';
    }
}

function updateEnemies(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (enemy.type === 'boss_dialogue') continue;

        if (enemy.frozen) {
            enemy.frozenTimer -= deltaTime;
            if (enemy.frozenTimer <= 0) {
                enemy.frozen = false;
            }
            continue;
        }
        
        if (enemy.type === 'sentinel' && enemy.pattern === 'patrol') {
            updateEnemyPatrol(enemy, deltaTime);
        }
        
        if (enemy.type === 'sentinel') {
            updateEnemyAI(enemy, deltaTime);
        } else if (enemy.type === 'boss') {
            updateBossAI(enemy, deltaTime);
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
                    else if (currentChampion.id === 'archer') trailColor = COLOR_ARCHER;
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
                        damage: effect.damage * 1.5,
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
                            proj.y < effect.y + effect.height && proj.y + proj.height > effect.y) {
                            proj.active = false; /* Destrói o projétil inimigo */
                        }
                    });
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
    
    const playerWidth = 50;
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
    const playerWidth = 50;
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
                color: customColor || COLOR_ACCENT_BLUE,
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
        case 'dashIce':
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 4,
                color: customColor || COLOR_ACCENT_ICE,
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
    if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) {
        finalDamage *= CONFIG.UMBRA_FURY_DAMAGE_REDUCTION;
    }

    gameState.playerHealth -= finalDamage;
    gameState.playerHealth = Math.max(0, gameState.playerHealth);
    
    playSound('sfx_damage_player');
    
    gameState.isInvincible = true;
    gameState.invincibilityTimer = CONFIG.INVINCIBILITY_DURATION;
    
    flashScreen(COLOR_HEALTH, CONFIG.DAMAGE_FLASH_DURATION);
    screenShake(5, 300);
    showDamageNumber(finalDamage, gameState.playerPosition.x + 25, gameState.playerPosition.y, true);
    
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
    xpNumber.style.left = (gameState.playerPosition.x + 25 - gameState.cameraOffset.x) + 'px';
    xpNumber.style.top = (gameState.playerPosition.y - gameState.cameraOffset.y) + 'px';
    xpNumber.dataset.timeLeft = '1500';
    xpContainer.appendChild(xpNumber);
    
    addParticles('xpGain', gameState.playerPosition.x + 25, gameState.playerPosition.y, 8, COLOR_XP);
    
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
    gameState.playerNextLevelXP = Math.floor(gameState.playerNextLevelXP * 1.5);
    
    flashScreen(COLOR_XP, 500);
    addParticles('umbraFuria', gameState.playerPosition.x + 25, gameState.playerPosition.y + 25, 30);
    
    showLevelUpMenu();
}

function showLevelUpMenu() {
    const levelUpMenu = document.getElementById('level-up');
    levelUpMenu.style.display = 'block';
    levelUpMenu.style.animation = 'levelUpAnimation 0.8s forwards';
    gameState.gamePaused = true;
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
    
    document.getElementById('level-up').style.display = 'none';
    gameState.gamePaused = false;
    
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
        xpValue: 500,
        
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
                                    text: "Continuar jornada",
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
function render() {
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
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--primary-dark'));
    gradient.addColorStop(0.3, getComputedStyle(document.documentElement).getPropertyValue('--primary-medium'));
    gradient.addColorStop(0.7, getComputedStyle(document.documentElement).getPropertyValue('--primary-light'));
    gradient.addColorStop(1, '#2c3e50');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    backgroundLayers.forEach((layer, index) => {
        const parallaxOffset = (gameState.fixedCamera ? gameState.fixedCameraTarget.x : gameState.cameraOffset.x) * layer.speed;
        
        ctx.fillStyle = layer.color;
        ctx.globalAlpha = 0.6 - (index * 0.1);
        
        ctx.beginPath();
        ctx.moveTo(-parallaxOffset, canvas.height);
        
        for (let x = -200; x < canvas.width + 200; x += 50 + Math.random() * 20) {
            const height = 100 + Math.sin((x + parallaxOffset) * 0.01) * 50 + Math.sin((x + parallaxOffset) * 0.003) * 100;
            ctx.lineTo(x - parallaxOffset, canvas.height - height - (index * 30));
        }
        
        ctx.lineTo(canvas.width + 200, canvas.height);
        ctx.closePath();
        ctx.fill();
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
    const width = 50;
    const height = gameState.isCrouching ? CONFIG.CROUCH_HEIGHT : CONFIG.NORMAL_HEIGHT;
    
    if (x + width < -50 || x > canvas.width + 50 || y + height < -50 || y > canvas.height + 50) {
        return;
    }
    
    if (gameState.isInvincible && Math.floor(Date.now() / 100) % 2) {
        ctx.globalAlpha = 0.5;
    }
    
    let playerColor;
    if (currentChampion.id === 'chosenOne' && gameState.isUmbraFurious) {
        playerColor = COLOR_ACCENT_GOLD;
    } else if (currentChampion.id === 'archer') {
        playerColor = COLOR_ARCHER;
    } else if (currentChampion.id === 'warrior') {
        playerColor = COLOR_WARRIOR;
    } else {
        playerColor = COLOR_ACCENT_BLUE;
    }
    ctx.fillStyle = playerColor;
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x + 15, y + 8, 3, 3);
    ctx.fillRect(x + 32, y + 8, 3, 3);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    if (gameState.facing === 'right') {
        ctx.beginPath();
        ctx.moveTo(x + width, y + height / 2);
        ctx.lineTo(x + width - 10, y + height / 2 - 10);
        ctx.lineTo(x + width - 10, y + height / 2 + 10);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + 10, y + height / 2 - 10);
        ctx.lineTo(x + 10, y + height / 2 + 10);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
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
    ctx.fillStyle = '#78909c';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(x + 10, y + 10, width - 20, height - 20);

    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(x + 15, y + 5, 4, 4);
    ctx.fillRect(x + 31, y + 5, 4, 4);
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
    ctx.fillStyle = currentChampion.id === 'archer' ? COLOR_ARCHER : COLOR_ACCENT_BLUE;
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

    if (currentHealth !== lastPlayerHealth || currentMaxHealth !== healthFill.dataset.maxHealth) {
        const percentage = (currentHealth / currentMaxHealth) * 100;
        healthFill.style.width = percentage + '%';
        healthText.textContent = `${currentHealth}/${currentMaxHealth}`;
        healthFill.dataset.maxHealth = currentMaxHealth; /* Armazena o maxHealth no dataset para comparação futura */
        lastPlayerHealth = currentHealth;
    }
}

function updateManaBar() {
    const manaFill = document.getElementById('mana-fill');
    const manaText = document.getElementById('mana-text');
    
    const currentMana = Math.round(gameState.playerMana);
    const currentMaxMana = gameState.playerMaxMana;

    if (currentMana !== lastPlayerMana || currentMaxMana !== manaFill.dataset.maxMana) {
        const percentage = (currentMana / currentMaxMana) * 100;
        manaFill.style.width = percentage + '%';
        manaText.textContent = `${currentMana}/${currentMaxMana}`;
        manaFill.dataset.maxMana = currentMaxMana;
        lastPlayerMana = currentMana;
    }
}

function updateXPBar() {
    const xpFill = document.getElementById('xp-fill');
    const xpText = document.getElementById('xp-text');
    
    const currentXP = gameState.playerXP;
    const currentNextLevelXP = gameState.playerNextLevelXP;

    if (currentXP !== lastPlayerXP || currentNextLevelXP !== xpFill.dataset.nextLevelXP) {
        const percentage = (currentXP / currentNextLevelXP) * 100;
        xpFill.style.width = percentage + '%';
        xpText.textContent = `${currentXP}/${currentNextLevelXP}`;
        xpFill.dataset.nextLevelXP = currentNextLevelXP;
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
    const pauseMenu = document.getElementById('pause-menu');
    
    if (gameState.gamePaused) {
        pauseMenu.style.display = 'flex';
        stopMusic();
    } else {
        pauseMenu.style.display = 'none';
        if (gameState.inBossFight) {
            playMusic('music_boss_tarek', true);
        } else {
            playMusic('music_platforming', true);
        }
    }
}

function gameOver() {
    gameState.gamePaused = true;
    stopMusic();
    
    flashScreen('rgba(0, 0, 0, 0.8)', 1000);
    
    setTimeout(() => {
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
    
    overlay.style.display = 'flex';
    
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
                console.error('Erro ao carregar configurações:', e);
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