// Scene Manager
class SceneManager {
    constructor() {
        this.currentScene = null;
        this.scenes = {};
        this.transitioning = false;
    }
    
    addScene(name, scene) {
        this.scenes[name] = scene;
    }
    
    switchTo(sceneName, data = {}) {
        if (this.transitioning) return;
        
        this.transitioning = true;
        
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        this.currentScene = this.scenes[sceneName];
        if (this.currentScene) {
            this.currentScene.enter(data);
        }
        
        setTimeout(() => {
            this.transitioning = false;
        }, 500);
    }
    
    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }
    
    render(ctx) {
        if (this.currentScene) {
            this.currentScene.render(ctx);
        }
    }
    
    handleInput(keys) {
        if (this.currentScene) {
            this.currentScene.handleInput(keys);
        }
    }
}

// Base Scene Class
class Scene {
    constructor() {
        this.active = false;
    }
    
    enter(data) {
        this.active = true;
    }
    
    exit() {
        this.active = false;
    }
    
    update(deltaTime) {}
    render(ctx) {}
    handleInput(keys) {}
}

// Story Mode Scene
class StoryScene extends Scene {
    constructor() {
        super();
        this.player = null;
        this.enemies = [];
        this.platforms = [];
        this.projectiles = [];
        this.currentRegion = 'forest';
        this.currentLevel = 1;
        this.camera = { x: 0, y: 0 };
        this.dialogue = null;
        this.cutscene = false;
    }
    
    enter(data) {
        super.enter(data);
        this.initializeLevel();
    }
    
    initializeLevel() {
        // Create player
        this.player = new Player(100, 300, selectedCharacter || 'archer');
        
        // Create platforms for current region
        this.createPlatforms();
        
        // Create enemies for current level
        this.createEnemies();
        
        // Show intro dialogue
        this.showDialogue(this.getIntroDialogue());
    }
    
    createPlatforms() {
        this.platforms = [];
        
        // Ground platforms
        for (let i = 0; i < 10; i++) {
            this.platforms.push({
                x: i * 200,
                y: canvas.height - 50,
                width: 200,
                height: 50,
                type: 'ground'
            });
        }
        
        // Floating platforms based on region
        if (this.currentRegion === 'forest') {
            this.platforms.push(
                { x: 300, y: 400, width: 150, height: 20, type: 'wood' },
                { x: 600, y: 300, width: 150, height: 20, type: 'wood' },
                { x: 900, y: 350, width: 150, height: 20, type: 'wood' }
            );
        } else if (this.currentRegion === 'desert') {
            this.platforms.push(
                { x: 250, y: 450, width: 100, height: 20, type: 'sand' },
                { x: 500, y: 380, width: 120, height: 20, type: 'sand' },
                { x: 800, y: 320, width: 100, height: 20, type: 'sand' }
            );
        }
    }
    
