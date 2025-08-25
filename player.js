// Base Player Class
class Player {
    constructor(x, y, type = 'archer') {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.type = type;
        
        // Physics
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpPower = -12;
        this.onGround = false;
        this.facingRight = true;
        
        // Stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxMana = 100;
        this.mana = this.maxMana;
        this.manaRegen = 5; // per second
        
        // States
        this.state = 'idle'; // idle, walking, jumping, crouching, attacking
        this.isAttacking = false;
        this.isCrouching = false;
        
        // Abilities
        this.abilities = this.initializeAbilities();
        this.lastManaRegen = Date.now();
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.lastAnimationUpdate = Date.now();
        
        // Effects
        this.effects = [];
        
        // Input
        this.keys = {};
    }
    
    initializeAbilities() {
        if (this.type === 'archer') {
            return {
                basic: { cooldown: 500, lastUsed: 0, manaCost: 0 },
                skill1: { cooldown: 3000, lastUsed: 0, manaCost: 20 },
                skill2: { cooldown: 8000, lastUsed: 0, manaCost: 35 },
                ultimate: { cooldown: 20000, lastUsed: 0, manaCost: 50, charging: false, chargeStart: 0 }
            };
        } else if (this.type === 'wolf') {
            return {
                basic: { cooldown: 400, lastUsed: 0, manaCost: 0 },
                skill1: { cooldown: 3000, lastUsed: 0, manaCost: 20 },
                skill2: { cooldown: 10000, lastUsed: 0, manaCost: 30 },
                ultimate: { cooldown: 20000, lastUsed: 0, manaCost: 50 }
            };
        }
    }
    
    update(deltaTime, platforms, enemies) {
        this.updatePhysics(deltaTime, platforms);
        this.updateMana(deltaTime);
        this.updateEffects(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateAbilities();
    }
    
    updatePhysics(deltaTime, platforms) {
        // Apply gravity
        if (!this.onGround) {
            this.velocityY += this.gravity;
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check platform collisions
        this.onGround = false;
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
            }
        }
        
        // Ground collision (bottom of screen)
        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
        
        // Screen boundaries
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        
        // Update state based on movement
        if (this.velocityY !== 0) {
            this.state = 'jumping';
        } else if (this.isCrouching) {
            this.state = 'crouching';
        } else if (Math.abs(this.velocityX) > 0.1) {
            this.state = 'walking';
        } else {
            this.state = 'idle';
        }
    }
    
