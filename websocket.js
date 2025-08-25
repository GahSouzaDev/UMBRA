// WebSocket Multiplayer Implementation
class MultiplayerManager {
    constructor() {
        this.ws = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.playerId = null;
        this.players = {};
        this.bullets = [];
        this.gameActive = false;
        this.currentRoomId = null;
        this.scores = { 0: 0, 1: 0 };
        this.lastMoveSent = 0;
        
        this.SERVER_URL = 'wss://heroic-hope-production-bbdc.up.railway.app';
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                {
                    urls: 'turn:turn.speed.cloudflare.com:50000',
                    username: 'd1a7f09155fb30285724a3a056ca2edf17956674aff12909ff133dcec42994b2614cdd0a380a1b65124def1e3d0208543050d14b77d1a7533f9da35893ee2ed9',
                    credential: 'aba9b169546eb6dcc7bfb1cdf34544cf95b5161d602e3b5fa7c8342b2e9802fb',
                },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject',
                },
            ],
        };
    }
    
    joinRoom(roomId) {
        this.currentRoomId = roomId;
        this.updateStatus('Conectando ao servidor...');
        this.showLoadingOverlay(true);
        
        this.ws = new WebSocket(this.SERVER_URL);
        
        this.ws.onopen = () => {
            console.log('WebSocket conectado');
            this.updateStatus('Aguardando o segundo jogador...');
            this.ws.send(JSON.stringify({ type: 'join', roomId }));
        };
        
        this.ws.onerror = (error) => {
            console.error('Erro no WebSocket:', error);
            this.updateStatus('Erro ao conectar ao servidor. Tente novamente.');
            this.showLoadingOverlay(false);
        };
        
        this.ws.onclose = (event) => {
            console.log(`WebSocket fechado. Código: ${event.code}, Motivo: ${event.reason}`);
            this.updateStatus('Conexão com o servidor perdida.');
            this.showLoadingOverlay(false);
        };
        
        this.ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Mensagem recebida do servidor:', data);
                
                await this.handleServerMessage(data);
            } catch (error) {
                console.error('Erro ao processar mensagem do servidor:', error);
                this.updateStatus('Erro ao processar mensagem do servidor.');
                this.showLoadingOverlay(false);
            }
        };
    }
    
    async handleServerMessage(data) {
        switch (data.type) {
            case 'start':
                this.playerId = data.playerId;
                console.log(`Iniciando jogo como jogador ${this.playerId}`);
                this.updateStatus(`Jogador ${this.playerId} conectado. Iniciando jogo...`);
                this.initPeerConnection();
                
                if (this.playerId === 0) {
                    this.dataChannel = this.peerConnection.createDataChannel('game');
                    this.setupDataChannel();
                    const offer = await this.peerConnection.createOffer();
                    await this.peerConnection.setLocalDescription(offer);
                    console.log('Enviando oferta:', offer);
                    this.ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
                }
                break;
                
            case 'offer':
                console.log('Recebida oferta:', data.sdp);
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                console.log('Enviando resposta:', answer);
                this.ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
                break;
                
            case 'answer':
                console.log('Recebida resposta:', data.sdp);
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
                break;
                
            case 'ice':
                console.log('Recebido candidato ICE:', data.candidate);
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                break;
                
            case 'error':
                console.error('Erro do servidor:', data.message);
                this.updateStatus(data.message);
                this.showLoadingOverlay(false);
                break;
        }
    }
    
    initPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Candidato ICE gerado:', event.candidate);
                this.ws.send(JSON.stringify({ type: 'ice', candidate: event.candidate }));
            } else {
                console.log('Todos os candidatos ICE foram gerados.');
            }
        };
        
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('Estado ICE:', this.peerConnection.iceConnectionState);
            this.updateStatus(`Estado da conexão: ${this.peerConnection.iceConnectionState}`);
            
            if (this.peerConnection.iceConnectionState === 'failed') {
                console.error('Conexão ICE falhou. Verifique servidores TURN ou configuração de rede.');
                this.updateStatus('Falha na conexão P2P. Tente novamente ou verifique sua rede.');
                this.showLoadingOverlay(false);
            } else if (this.peerConnection.iceConnectionState === 'disconnected') {
                console.log('Conexão ICE desconectada. Tentando reconectar...');
                this.updateStatus('Conexão P2P desconectada. Tentando reconectar...');
            } else if (this.peerConnection.iceConnectionState === 'connected') {
                console.log('Conexão ICE estabelecida com sucesso!');
            }
        };
        
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };
    }
    
    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('DataChannel aberto');
            this.updateStatus('Conexão P2P estabelecida. Jogo iniciado!');
            this.startMultiplayerGame();
        };
        
        this.dataChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Mensagem recebida no DataChannel:', data);
                this.handlePeerMessage(data);
            } catch (error) {
                console.error('Erro ao processar mensagem do DataChannel:', error);
            }
        };
        
        this.dataChannel.onerror = (error) => {
            console.error('Erro no DataChannel:', error);
            this.updateStatus('Erro na conexão P2P.');
            this.showLoadingOverlay(false);
        };
        
        this.dataChannel.onclose = () => {
            console.log('DataChannel fechado');
            this.updateStatus('Conexão P2P fechada.');
            this.showLoadingOverlay(false);
        };
    }
    
    handlePeerMessage(data) {
        switch (data.type) {
            case 'move':
                this.players[data.playerId] = data.position;
                break;
                
            case 'shoot':
                this.bullets.push({ ...data.bullet, ownerId: data.playerId });
                break;
                
            case 'gameOver':
                const isFinal = data.isFinal || false;
                const message = data.winnerId == this.playerId ? 'Você venceu!' : 'Você perdeu!';
                showEndGameScreen(message, isFinal);
                break;
                
            case 'restart':
                console.log('Recebido pedido de reinício do outro jogador');
                this.performGameRestart();
                break;
                
            case 'scoreUpdate':
                this.scores = data.scores;
                console.log('Scores atualizados:', this.scores);
                break;
        }
    }
    
    startMultiplayerGame() {
        this.players = {};
        this.bullets = [];
        this.scores = { 0: 0, 1: 0 };
        this.gameActive = true;
        
        // Initialize players
        this.players[this.playerId] = {
            x: this.playerId === 0 ? 100 : 700,
            y: 300,
            dx: 0,
            dy: 0,
            radius: 20,
            lastDx: this.playerId === 0 ? 1 : -1,
            lastDy: 0,
            lastShot: 0,
        };
        
        // Switch to multiplayer scene
        sceneManager.switchTo('multiplayer');
        this.showLoadingOverlay(false);
    }
    
    sendMove(player) {
        const now = Date.now();
        if (now - this.lastMoveSent >= 50 && this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ 
                type: 'move', 
                playerId: this.playerId, 
                position: player 
            }));
            this.lastMoveSent = now;
        }
    }
    
    sendShoot(bullet) {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ 
                type: 'shoot', 
                bullet: bullet, 
                playerId: this.playerId 
            }));
        }
    }
    
    sendGameOver(winnerId, isFinal = false) {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ 
                type: 'gameOver', 
                winnerId: winnerId, 
                isFinal: isFinal 
            }));
        }
    }
    
    sendRestart() {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ type: 'restart' }));
        }
    }
    
    sendScoreUpdate() {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ 
                type: 'scoreUpdate', 
                scores: this.scores 
            }));
        }
    }
    
    restartGame() {
        this.sendRestart();
        this.performGameRestart();
    }
    
    performGameRestart() {
        if (this.scores[0] >= 10 || this.scores[1] >= 10) {
            this.scores = { 0: 0, 1: 0 };
            this.sendScoreUpdate();
        }
        
        this.players = {};
        this.bullets = [];
        this.gameActive = true;
        
        this.players[this.playerId] = {
            x: this.playerId === 0 ? 100 : 700,
            y: 300,
            dx: 0,
            dy: 0,
            radius: 20,
            lastDx: this.playerId === 0 ? 1 : -1,
            lastDy: 0,
            lastShot: 0,
        };
        
        hideEndGameScreen();
        this.showLoadingOverlay(false);
    }
    
    closeConnections() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    
    updateStatus(message) {
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = message;
        }
    }
    
    showLoadingOverlay(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }
}