    createEnemies() {
        this.enemies = [];
        
        const enemyTypes = this.getEnemyTypesForRegion();
        const enemyCount = Math.min(3, this.currentLevel + 1);
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = enemyTypes[i % enemyTypes.length];
            const x = 400 + (i * 300);
            const difficulty = this.currentLevel > 2 ? 'hard' : 'normal';
            
            this.enemies.push(new AIEnemy(x, 300, enemyType, difficulty));
        }
    }
    
    getEnemyTypesForRegion() {
        switch (this.currentRegion) {
            case 'forest':
                return ['wolf', 'archer'];
            case 'desert':
                return ['archer', 'wolf'];
            case 'mountain':
                return ['wolf', 'archer'];
            case 'ice':
                return ['archer', 'wolf'];
            default:
                return ['wolf'];
        }
    }
    
    getIntroDialogue() {
        const dialogues = {
            forest: "Bem-vindo à Floresta de Ybyrá. As sombras corrompem a vida aqui. Você deve purificar esta terra.",
            desert: "As areias de Nharõ escondem segredos antigos. Cuidado com as tempestades e os bandidos.",
            mountain: "As montanhas de Karú testam sua honra. Prove seu valor contra os guerreiros das pedras.",
            ice: "O reino gelado de Tupãry guarda o coração do mundo. Prepare-se para o frio eterno."
        };
        
        return dialogues[this.currentRegion] || "Uma nova aventura começa...";
    }
    
    showDialogue(text) {
        this.dialogue = {
            text: text,
            currentChar: 0,
            speed: 50,
            lastUpdate: Date.now()
        };
        this.cutscene = true;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update dialogue
        if (this.dialogue) {
            this.updateDialogue();
            return;
        }
        
        // Update player
        this.player.update(deltaTime, this.platforms, this.enemies);
        
        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime, this.platforms, this.player);
        }
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update camera
        this.updateCamera();
        
        // Check level completion
        this.checkLevelCompletion();
    }
    
    updateDialogue() {
        const now = Date.now();
        if (now - this.dialogue.lastUpdate >= this.dialogue.speed) {
            this.dialogue.currentChar++;
            this.dialogue.lastUpdate = now;
            
            if (this.dialogue.currentChar >= this.dialogue.text.length) {
                // Dialogue finished
                setTimeout(() => {
                    this.dialogue = null;
                    this.cutscene = false;
                }, 1000);
            }
        }
    }
    
    updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;
            
            // Remove if out of bounds
            return projectile.x > -50 && projectile.x < canvas.width + 50 &&
                   projectile.y > -50 && projectile.y < canvas.height + 50;
        });
    }
    
    checkCollisions() {
        // Player attacks vs enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Check projectile hits
            for (let j = this.projectiles.length - 1; j >= 0; j--) {
                const projectile = this.projectiles[j];
                
                if (projectile.owner === this.player && enemy.checkCollision(projectile)) {
                    const isDead = enemy.takeDamage(projectile.damage, projectile.effects);
                    this.projectiles.splice(j, 1);
                    
                    if (isDead) {
                        this.enemies.splice(i, 1);
                    }
                    break;
                }
            }
        }
        
        // Enemy attacks vs player
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            if (projectile.owner !== this.player && this.player.checkCollision(projectile)) {
                const isDead = this.player.takeDamage(projectile.damage, projectile.effects);
                this.projectiles.splice(i, 1);
                
                if (isDead) {
                    this.gameOver();
                }
            }
        }
    }
    
    updateCamera() {
        // Follow player
        this.camera.x = this.player.x - canvas.width / 2;
        this.camera.y = this.player.y - canvas.height / 2;
        
        // Clamp camera
        this.camera.x = Math.max(0, Math.min(2000 - canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(1000 - canvas.height, this.camera.y));
    }
    
    checkLevelCompletion() {
        if (this.enemies.length === 0 && !this.dialogue) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        if (this.currentLevel < 4) {
            this.currentLevel++;
            this.showDialogue("Nível completo! Preparando próximo desafio...");
            setTimeout(() => {
                this.initializeLevel();
            }, 2000);
        } else {
            // Region complete
            this.completeRegion();
        }
    }
    
    completeRegion() {
        const regions = ['forest', 'desert', 'mountain', 'ice'];
        const currentIndex = regions.indexOf(this.currentRegion);
        
        if (currentIndex < regions.length - 1) {
            this.currentRegion = regions[currentIndex + 1];
            this.currentLevel = 1;
            this.showDialogue(`Região ${this.currentRegion} desbloqueada! Preparando viagem...`);
            setTimeout(() => {
                this.initializeLevel();
            }, 3000);
        } else {
            // Game complete!
            this.showDialogue("Parabéns! Você completou a jornada e restaurou o equilíbrio de Anhã!");
            setTimeout(() => {
                sceneManager.switchTo('menu');
            }, 5000);
        }
    }
    
    gameOver() {
        this.showDialogue("Você foi derrotado... Mas a jornada não acaba aqui.");
        setTimeout(() => {
            this.player.health = this.player.maxHealth;
            this.player.mana = this.player.maxMana;
            this.player.x = 100;
            this.player.y = 300;
            this.initializeLevel();
        }, 3000);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render background
        this.renderBackground(ctx);
        
        // Render platforms
        this.renderPlatforms(ctx);
        
        // Render entities
        this.player.render(ctx);
        
        for (let enemy of this.enemies) {
            enemy.render(ctx);
        }
        
        for (let projectile of this.projectiles) {
            this.renderProjectile(ctx, projectile);
        }
        
        ctx.restore();
        
        // Render UI
        this.renderUI(ctx);
        
        // Render dialogue
        if (this.dialogue) {
            this.renderDialogue(ctx);
        }
    }
    
    renderBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        switch (this.currentRegion) {
            case 'forest':
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#98FB98');
                break;
            case 'desert':
                gradient.addColorStop(0, '#FFE4B5');
                gradient.addColorStop(1, '#DEB887');
                break;
            case 'mountain':
                gradient.addColorStop(0, '#B0C4DE');
                gradient.addColorStop(1, '#708090');
                break;
            case 'ice':
                gradient.addColorStop(0, '#F0F8FF');
                gradient.addColorStop(1, '#B0E0E6');
                break;
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.camera.x, this.camera.y, canvas.width, canvas.height);
    }
    
    renderPlatforms(ctx) {
        for (let platform of this.platforms) {
            ctx.fillStyle = this.getPlatformColor(platform.type);
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add platform details
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
        }
    }
    
    getPlatformColor(type) {
        switch (type) {
            case 'ground': return '#8B4513';
            case 'wood': return '#DEB887';
            case 'sand': return '#F4A460';
            case 'stone': return '#696969';
            case 'ice': return '#B0E0E6';
            default: return '#8B4513';
        }
    }
    
    renderProjectile(ctx, projectile) {
        ctx.fillStyle = this.getProjectileColor(projectile.type);
        
        if (projectile.type === 'arrow' || projectile.type === 'charged_arrow') {
            // Arrow shape
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(projectile.x - 5, projectile.y, 5, projectile.height);
        } else {
            // Default rectangle
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        }
        
        // Critical hit effect
        if (projectile.critical) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(projectile.x - 2, projectile.y - 2, projectile.width + 4, projectile.height + 4);
        }
    }
    
    getProjectileColor(type) {
        switch (type) {
            case 'arrow': return '#8B4513';
            case 'charged_arrow': return '#4169E1';
            default: return '#FF6B6B';
        }
    }
    
    renderUI(ctx) {
        // Health and mana bars are handled by the main game UI
    }
    
    renderDialogue(ctx) {
        const boxHeight = 120;
        const boxY = canvas.height - boxHeight - 20;
        
        // Dialogue box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(20, boxY, canvas.width - 40, boxHeight);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, boxY, canvas.width - 40, boxHeight);
        
        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        
        const displayText = this.dialogue.text.substring(0, this.dialogue.currentChar);
        const lines = this.wrapText(ctx, displayText, canvas.width - 80);
        
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 40, boxY + 30 + (i * 25));
        }
        
        // Continue indicator
        if (this.dialogue.currentChar >= this.dialogue.text.length) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '14px Arial';
            ctx.fillText('Pressione qualquer tecla para continuar...', 40, boxY + boxHeight - 15);
        }
    }
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    handleInput(keys) {
        if (this.dialogue) {
            // Skip dialogue on any key press
            if (Object.values(keys).some(pressed => pressed)) {
                if (this.dialogue.currentChar >= this.dialogue.text.length) {
                    this.dialogue = null;
                    this.cutscene = false;
                } else {
                    this.dialogue.currentChar = this.dialogue.text.length;
                }
            }
            return;
        }
        
        this.player.handleInput(keys);
        
        // Handle ability projectiles
        const newProjectiles = [];
        
        if (keys['KeyU']) {
            const projectile = this.player.useAbility('basic');
            if (projectile) {
                if (Array.isArray(projectile)) {
                    newProjectiles.push(...projectile);
                } else {
                    newProjectiles.push(projectile);
                }
            }
        }
        
        // Add other abilities similarly...
        
        this.projectiles.push(...newProjectiles);
    }
}