    updateMana(deltaTime) {
        const now = Date.now();
        if (now - this.lastManaRegen >= 1000) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegen);
            this.lastManaRegen = now;
        }
    }
    
    updateEffects(deltaTime) {
        this.effects = this.effects.filter(effect => {
            effect.duration -= deltaTime;
            return effect.duration > 0;
        });
    }
    
    updateAnimation(deltaTime) {
        const now = Date.now();
        if (now - this.lastAnimationUpdate >= 100) {
            this.animationFrame += this.animationSpeed;
            this.lastAnimationUpdate = now;
        }
    }
    
    updateAbilities() {
        // Update ultimate charging for archer
        if (this.type === 'archer' && this.abilities.ultimate.charging) {
            const chargeTime = Date.now() - this.abilities.ultimate.chargeStart;
            if (chargeTime >= 1000) {
                // Fully charged
                this.abilities.ultimate.fullyCharged = true;
            }
        }
    }
    
    handleInput(keys) {
        this.keys = keys;
        
        // Movement
        this.velocityX = 0;
        
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.velocityX = -this.getSpeed();
            this.facingRight = false;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.velocityX = this.getSpeed();
            this.facingRight = true;
        }
        
        // Jump
        if ((keys['KeyW'] || keys['ArrowUp']) && this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
        }
        
        // Crouch
        this.isCrouching = keys['KeyS'] || keys['ArrowDown'];
        
        // Abilities
        if (keys['KeyU']) this.useAbility('basic');
        if (keys['KeyE']) this.useAbility('skill1');
        if (keys['KeyO']) this.useAbility('skill2');
        if (keys['KeyP']) this.useAbility('ultimate');
    }
    
    getSpeed() {
        let baseSpeed = this.type === 'archer' ? 5 : 7;
        
        // Apply slow effects
        for (let effect of this.effects) {
            if (effect.type === 'slow') {
                baseSpeed *= (1 - effect.intensity);
            }
        }
        
        return baseSpeed;
    }
    
    getJumpHeight() {
        return this.type === 'archer' ? 100 : 120;
    }
    
    useAbility(abilityName) {
        const ability = this.abilities[abilityName];
        const now = Date.now();
        
        if (now - ability.lastUsed < ability.cooldown) return false;
        if (this.mana < ability.manaCost) return false;
        
        this.mana -= ability.manaCost;
        ability.lastUsed = now;
        
        if (this.type === 'archer') {
            return this.useArcherAbility(abilityName);
        } else if (this.type === 'wolf') {
            return this.useWolfAbility(abilityName);
        }
        
        return false;
    }
    
    useArcherAbility(abilityName) {
        switch (abilityName) {
            case 'basic':
                return this.shootArrow(10, 0.5, 0.1);
            case 'skill1':
                return this.shootTripleArrows();
            case 'skill2':
                return this.shootFanArrows();
            case 'ultimate':
                return this.chargedArrow();
        }
        return false;
    }
    
    useWolfAbility(abilityName) {
        switch (abilityName) {
            case 'basic':
                return this.meleeAttack(15, 50);
            case 'skill1':
                return this.tripleSlash();
            case 'skill2':
                return this.huntMode();
            case 'ultimate':
                return this.leapAttack();
        }
        return false;
    }
    
    shootArrow(damage, slowDuration, slowIntensity) {
        const projectile = {
            x: this.x + (this.facingRight ? this.width : 0),
            y: this.y + this.height / 2,
            velocityX: (this.facingRight ? 1 : -1) * 10,
            velocityY: 0,
            width: 20,
            height: 4,
            damage: damage,
            type: 'arrow',
            owner: this,
            effects: [{ type: 'slow', duration: slowDuration * 1000, intensity: slowIntensity }]
        };
        
        return projectile;
    }
    
    shootTripleArrows() {
        const arrows = [];
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const arrow = this.shootArrow(5, 0.5, 0.1);
                if (arrow) arrows.push(arrow);
            }, i * 100);
        }
        return arrows;
    }
    
    shootFanArrows() {
        const arrows = [];
        const angles = [0, Math.PI / 6, -Math.PI / 6]; // 0°, 30°, -30°
        
        for (let angle of angles) {
            const projectile = {
                x: this.x + (this.facingRight ? this.width : 0),
                y: this.y + this.height / 2,
                velocityX: (this.facingRight ? 1 : -1) * 10 * Math.cos(angle),
                velocityY: 10 * Math.sin(angle),
                width: 20,
                height: 4,
                damage: 15,
                type: 'arrow',
                owner: this,
                effects: [{ type: 'slow', duration: 1000, intensity: 0.2 }]
            };
            arrows.push(projectile);
        }
        
        return arrows;
    }
    
    chargedArrow() {
        if (!this.abilities.ultimate.charging) {
            // Start charging
            this.abilities.ultimate.charging = true;
            this.abilities.ultimate.chargeStart = Date.now();
            this.abilities.ultimate.fullyCharged = false;
            return null;
        } else {
            // Release arrow
            this.abilities.ultimate.charging = false;
            const chargeTime = Date.now() - this.abilities.ultimate.chargeStart;
            const isFullyCharged = chargeTime >= 1000;
            
            const damage = isFullyCharged ? 100 : 25;
            const stunDuration = isFullyCharged ? 1.5 : 0.25;
            const isCritical = isFullyCharged && Math.random() < 0.25;
            
            const projectile = {
                x: this.x + (this.facingRight ? this.width : 0),
                y: this.y + this.height / 2,
                velocityX: (this.facingRight ? 1 : -1) * 12,
                velocityY: 0,
                width: 30,
                height: 6,
                damage: isCritical ? damage * 1.5 : damage,
                type: 'charged_arrow',
                owner: this,
                effects: [{ type: 'stun', duration: stunDuration * 1000 }],
                critical: isCritical
            };
            
            return projectile;
        }
    }
    
    meleeAttack(damage, range) {
        const attack = {
            x: this.x + (this.facingRight ? this.width : -range),
            y: this.y,
            width: range,
            height: this.height,
            damage: damage,
            type: 'melee',
            owner: this,
            effects: [{ type: 'slow', duration: 500, intensity: 0.1 }]
        };
        
        return attack;
    }
    
    tripleSlash() {
        const attacks = [];
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const attack = this.meleeAttack(10, 50);
                if (attack) attacks.push(attack);
            }, i * 150);
        }
        return attacks;
    }
    
    huntMode() {
        // Check if enemy has less than 50% health
        // This would be implemented with enemy reference
        this.effects.push({
            type: 'speed_boost',
            duration: 3000,
            intensity: 0.5
        });
        return true;
    }
    
    leapAttack() {
        // Leap towards enemy
        this.velocityY = -15;
        this.velocityX = (this.facingRight ? 1 : -1) * 12;
        
        const attack = {
            x: this.x,
            y: this.y,
            width: this.width * 2,
            height: this.height * 2,
            damage: 80,
            type: 'leap',
            owner: this,
            effects: [{ type: 'stun', duration: 1000 }]
        };
        
        return attack;
    }
    
    takeDamage(damage, effects = []) {
        this.health = Math.max(0, this.health - damage);
        
        // Apply effects
        for (let effect of effects) {
            this.effects.push({
                type: effect.type,
                duration: effect.duration,
                intensity: effect.intensity || 1
            });
        }
        
        return this.health <= 0;
    }
    
    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        
        // Flip sprite if facing left
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2 - this.width, 0);
        }
        
        // Render based on state and type
        this.renderSprite(ctx);
        
        // Render effects
        this.renderEffects(ctx);
        
        ctx.restore();
    }
    
    renderSprite(ctx) {
        // Placeholder sprite rendering
        if (this.type === 'archer') {
            ctx.fillStyle = this.getArcherColor();
        } else {
            ctx.fillStyle = this.getWolfColor();
        }
        
        // Body
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Simple animation based on state
        if (this.state === 'walking') {
            const offset = Math.sin(this.animationFrame) * 2;
            ctx.fillRect(this.x - 5, this.y + this.height - 10 + offset, 10, 10);
            ctx.fillRect(this.x + this.width - 5, this.y + this.height - 10 - offset, 10, 10);
        }
        
        // Weapon
        if (this.type === 'archer') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + this.width/2 - 2, this.y + 10, 4, 30);
        } else {
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(this.x + this.width - 10, this.y + 20, 15, 4);
        }
    }
    
    getArcherColor() {
        if (this.abilities.ultimate.charging) {
            const chargeTime = Date.now() - this.abilities.ultimate.chargeStart;
            const intensity = Math.min(chargeTime / 1000, 1);
            return `rgb(${100 + intensity * 155}, ${150 + intensity * 105}, 255)`;
        }
        return '#4A90E2';
    }
    
    getWolfColor() {
        const hasSpeedBoost = this.effects.some(e => e.type === 'speed_boost');
        return hasSpeedBoost ? '#FF6B6B' : '#8B4513';
    }
    
    renderEffects(ctx) {
        // Render status effects
        for (let i = 0; i < this.effects.length; i++) {
            const effect = this.effects[i];
            const y = this.y - 10 - (i * 15);
            
            ctx.fillStyle = this.getEffectColor(effect.type);
            ctx.fillRect(this.x, y, this.width * (effect.duration / 3000), 5);
        }
    }
    
    getEffectColor(effectType) {
        switch (effectType) {
            case 'slow': return '#6495ED';
            case 'stun': return '#FFD700';
            case 'speed_boost': return '#32CD32';
            default: return '#FFFFFF';
        }
    }
}

