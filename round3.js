// round3.js - Round 3: Single Enemy Battle
class Round3Scene extends Phaser.Scene {
  constructor() { super('Round3Scene'); }

  init(data) {
    // Inherit player state
    this.availablePowers = new Set(data.powers);
    this.initialHealth = data.health;
    this.initialArmor = data.armor;
    this.initialCredits = data.credits;
    this.commonFast = data.commonFast;
    this.currentPower = data.currentPower || Array.from(this.availablePowers)[0] || 'common';
    // Dev skip flag
    this.skipCountdown = data.skip || false;
  }

  preload() {
    this.load.image('round3Bg', 'round3Images/Background.jpeg');
    this.load.image('playerSprite', 'round1Images/Maincharacter.jpg');
    this.load.image('bossSprite', 'round3Images/bigguy.png');
    this.load.audio('gunShot', 'round1Images/Gun.mp3');
  }

  create() {
    // Background image for Round 3 boss arena
    this.add.image(0, 0, 'round3Bg')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.8);

    // Round 4 boss fight setup
    this.round = 4;
    this.ready = false;
    if (this.skipCountdown) {
      // Dev: skip countdown
      this.ready = true;
    } else {
      this.countdown = 10;
      this.countdownText = this.add.text(400, 50, `Boss fight starts in ${this.countdown}s`, { fontSize: '32px', color: '#ffff00' })
        .setOrigin(0.5).setDepth(10);
      this.time.addEvent({ delay: 1000, repeat: 10, callback: () => {
          this.countdown--;
          if (this.countdown > 0) {
            this.countdownText.setText(`Boss fight starts in ${this.countdown}s`);
          } else if (this.countdown === 0) {
            this.countdownText.setText('BOSS BATTLE BEGINS!');
            this.ready = true;
            
            // Start the timer when combat begins
            if (this.hud && typeof this.hud.startTimer === 'function') {
              this.hud.startTimer();
            }
          } else {
            this.countdownText.destroy();
          }
      }});
    }

    // Create player (reuse texture)
    this.player = this.physics.add.sprite(400, 450, 'playerSprite')
      .setDisplaySize(64, 64)
      .setCollideWorldBounds(true);
    // Player speed
    this.playerSpeed = 200;
    // Player input keys
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // HUD
    this.hud = new HUD(this);
    this.hud.setHealth(this.initialHealth);
    this.hud.setArmor(this.initialArmor);
    this.hud.setCredit(this.initialCredits);
    
    // Continue timer from previous round
    // Get elapsed time from localStorage if available
    const previousElapsedTime = parseInt(localStorage.getItem('currentRunTimeSeconds') || '0') * 1000;
    if (previousElapsedTime > 0) {
      this.hud.elapsedTime = previousElapsedTime;
      this.hud.updateTimerDisplay();
    }
    
    // Start timer when countdown ends or immediately if skipped
    if (this.skipCountdown) {
      if (this.hud && typeof this.hud.startTimer === 'function') {
        this.hud.startTimer();
      }
    }
    // Power UI
    this.input.keyboard.on('keydown-ONE', () => { this.player.power = 'common'; this.hud.setPower('common'); });
    this.input.keyboard.on('keydown-TWO', () => { if (this.availablePowers.has('blue')) { this.player.power = 'blue'; this.hud.setPower('blue'); }});
    this.input.keyboard.on('keydown-THREE', () => { if (this.availablePowers.has('gold')) { this.player.power = 'gold'; this.hud.setPower('gold'); }});
    // set initial power and use WeaponManager for shooting
    this.player.power = this.currentPower;
    this.hud.setPower(this.player.power);
    // show inventory of available weapons
    this.hud.setInventory(Array.from(this.availablePowers));
    this.weaponManager = new WeaponManager(this, this.commonFast);
    
