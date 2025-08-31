
class Sprite {
    constructor(texture, frames, initialFrame) {
        this.texture = texture;
        this.frames = frames;
        this.frame = initialFrame;
        this.position = { x: 0, y: 0 };
        this.rotation = 0;
        this.scale = 1;
        this.frameWidth = texture.width / frames;
        this.frameHeight = texture.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        ctx.imageSmoothingEnabled = false;
        
        ctx.drawImage(
            this.texture,
            this.frame * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            -this.frameWidth/2, -this.frameHeight/2,
            this.frameWidth, this.frameHeight
        );
        
        ctx.restore();
    }

    update() {
            // 调整旋转速度
            this.rotation += 0.01;
        }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        this.ctx = this.canvas.getContext('2d');
        this.sprites = [];
        this.sprites_fllow_1 = [];
        this.static_sprites = [];

        this.lastTime = 0;
        
        this.keys = {};
        // 添加鼠标移动事件监听
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        // 初始化目标位置为屏幕中心
        this.targetPosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        
        this.speed = 5;
        this.minDistance = 30; // 新增：最小距离阈值，小于这个值就停止移动
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.loadTexture();
        this.loadStaticTexture();
        this.loadfllowTexture_1();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // 重置目标位置到新屏幕中心
        this.targetPosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
    }
    
    getAxis(negKey, posKey) {
        let result = 0;
        if (this.keys[negKey]) result -= 1;
        if (this.keys[posKey]) result += 1;
        return result;
    }

    loadStaticTexture() {
        const img = new Image();
        img.onload = () => {
            const frameCount = 9;
            
            for (let i = 0; i < frameCount; i++) {
                const sprite = new Sprite(img, frameCount, i);
                sprite.position = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - i * 4
                };
                sprite.scale = 4;
                this.static_sprites.push(sprite);
            }
        };
        
        img.src = 'images/P.png';
    }

    loadfllowTexture_1() {
        const img = new Image();
        img.onload = () => {
            const frameCount = 10;
            
            for (let i = 0; i < frameCount; i++) {
                const sprite = new Sprite(img, frameCount, i);
                sprite.position = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - i * 2
                };
                sprite.scale = 2;
                this.sprites_fllow_1.push(sprite);
            }
        };
        
        img.src = 'images/Loading.png';
    }
    
    loadTexture() {
        const img = new Image();
        img.onload = () => {
            const frameCount = 15;
            
            for (let i = 0; i < frameCount; i++) {
                const sprite = new Sprite(img, frameCount, i);
                sprite.position = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - i * 2
                };
                sprite.scale = 2;
                this.sprites.push(sprite);
            }
            
            requestAnimationFrame(this.gameLoop.bind(this));
        };
        
        img.src = 'images/player.png';
    }
    
    gameLoop(timestamp) {
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // 持续跟随鼠标位置
        this.followMouse();

        this.follow_1();
        
        //this.ctx.fillStyle = '#49707d';
        //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // this.static_sprites.forEach(sprite => {
        //     sprite.draw(this.ctx);
        // });

        this.sprites_fllow_1.forEach(sprite => {
            sprite.draw(this.ctx);
            sprite.update();
        });
        
        this.sprites.forEach(sprite => {
            sprite.draw(this.ctx);
        });

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    handleMouseMove(e) {
        // 更新目标位置为当前鼠标位置
        const rect = this.canvas.getBoundingClientRect();
        this.targetPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    follow_1() {
        if (this.sprites_fllow_1.length === 0) return;
        
        const Spritefllow_1 = this.sprites_fllow_1[0];

        const dx = this.sprites[0].position.x - Spritefllow_1.position.x;
        const dy = this.sprites[0].position.y - Spritefllow_1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果距离小于最小距离阈值，则不移动
        if (distance < 70) return;
        
        // 计算移动方向和速度
        const moveX = (dx / distance) * 4;
        const moveY = (dy / distance) * 4;
        
        // 更新精灵位置
        const spriteHalfWidth = Spritefllow_1.frameWidth * Spritefllow_1.scale / 2;
        const spriteHalfHeight = Spritefllow_1.frameHeight * Spritefllow_1.scale / 2;
        
        let newX = Spritefllow_1.position.x + moveX;
        let newY = Spritefllow_1.position.y + moveY;
        
        // 边界检查
        newX = Math.max(spriteHalfWidth, Math.min(this.canvas.width - spriteHalfWidth, newX));
        newY = Math.max(spriteHalfHeight, Math.min(this.canvas.height - spriteHalfHeight, newY));
        
        // 更新所有精灵位置
        const actualMoveX = newX - Spritefllow_1.position.x;
        const actualMoveY = newY - Spritefllow_1.position.y;
        
        for (let i = 0; i < this.sprites_fllow_1.length; i++) {
            const sprite = this.sprites_fllow_1[i];
            sprite.position.x += actualMoveX;
            sprite.position.y += actualMoveY;
            
            // 更新旋转角度
            if (i >= 0) {
                const targetAngle = Math.atan2(dy, dx);
                sprite.rotation = this.lerpAngle(sprite.rotation, targetAngle, 0.1);
            }
        }
    }

    followMouse() {
        if (this.sprites.length === 0) return;
        
        const mainSprite = this.sprites[0];
        const dx = this.targetPosition.x - mainSprite.position.x;
        const dy = this.targetPosition.y - mainSprite.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果距离小于最小距离阈值，则不移动
        if (distance < this.minDistance) return;
        
        // 计算移动方向和速度
        const moveX = (dx / distance) * this.speed;
        const moveY = (dy / distance) * this.speed;
        
        // 更新精灵位置
        const spriteHalfWidth = mainSprite.frameWidth * mainSprite.scale / 2;
        const spriteHalfHeight = mainSprite.frameHeight * mainSprite.scale / 2;
        
        let newX = mainSprite.position.x + moveX;
        let newY = mainSprite.position.y + moveY;
        
        // 边界检查
        newX = Math.max(spriteHalfWidth, Math.min(this.canvas.width - spriteHalfWidth, newX));
        newY = Math.max(spriteHalfHeight, Math.min(this.canvas.height - spriteHalfHeight, newY));
        
        // 更新所有精灵位置
        const actualMoveX = newX - mainSprite.position.x;
        const actualMoveY = newY - mainSprite.position.y;
        
        for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i];
            sprite.position.x += actualMoveX;
            sprite.position.y += actualMoveY;
            
            // 更新旋转角度
            if (i >= 0) {
                const targetAngle = Math.atan2(dy, dx);
                sprite.rotation = this.lerpAngle(sprite.rotation, targetAngle, 0.1);
            }
        }
    }
            
    handleInput(delta) {
        if (this.sprites.length === 0) return;
        
        const movement_H = this.getAxis('a', 'd');
        const movement_V = this.getAxis('w', 's');
        
        if (movement_H !== 0 || movement_V !== 0) {
            const length = Math.sqrt(movement_H * movement_H + movement_V * movement_V);
            const normalized_H = movement_H / length;
            const normalized_V = movement_V / length;
            
            const moveX = normalized_H * this.speed;
            const moveY = normalized_V * this.speed;
            
            const mainSprite = this.sprites[0];
            const spriteHalfWidth = mainSprite.frameWidth * mainSprite.scale / 2;
            const spriteHalfHeight = mainSprite.frameHeight * mainSprite.scale / 2;
            
            let newX = mainSprite.position.x + moveX;
            let newY = mainSprite.position.y + moveY;
            
            newX = Math.max(spriteHalfWidth, Math.min(this.canvas.width - spriteHalfWidth, newX));
            newY = Math.max(spriteHalfHeight, Math.min(this.canvas.height - spriteHalfHeight, newY));
            
            const actualMoveX = newX - mainSprite.position.x;
            const actualMoveY = newY - mainSprite.position.y;
            
            for (let i = 0; i < this.sprites.length; i++) {
                const sprite = this.sprites[i];
                sprite.position.x += actualMoveX;
                sprite.position.y += actualMoveY;
                
                if (i >= 0) {
                    const targetAngle = Math.atan2(normalized_V, normalized_H);
                    sprite.rotation = this.lerpAngle(sprite.rotation, targetAngle, 0.1);
                }
            }
        }
    }
    
    lerpAngle(current, target, t) {
        current = this.normalizeAngle(current);
        target = this.normalizeAngle(target);
        
        let diff = target - current;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        
        return current + diff * t;
    }
    
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
}

new Game();