// AI Enemy Class
class AIEnemy extends Player {
    constructor(x, y, type, difficulty = 'normal') {
        super(x, y, type);
        this.isAI = true;
        this.difficulty = difficulty;
        this.target = null;
        this.lastAction = Date.now();
        this.actionCooldown = this.getDifficultyCooldown();
        this.patrolStart = x;
        this.patrolRange = 200;
        this.aggroRange = 150;
        this.attackRange = this.type === 'archer' ? 300 : 60;
        this.state = 'patrol';
    }
    
    getDifficultyCooldown() {
        switch (this.difficulty) {
            case 'easy': return 2000;
            case 'normal': return 1500;
            case 'hard': return 1000;
            default: return 1500;
        }
    }
    
    update(deltaTime, platforms, target) {
        this.target = target;
        this.updateAI();
        super.update(deltaTime, platforms, []);
    }
    
    updateAI() {
        const now = Date.now();
        if (now - this.lastAction < this.actionCooldown) return;
        
        if (!this.target) {
            this.patrol();
            return;
        }
        
        const distanceToTarget = Math.abs(this.x - this.target.x);
        
        if (distanceToTarget > this.aggroRange) {
            this.patrol();
        } else if (distanceToTarget <= this.attackRange) {
            this.attack();
        } else {
            this.chase();
        }
        
        this.lastAction = now;
    }
    
    patrol() {
        this.state = 'patrol';
        const centerX = this.patrolStart + this.patrolRange / 2;
        
        if (this.x < this.patrolStart) {
            this.facingRight = true;
            this.velocityX = this.getSpeed() * 0.5;
        } else if (this.x > this.patrolStart + this.patrolRange) {
            this.facingRight = false;
            this.velocityX = -this.getSpeed() * 0.5;
        } else {
            // Random movement within patrol range
            if (Math.random() < 0.3) {
                this.facingRight = !this.facingRight;
            }
            this.velocityX = (this.facingRight ? 1 : -1) * this.getSpeed();    }
    
    chase() {
        this.state = 'chase';
        if (this.target.x > this.x) {
            this.facingRight = true;
            this.velocityX = this.getSpeed();
        } else {
            this.facingRight = false;
            this.velocityX = -this.getSpeed();
        }
        
        // Jump if target is above
        if (this.target.y < this.y - 50 && this.onGround) {
            this.velocityY = this.jumpPower;
        }
    }
    
    attack() {
        this.state = 'attack';
        this.velocityX = 0;
        
        // Face target
        this.facingRight = this.target.x > this.x;
        
        // Choose ability based on difficulty and situation
        const abilities = ['basic'];
        
        if (this.difficulty !== 'easy') {
            abilities.push('skill1');
        }
        
        if (this.difficulty === 'hard') {
            abilities.push('skill2', 'ultimate');
        }
        
        const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];
        this.useAbility(randomAbility);
    }
}