// Multiplayer Scene
class MultiplayerScene extends Scene {
    constructor() {
        super();
        this.multiplayerManager = null;
    }
    
    enter(data) {
        super.enter(data);
        this.multiplayerManager = data.multiplayerManager || new MultiplayerManager();
    }
    
    update(deltaTime) {
        if (!this.active || !this.multiplayerManager.gameActive) return;
        
        const player = this.multiplayerManager.players[this.multiplayerManager.playerId];
        if (!player) return;
        
        // Update player movement
        this.updatePlayerMovement(player);
        
        // Update bullets
        this.updateBullets();
        
        // Check collisions
        this.checkCollisions();
        
        // Send movement data
        this.multiplayerManager.sendMove(player);
    }
    
    updatePlayerMovement(player) {
        player.dx = 0;
        player.dy = 0;
        
        const keys = gameInstance.keys;
        
        if (keys['KeyW'] || keys['ArrowUp']) player.dy = -5;
        if (keys['KeyS'] || keys['ArrowDown']) player.dy = 5;
        if (keys['KeyA'] || keys['ArrowLeft']) player.dx = -5;
        if (keys['KeyD'] || keys['ArrowRight']) player.dx = 5;
        
        // Update last direction
        if (player.dx !== 0 || player.dy !== 0) {
            const magnitude = Math.sqrt(player.dx * player.dx + player.dy * player.dy);
            if (magnitude > 0) {
                player.lastDx = player.dx / magnitude;
                player.lastDy = player.dy / magnitude;
            }
        }
        
        // Update position
        player.x = Math.max(0, Math.min(canvas.width, player.x + player.dx));
        player.y = Math.max(0, Math.min(canvas.height, player.y + player.dy));
    }
    