// Battle Mode Scene
class BattleScene extends Scene {
    constructor() {
        super();
        this.player = null;
        this.enemy = null;
        this.projectiles = [];
        this.platforms = [];
        this.battleTimer = 0;
        this.maxBattleTime = 300000; // 5 minutes
    }
    
    enter(data) {
        super.enter(data);
        this.initializeBattle();
    }
    
    initializeBattle() {
        // Create player
        this.player = new Player(150, 300, selectedCharacter || 'archer');
        
        // Create AI enemy
        const enemyType = selectedCharacter === 'archer' ? 'wolf' : 'archer';
        this.enemy = new AIEnemy(650, 300, enemyType, 'hard');
        
        // Create simple arena platforms
        this.platforms = [
            { x: 0, y: canvas.height - 50, width: canvas.width, height: 50, type: 'ground' },
            { x: 200, y: 400, width: 150, height: 20, type: 'platform' },
            { x: 450, y: 350, width: 150, height: 20, type: 'platform' },
            { x: 350, y: 250, width: 100, height: 20, type: 'platform' }
        ];
        
        this.battleTimer = 0;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.battleTimer += deltaTime;
        
        // Update entities
        this.player.update(deltaTime, this.platforms, [this.enemy]);
        this.enemy.update(deltaTime, this.platforms, this.player);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Check battle end conditions
        this.checkBattleEnd();
    }
    
    updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;
            
            return projectile.x > -50 && projectile.x < canvas.width + 50 &&
                   projectile.y > -50 && projectile.y < canvas.height + 50;
        });
    }
    
    checkCollisions() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Player projectile hits enemy
            if (projectile.owner === this.player && this.enemy.checkCollision(projectile)) {
                const isDead = this.enemy.takeDamage(projectile.damage, projectile.effects);
                this.projectiles.splice(i, 1);
                
                if (isDead) {
                    this.endBattle('victory');
                }
                continue;
            }
            
            // Enemy projectile hits player
            if (projectile.owner === this.enemy && this.player.checkCollision(projectile)) {
                const isDead = this.player.takeDamage(projectile.damage, projectile.effects);
                this.projectiles.splice(i, 1);
                
                if (isDead) {
                    this.endBattle('defeat');
                }
                continue;
            }
        }
    }
    
    checkBattleEnd() {
        if (this.battleTimer >= this.maxBattleTime) {
            this.endBattle('timeout');
        }
    }
    
    endBattle(result) {
        let message = '';
        switch (result) {
            case 'victory':
                message = 'Vitória! Você derrotou seu oponente!';
                break;
            case 'defeat':
                message = 'Derrota! Tente novamente para melhorar suas habilidades!';
                break;
            case 'timeout':
                message = 'Tempo esgotado! A batalha terminou em empate!';
                break;
        }
        
        setTimeout(() => {
            showEndGameScreen(message);
        }, 1000);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Render arena background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(1, '#34495E');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render platforms
        for (let platform of this.platforms) {
            ctx.fillStyle = '#7F8C8D';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // Render entities
        this.player.render(ctx);
        this.enemy.render(ctx);
        
        // Render projectiles
        for (let projectile of this.projectiles) {
            ctx.fillStyle = projectile.owner === this.player ? '#3498DB' : '#E74C3C';
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        }
        
        // Render battle timer
        const timeLeft = Math.max(0, this.maxBattleTime - this.battleTimer);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, canvas.width / 2, 40);
        ctx.textAlign = 'left';
    }
    
    handleInput(keys) {
        this.player.handleInput(keys);
        
        // Handle ability usage and projectile creation
        const abilities = ['basic', 'skill1', 'skill2', 'ultimate'];
        const keyMap = { 'KeyU': 'basic', 'KeyE': 'skill1', 'KeyO': 'skill2', 'KeyP': 'ultimate' };
        
        for (let [key, ability] of Object.entries(keyMap)) {
            if (keys[key]) {
                const projectile = this.player.useAbility(ability);
                if (projectile) {
                    if (Array.isArray(projectile)) {
                        this.projectiles.push(...projectile);
                    } else {
                        this.projectiles.push(projectile);
                    }
                }
            }
        }
        
        // Handle enemy AI abilities
        const enemyProjectile = this.enemy.useAbility('basic');
        if (enemyProjectile) {
            if (Array.isArray(enemyProjectile)) {
                this.projectiles.push(...enemyProjectile);
            } else {
                this.projectiles.push(enemyProjectile);
            }
        }
    }
}