    // dev: skip to ending scene with F4
    this.input.keyboard.on('keydown-F4', () => {
      // Stop the global timer when skipping to ending
      if (window.gameTimer) {
        window.gameTimer.stop();
        // Mark as completed since we're skipping to the end
        window.gameTimer.saveTime(true);
      }
      
      // Also stop the HUD timer for backward compatibility
      if (this.hud && typeof this.hud.stopTimer === 'function') {
        // Temporarily stop timer to save current time
        this.hud.stopTimer();
        
        // Store time played for the ending scene
        localStorage.setItem('timePlayed', localStorage.getItem('currentRunTime') || '00:00');
      }
      
      // save loadout to localStorage
      localStorage.setItem('round3Loadout', JSON.stringify({
        powers: Array.from(this.availablePowers),
        health: this.hud.health,
        armor: this.hud.armor,
        credits: this.hud.credit,
        commonFast: this.commonFast,
        currentPower: this.player.power
      }));
      
      this.scene.start('EndingScene');
    });
    
    // track alive state
    this.isPlayerAlive = true;
    this.isBossDead = false;

    // Create boss after countdown
    this.time.delayedCall(11000, this.createBoss, [], this);
  }
  
  createBoss() {
    // Create boss sprite
    this.boss = this.physics.add.sprite(400, 150, 'bossSprite')
      .setDisplaySize(Math.round(64 * 1.1), Math.round(64 * 1.1))
      .setCollideWorldBounds(true);
    this.boss.health = 900; // initial boss health
    this.boss.maxHealth = 900;
    
    // Boss health bar
    this.bossHealthBarBg = this.add.rectangle(400, 80, 300, 20, 0x000000).setOrigin(0.5);
    this.bossHealthBar = this.add.rectangle(400, 80, 300, 20, 0xff0000).setOrigin(0.5);
    this.bossHealthText = this.add.text(400, 50, 'BOSS: 900/900', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    
    // Boss movement pattern
    this.bossMoveTimer = this.time.addEvent({
      delay: 3000,
      callback: this.changeBossMovement,
      callbackScope: this,
      loop: true
    });
    
    // Boss attack patterns
    this.bossAttackTimer = this.time.addEvent({
      delay: 2000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });
    
    // Boss projectiles group
    this.bossProjectiles = this.physics.add.group();
    
    // Collisions
    this.physics.add.overlap(this.weaponManager.bullets, this.boss, this.hitBoss, null, this);
    this.physics.add.overlap(this.player, this.bossProjectiles, this.hitPlayer, null, this);
    this.physics.add.overlap(this.player, this.boss, this.hitPlayerWithBoss, null, this);
  }
  
  changeBossMovement() {
    if (!this.boss || !this.boss.active) return;
    
    const moveType = Phaser.Math.Between(0, 3);
    
    switch (moveType) {
      case 0: // Move to random position
        const targetX = Phaser.Math.Between(100, 700);
        const targetY = Phaser.Math.Between(100, 200);
        this.physics.moveTo(this.boss, targetX, targetY, 300); // Doubled from 150
        break;
      case 1: // Chase player briefly
        this.physics.moveToObject(this.boss, this.player, 360); // Doubled from 180
        this.time.delayedCall(1500, () => {
          if (this.boss && this.boss.active) this.boss.setVelocity(0, 0);
        });
        break;
      case 2: // Side to side movement
        this.boss.setVelocity(400, 0); // Doubled from 200
        this.time.delayedCall(1500, () => {
          if (this.boss && this.boss.active) this.boss.setVelocity(-400, 0); // Doubled from -200
        });
        break;
      case 3: // Hold position and prepare attack
        this.boss.setVelocity(0, 0);
        // Visual indicator for charging
        const chargeEffect = this.add.circle(this.boss.x, this.boss.y, 40, 0xffff00, 0.6);
        this.time.delayedCall(1000, () => chargeEffect.destroy());
        break;
    }
  }
  
  bossAttack() {
    if (!this.boss || !this.boss.active || !this.ready) return;
    
    const attackType = Phaser.Math.Between(0, 3);
    
    switch (attackType) {
      case 0: // Single direct shot
        this.fireBossProjectile(this.boss.x, this.boss.y, this.player.x, this.player.y, 200);
        break;
      case 1: // Triple spread shot
        const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
        this.fireBossProjectile(this.boss.x, this.boss.y, this.player.x, this.player.y, 200);
        this.fireBossProjectile(this.boss.x, this.boss.y, 
                               this.player.x + Math.cos(angle - 0.3) * 100, 
                               this.player.y + Math.sin(angle - 0.3) * 100, 
                               200);
        this.fireBossProjectile(this.boss.x, this.boss.y, 
                               this.player.x + Math.cos(angle + 0.3) * 100, 
                               this.player.y + Math.sin(angle + 0.3) * 100, 
                               200);
        break;
      case 2: // Circle blast
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI * 2 / 8) * i;
          const targetX = this.boss.x + Math.cos(ang) * 100;
          const targetY = this.boss.y + Math.sin(ang) * 100;
          this.fireBossProjectile(this.boss.x, this.boss.y, targetX, targetY, 150);
        }
        break;
      case 3: // Fast chase shot
        if (this.boss.health < this.boss.maxHealth * 0.5) {
          // Rage mode when below 50% health - faster projectile
          this.fireBossProjectile(this.boss.x, this.boss.y, this.player.x, this.player.y, 300, 0xff0000, 16);
        } else {
          this.fireBossProjectile(this.boss.x, this.boss.y, this.player.x, this.player.y, 250);
        }
        break;
    }
    
    // If boss is below 30% health, add an extra random attack
    if (this.boss.health < this.boss.maxHealth * 0.3) {
      this.time.delayedCall(500, () => {
        if (this.boss && this.boss.active) {
          const desperate = Phaser.Math.Between(0, 1);
          if (desperate === 0) {
            // Faster tracking shot
            this.fireBossProjectile(this.boss.x, this.boss.y, this.player.x, this.player.y, 280, 0xffff00);
          } else {
            // Random spread
            for (let i = 0; i < 3; i++) {
              const randomX = Phaser.Math.Between(-100, 100) + this.player.x;
              const randomY = Phaser.Math.Between(-100, 100) + this.player.y;
              this.fireBossProjectile(this.boss.x, this.boss.y, randomX, randomY, 200);
            }
          }
        }
      });
    }
  }
  
  fireBossProjectile(fromX, fromY, toX, toY, speed, color = 0xff6600, size = 12) {
    // boost speed by 20%
    speed = speed * 1.2;
    const projectile = this.physics.add.sprite(fromX, fromY, 'bullet_enemy');
    projectile.setDisplaySize(size, size);
    projectile.setTint(color);
    this.bossProjectiles.add(projectile);
    
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    
    // Destroy after a time
    this.time.delayedCall(3000, () => {
      if (projectile.active) projectile.destroy();
    });
    
    return projectile;
  }
  
  hitBoss(boss, bullet) {
    // Don't register hits if boss is already dead
    if (this.isBossDead) {
      bullet.destroy();
      return;
    }
    
    // Don't register hits if player is dead
    if (!this.isPlayerAlive) {
      bullet.destroy();
      return;
    }
    
    let damage;
    const key = bullet.texture.key;
    
    // Calculate damage based on weapon type
    if (key === 'bullet_common') {
      damage = this.commonFast ? Phaser.Math.Between(15, 30) : Phaser.Math.RND.pick([20, 50]);
    } else if (key === 'bullet_blue') {
      damage = Phaser.Math.Between(40, 60);
    } else if (key === 'bullet_gold') {
      damage = Phaser.Math.Between(50, 70);
    } else {
      damage = 20; // Default fallback
    }
    
    boss.health -= damage;
    
    // Update boss health display
    this.updateBossHealth();
    
    // Create hit effect
    const hitEffect = this.add.circle(bullet.x, bullet.y, 10, 0xffffff, 0.8);
    this.time.delayedCall(100, () => hitEffect.destroy());
    
    // Remove bullet
    bullet.destroy();
    
    // Check if boss is defeated
    if (boss.health <= 0 && !this.isBossDead) {
      this.bossDeath();
    }
  }
  
  updateBossHealth() {
    if (!this.boss) return;
    
    // Calculate health percentage
    const healthPercent = Math.max(0, this.boss.health / this.boss.maxHealth);
    
    // Update health bar width
    this.bossHealthBar.width = 300 * healthPercent;
    
    // Update health text
    this.bossHealthText.setText(`BOSS: ${Math.max(0, this.boss.health)}/${this.boss.maxHealth}`);
    
    // Change color based on health
    if (healthPercent < 0.3) {
      this.bossHealthBar.fillColor = 0xff0000; // Red at low health
    } else if (healthPercent < 0.6) {
      this.bossHealthBar.fillColor = 0xffff00; // Yellow at medium health
    }
  }
  
  hitPlayer(player, projectile) {
    // Calculate damage to player
    const damage = 15;
    
    // Apply damage first to armor, then to health
    if (this.hud.armor > 0) {
      this.hud.setArmor(Math.max(0, this.hud.armor - damage));
    } else {
      this.hud.setHealth(Math.max(0, this.hud.health - damage));
    }
    
    // Visual feedback
    this.cameras.main.shake(100, 0.01);
    
    // Destroy projectile
    projectile.destroy();
    
    // Check player death
    this.checkPlayerDeath();
  }
  
  hitPlayerWithBoss(player, boss) {
    // More damage for direct boss contact
    const damage = 25;
    
    // Apply damage first to armor, then to health
    if (this.hud.armor > 0) {
      this.hud.setArmor(Math.max(0, this.hud.armor - damage));
    } else {
      this.hud.setHealth(Math.max(0, this.hud.health - damage));
    }
    
    // Push player away from boss
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
    
    // Stronger visual feedback
    this.cameras.main.shake(150, 0.02);
    
    // Don't let boss collide again for a moment
    this.time.delayedCall(1000, () => {}, [], this);
    
    // Check player death
    this.checkPlayerDeath();
  }
  
  checkPlayerDeath() {
    if (this.hud.health <= 0 && this.isPlayerAlive) {
      this.isPlayerAlive = false;
      this.player.setTint(0xff0000);
      
      // Disable weapon manager
      if (this.weaponManager) {
        this.input.off('pointerdown');
      }
      
      // Show game over message
      this.add.text(400, 300, 'Game Over', { fontSize: '48px', color: '#ff0000' }).setOrigin(0.5);
      
      // Stop the global timer when player dies
      if (window.gameTimer) {
        window.gameTimer.stop();
      }
      
      // Also stop the HUD timer for backward compatibility
      if (this.hud && typeof this.hud.stopTimer === 'function') {
        this.hud.stopTimer();
      }
      
      // Return to main menu after delay
      this.time.delayedCall(2000, () => {
        this.scene.start('MainMenu');
      });
    }
  }
  
  bossDeath() {
    this.isBossDead = true;
    
    // Stop boss movement and attacks
    if (this.bossMoveTimer) this.bossMoveTimer.remove();
    if (this.bossAttackTimer) this.bossAttackTimer.remove();
    
    // Boss death animation
    this.boss.setTint(0xffffff);
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 2,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.boss.destroy();
        
        // Explosion effects
        for (let i = 0; i < 20; i++) {
          const x = 400 + Phaser.Math.Between(-50, 50);
          const y = 150 + Phaser.Math.Between(-50, 50);
          const size = Phaser.Math.Between(10, 30);
          const explosion = this.add.circle(x, y, size, 0xff0000, 0.8);
          
          this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 3,
            duration: 500 + Phaser.Math.Between(0, 500),
            ease: 'Power2',
            onComplete: () => explosion.destroy()
          });
        }
        
        // Award credits for defeating boss
        this.hud.setCredit(this.hud.credit + 100);
        
        // Show victory message
        const victoryText = this.add.text(400, 300, 'BOSS DEFEATED!', 
                                         { fontSize: '48px', color: '#ffff00', fontStyle: 'bold' })
          .setOrigin(0.5);
        
        // Flash victory message
        this.tweens.add({
          targets: victoryText,
          alpha: 0.5,
          yoyo: true,
          repeat: 5,
          duration: 200
        });
        
        // Stop the global timer when boss is defeated
        if (window.gameTimer) {
          // Pass true to indicate the game was completed (boss defeated)
          window.gameTimer.stop();
          window.gameTimer.saveTime(true);
        }
        
        // Also stop the HUD timer for backward compatibility
        if (this.hud && typeof this.hud.stopTimer === 'function') {
          this.hud.stopTimer();
          
          // Store time played for the ending scene
          localStorage.setItem('timePlayed', localStorage.getItem('currentRunTime') || '00:00');
        }
        
        // Proceed to ending screen after delay
        this.time.delayedCall(3000, () => {
          // save loadout to localStorage
          localStorage.setItem('gameCompleted', 'true');
          localStorage.setItem('finalStats', JSON.stringify({
            powers: Array.from(this.availablePowers),
            health: this.hud.health,
            armor: this.hud.armor,
            credits: this.hud.credit,
            commonFast: this.commonFast,
            currentPower: this.player.power
          }));
          
          // Go to ending scene instead of victory scene
          this.scene.start('EndingScene');
        });
      }
    });
  }

  handleShoot(pointer) {
    if (!this.ready) return;
    this.weaponManager.shoot(pointer);
  }

  update() {
    // Always allow player movement
    this.player.body.setVelocity(0, 0);
    
    if (this.isPlayerAlive) {
      if (this.cursors.left.isDown)  this.player.body.setVelocityX(-this.playerSpeed);
      if (this.cursors.right.isDown) this.player.body.setVelocityX(this.playerSpeed);
      if (this.cursors.up.isDown)    this.player.body.setVelocityY(-this.playerSpeed);
      if (this.cursors.down.isDown)  this.player.body.setVelocityY(this.playerSpeed);
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
    
    // Add a simple victory scene class at the end to handle the game completion
    if (!window.VictoryScene) {
      window.VictoryScene = class VictoryScene extends Phaser.Scene {
        constructor() { super('VictoryScene'); }
        
        init(data) {
          this.playerData = data;
        }
        
        create() {
          // Victory screen background
          this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000033)
            .setOrigin(0, 0);
            
          // Victory message
          this.add.text(400, 150, 'VICTORY!', 
                       { fontSize: '64px', color: '#ffff00', fontStyle: 'bold' })
            .setOrigin(0.5);
            
          // Player stats
          this.add.text(400, 250, 'Final Stats:', 
                       { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5);
            
          const stats = [
            `Health: ${this.playerData.health}`,
            `Armor: ${this.playerData.armor}`,
            `Credits: ${this.playerData.credits}`,
            `Weapons: ${Array.from(this.playerData.powers).join(', ')}`
          ];
          
          stats.forEach((stat, index) => {
            this.add.text(400, 300 + index * 40, stat, 
                         { fontSize: '24px', color: '#ffffff' })
              .setOrigin(0.5);
          });
          
          // Play again button
          const playAgain = this.add.text(400, 500, 'Play Again', 
                                         { fontSize: '36px', color: '#00ff00', fontStyle: 'bold' })
            .setOrigin(0.5)
            .setPadding(20)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => playAgain.setAlpha(0.8))
            .on('pointerout', () => playAgain.setAlpha(1))
            .on('pointerdown', () => this.scene.start('GameScene'));
            
          // Celebration particles
          const particles = this.add.particles(0, 0, 'bullet_gold', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 3000,
            frequency: 200,
            quantity: 2,
            blendMode: 'ADD',
            emitting: true,
            emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(0, 0, 800, 600) }
          });
        }
      };
    }
  }
}