    updateBullets() {
        this.multiplayerManager.bullets = this.multiplayerManager.bullets.filter((bullet) => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            return bullet.x >= 0 && bullet.x <= canvas.width && 
                   bullet.y >= 0 && bullet.y <= canvas.height;
        });
    }
    
    checkCollisions() {
        for (let bullet of this.multiplayerManager.bullets) {
            for (let id in this.multiplayerManager.players) {
                if (id != this.multiplayerManager.playerId && bullet.ownerId != id) {
                    const p = this.multiplayerManager.players[id];
                    if (p) {
                        const dx = bullet.x - p.x;
                        const dy = bullet.y - p.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < bullet.radius + p.radius) {
                            console.log(`Jogador ${id} atingido por bala de ${bullet.ownerId}`);
                            this.multiplayerManager.scores[bullet.ownerId]++;
                            
                            const isFinal = this.multiplayerManager.scores[bullet.ownerId] >= 10;
                            
                            this.multiplayerManager.sendScoreUpdate();
                            this.multiplayerManager.sendGameOver(bullet.ownerId, isFinal);
                            
                            const message = bullet.ownerId == this.multiplayerManager.playerId ? 
                                'Você venceu!' : 'Você perdeu!';
                            showEndGameScreen(message, isFinal);
                            return;
                        }
                    }
                }
            }
        }
    }
    
    shoot() {
        if (!this.multiplayerManager.gameActive) return;
        
        const player = this.multiplayerManager.players[this.multiplayerManager.playerId];
        if (!player) return;
        
        const now = Date.now();
        const shotInterval = 250;
        if (now - player.lastShot < shotInterval) return;
        
        const bulletSpeed = 10;
        const bullet = {
            x: player.x,
            y: player.y,
            dx: (player.lastDx || 1) * bulletSpeed,
            dy: (player.lastDy || 0) * bulletSpeed,
            radius: 5,
        };
        
        this.multiplayerManager.bullets.push({ ...bullet, ownerId: this.multiplayerManager.playerId });
        player.lastShot = now;
        
        this.multiplayerManager.sendShoot(bullet);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        const scores = this.multiplayerManager.scores;
        ctx.fillText(`Jogador 1: ${scores[0]} | Jogador 2: ${scores[1]}`, canvas.width / 2, 30);
        ctx.textAlign = 'start';
        
        // Render players
        for (let id in this.multiplayerManager.players) {
            if (this.multiplayerManager.players[id]) {
                ctx.fillStyle = id == this.multiplayerManager.playerId ? 'blue' : 'red';
                ctx.beginPath();
                const p = this.multiplayerManager.players[id];
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Render bullets
        ctx.fillStyle = 'yellow';
        for (let bullet of this.multiplayerManager.bullets) {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    handleInput