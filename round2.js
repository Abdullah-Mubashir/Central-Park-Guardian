// round2.js - Round 2: Follow AI enemies and shooting
class Round2Scene extends Phaser.Scene {
  constructor() { super('Round2Scene'); }

  preload() {
    this.load.image('round2Bg', 'round2Images/Background.png');
    this.load.audio('gunShot', 'round1Images/Gun.mp3');
  }

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

  create() {
    // Background image for Round 2
    this.add.image(0, 0, 'round2Bg')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);
    // Round 2 setup
    this.round = 2;
    this.ready = false;
    if (this.skipCountdown) {
      // Dev: skip countdown
      this.ready = true;
    } else {
      this.countdown = 4;
      this.countdownText = this.add.text(400, 50, `Combat starts in ${this.countdown}s`, { fontSize: '32px', color: '#ffff00' })
        .setOrigin(0.5).setDepth(10);
      this.time.addEvent({ delay: 1000, repeat: 4, callback: () => {
          this.countdown--;
          if (this.countdown > 0) {
            this.countdownText.setText(`Combat starts in ${this.countdown}s`);
          } else if (this.countdown === 0) {
            this.countdownText.setText('Go!'); 
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

    // Create player sprite using main character image
    this.player = this.physics.add.sprite(400, 300, 'playerSprite')
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
    this.input.keyboard.on('keydown-ONE', () => { this.player.power='common'; this.hud.setPower('common'); });
    this.input.keyboard.on('keydown-TWO', () => { if (this.availablePowers.has('blue')) { this.player.power='blue'; this.hud.setPower('blue'); }});
    this.input.keyboard.on('keydown-THREE', () => { if (this.availablePowers.has('gold')) { this.player.power='gold'; this.hud.setPower('gold'); }});
    // set initial power and use WeaponManager for shooting
    this.player.power = this.currentPower;
    this.hud.setPower(this.player.power);
    // show inventory of available weapons
    this.hud.setInventory(Array.from(this.availablePowers));
    this.weaponManager = new WeaponManager(this, this.commonFast);
    // dev: skip to Round 3 with F3
    this.input.keyboard.on('keydown-F3', () => {
      // Save timer state before advancing
      if (this.hud && typeof this.hud.stopTimer === 'function') {
        // Temporarily stop timer to save current time
        this.hud.stopTimer();
      }
      
      // save loadout to localStorage
      localStorage.setItem('round2Loadout', JSON.stringify({
        powers: Array.from(this.availablePowers),
        health: this.hud.health,
        armor: this.hud.armor,
        credits: this.hud.credit,
        commonFast: this.commonFast,
        currentPower: this.player.power
      }));
      
      this.scene.start('Round3Scene', {
        powers: Array.from(this.availablePowers),
        health: this.hud.health,
        armor: this.hud.armor,
        credits: this.hud.credit,
        commonFast: this.commonFast,
        currentPower: this.player.power
      });
    });
    // track alive state
    this.isPlayerAlive = true;

    // spawn weapon pickups for weapons not yet acquired
    this.weaponPickups = this.physics.add.staticGroup();
    const weaponTypes = ['common','blue','gold'];
    weaponTypes.forEach((type, idx) => {
      if (!this.availablePowers.has(type)) {
        const key = `power_${type}`;
        const x = 100 + idx * 150;
        const y = 100;
        const pu = this.weaponPickups.create(x, y, key);
        pu.powerType = type;
      }
    });
    // pickup overlaps
    this.physics.add.overlap(this.player, this.weaponPickups, (player, pu) => {
      const type = pu.powerType;
      this.availablePowers.add(type);
      this.add.text(pu.x, pu.y - 20, `Unlocked ${type}`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
      pu.destroy();
      // update inventory display
      this.hud.setInventory(Array.from(this.availablePowers));
    });

    // master enemies group for hit detection
    this.enemies = this.physics.add.group();

    // Enemy spawn after countdown
    this.time.delayedCall(11000, () => {
      // Spawn enemies: 3 mobile, others stationary
      this.mobileEnemies = this.physics.add.group();
      this.stationaryEnemies = this.physics.add.group();
      for (let i = 0; i < 16; i++) {
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const y = Phaser.Math.Between(50, this.scale.height - 50);
        const enemy = new Enemy(this, x, y);
        // Set enemy health to 50 for Round 2
        enemy.health = 50;
        // increase enemy size by 40% (scale factor 1.4)
        enemy.setDisplaySize(enemy.displayWidth * 1.4, enemy.displayHeight * 1.4);
        enemy.body.setSize(enemy.displayWidth, enemy.displayHeight);
        // add to master group
        this.enemies.add(enemy);
        if (i < 3) this.mobileEnemies.add(enemy);
        else this.stationaryEnemies.add(enemy);
      }
      // Movement: only mobile enemies track player
      this.time.addEvent({ delay: 200, loop: true, callback: () => {
        this.mobileEnemies.getChildren().forEach(e => {
          if (e.active) this.physics.moveToObject(e, this.player, 100);
        });
      }});
      // Shooting: one stationary enemy fires bullets every 1s
      this.enemyBullets = this.physics.add.group();
      this.time.addEvent({ delay: 1000, loop: true, callback: () => {
        const alive = this.stationaryEnemies.getChildren().filter(e => e.active);
        if (alive.length === 0) return;
        const shooter = alive[Phaser.Math.Between(0, alive.length - 1)];
        const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, this.player.x, this.player.y);
        const eb = this.enemyBullets.create(shooter.x, shooter.y, 'bullet_enemy');
        eb.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
        this.time.delayedCall(2000, () => eb.destroy());
      }});
      // Overlap damage
      this.physics.add.overlap(this.player, this.enemyBullets, (player, eb) => {
        eb.destroy();
        const damage = 20 * 1.2;
        if (this.hud.armor > 0) {
          this.hud.setArmor(this.hud.armor - damage);
        } else {
          this.hud.setHealth(this.hud.health - damage);
        }
        // death state: return to main menu
        if (this.hud.health <= 0 && this.isPlayerAlive) {
          this.isPlayerAlive = false;
          this.add.text(400, 300, 'Game Over', { fontSize: '48px', color: '#ff0000' }).setOrigin(0.5);
          
          // Stop the global timer when player dies
          if (window.gameTimer) {
            window.gameTimer.stop();
          }
          
          // Also stop the HUD timer for backward compatibility
          if (this.hud && typeof this.hud.stopTimer === 'function') {
            this.hud.stopTimer();
          }
          
          // Return to main menu after 2s
          this.time.delayedCall(2000, () => this.scene.start('MainMenu'));
        }
      });
      // general bullet-enemy overlap
      this.physics.add.overlap(this.weaponManager.bullets, this.enemies, (bullet, enemy) => {
        let dmg = bullet.damage || Phaser.Math.Between(20, 50);
        enemy.takeDamage(dmg);
        bullet.destroy();
        if (!enemy.active) {
          this.hud.setCredit(this.hud.credit + 10);
          if (this.stationaryEnemies.countActive() + this.mobileEnemies.countActive() === 0) {
            this.time.delayedCall(1000, () => {
              // Save timer state before advancing
              if (this.hud && typeof this.hud.stopTimer === 'function') {
                // Temporarily stop timer to save current time
                this.hud.stopTimer();
              }
              
              // save loadout to localStorage
              localStorage.setItem('round2Loadout', JSON.stringify({
                powers: Array.from(this.availablePowers),
                health: this.hud.health,
                armor: this.hud.armor,
                credits: this.hud.credit,
                commonFast: this.commonFast,
                currentPower: this.player.power
              }));
              
              this.scene.start('Round3Scene', {
                powers: Array.from(this.availablePowers),
                health: this.hud.health,
                armor: this.hud.armor,
                credits: this.hud.credit,
                commonFast: this.commonFast,
                currentPower: this.player.power
              });
            });
          }
        }
      });
      // Mobile enemies shooting
      this.time.addEvent({ delay: 1000, loop: true, callback: () => {
        const aliveMobiles = this.mobileEnemies.getChildren().filter(e => e.active);
        aliveMobiles.forEach(shooter => {
          const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, this.player.x, this.player.y);
          const eb2 = this.enemyBullets.create(shooter.x, shooter.y, 'bullet_enemy');
          eb2.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
          this.time.delayedCall(2000, () => eb2.destroy());
        });
      }});
    });
  }

  handleShoot(pointer) {
    if (!this.ready) return;
    this.weaponManager.shoot(pointer);
  }

  update() {
    // Always allow player movement
    this.player.body.setVelocity(0, 0);
    if (this.cursors.left.isDown)  this.player.body.setVelocityX(-this.playerSpeed);
    if (this.cursors.right.isDown) this.player.body.setVelocityX(this.playerSpeed);
    if (this.cursors.up.isDown)    this.player.body.setVelocityY(-this.playerSpeed);
    if (this.cursors.down.isDown)  this.player.body.setVelocityY(this.playerSpeed);
    this.player.body.velocity.normalize().scale(this.playerSpeed);
  }
}
window.Round2Scene = Round2Scene;
