// main.js - Phaser 3 setup with Main Menu and Settings scenes

class MainMenu extends Phaser.Scene {
  constructor() { super('MainMenu'); }
  preload() {
    // load core assets
    this.load.image('grassBg', 'round1Images/Background.png');
    this.load.image('enemy', 'round1Images/enemie.jpg');
    // main character portrait for HUD
    this.load.image('playerPortrait', 'round1Images/Maincharacter.jpg');
    this.load.audio('bgMusic', 'round1Images/Background.mp3');
    this.load.audio('buttonClick', 'round1Images/Buttonclick.mp3');
    this.load.audio('pregameLine', 'round1Images/pregameline.mp3');
    this.load.audio('endgameLines', 'round1Images/endgamelines.mp3');
  }
  create() {
    // Initialize the global timer
    if (window.gameTimer) {
      window.gameTimer.init();
    }
    
    // background
    this.cameras.main.setBackgroundColor('#1d212d');
    // title text
    this.add.text(400, 150, 'Central Park Guardian', {
      fontFamily: 'Arial', fontSize: '48px', color: '#ffffff'
    }).setOrigin(0.5);
    
    // Check if player has completed the game (defeated the boss)
    const gameCompleted = localStorage.getItem('gameCompleted') === 'true';
    // Determine if player has viewed the narrative message
    const messageRead = localStorage.getItem('messageRead') === 'true';

    // Display commander status
    this.add.text(400, 210, `Killed Commander: ${gameCompleted ? 'Yes' : 'No'}`, {
      fontFamily: 'Arial', fontSize: '24px', color: gameCompleted ? '#00ff00' : '#ff0000'
    }).setOrigin(0.5);
    

    // menu options (styled buttons) - adjust positions based on game completion status
    const buttonY = gameCompleted ? 320 : 300;
    
    const startBtn = this.add.container(400, buttonY).setSize(200, 50);
    const startBg = this.add.rectangle(0, 0, 200, 50, 0x3b3f56).setStrokeStyle(2, 0xa9d1ff);
    const startText = this.add.text(0, 0, 'Start Game', { fontSize: '32px', color: '#a9d1ff' }).setOrigin(0.5);
    startBtn.add([startBg, startText]);
    // Disable start until narrative viewed
    if (!messageRead) {
      startBtn.disableInteractive();
      startBg.setFillStyle(0x3b3f56, 0.5);
      startText.setStyle({ color: '#666666' });
    } else {
      startBtn.setInteractive({ useHandCursor: true });
    }
    startBtn.on('pointerover', () => startText.setStyle({ color: '#ffffff' }));
    startBtn.on('pointerout', () => startText.setStyle({ color: '#a9d1ff' }));
    startBtn.on('pointerup', () => {
      this.sound.play('buttonClick', { volume: 1.0 });
      console.log('Start clicked');
      this.scene.start('GameScene');
    });
    
    const settingsBtn = this.add.container(400, buttonY + 70).setSize(200, 50).setInteractive({ useHandCursor: true });
    const settingsBg = this.add.rectangle(0, 0, 200, 50, 0x3b3f56).setStrokeStyle(2, 0xa9d1ff);
    const settingsText = this.add.text(0, 0, 'Settings', { fontSize: '32px', color: '#a9d1ff' }).setOrigin(0.5);
    settingsBtn.add([settingsBg, settingsText]);
    settingsBtn.on('pointerover', () => settingsText.setStyle({ color: '#ffffff' }));
    settingsBtn.on('pointerout', () => settingsText.setStyle({ color: '#a9d1ff' }));
    settingsBtn.on('pointerup', () => {
      this.sound.play('buttonClick', { volume: 1.0 });
      this.scene.start('Settings');
    });
    
    // Message button to launch NarrativeScene
    const messageBtn = this.add.container(400, buttonY + 140).setSize(200, 50).setInteractive({ useHandCursor: true });
    const msgBg = this.add.rectangle(0, 0, 200, 50, 0x3b3f56).setStrokeStyle(2, 0xa9d1ff);
    const msgText = this.add.text(0, 0, 'Massage', { fontSize: '32px', color: '#a9d1ff' }).setOrigin(0.5);
    messageBtn.add([msgBg, msgText]);
    // Highlight message button until narrative viewed
    if (!messageRead) {
      this.tweens.add({
        targets: messageBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    messageBtn.on('pointerover', () => msgText.setStyle({ color: '#ffffff' }));
    messageBtn.on('pointerout', () => msgText.setStyle({ color: '#a9d1ff' }));
    messageBtn.on('pointerup', () => {
      this.sound.play('buttonClick', { volume: 1.0 });
      // Mark narrative as read and return to menu later
      localStorage.setItem('messageRead', 'true');
      this.scene.start('NarrativeScene');
    });
    
    // Initialize background music on main menu
    if (!window.backgroundMusic) {
      window.backgroundMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
      window.backgroundMusic.play({ mute: localStorage.getItem('musicMuted') === 'true' });
    } else if (!window.backgroundMusic.isPlaying && localStorage.getItem('musicMuted') !== 'true') {
      window.backgroundMusic.play();
    }
  }
}

class Settings extends Phaser.Scene {
  constructor() { super('Settings'); }
  create() {
    this.cameras.main.setBackgroundColor('#2d2f3a');
    this.add.text(400, 100, 'Settings', { fontFamily: 'Arial', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);
    const musicMuted = localStorage.getItem('musicMuted') === 'true';
    // sync sound manager and background music with stored setting
    this.game.sound.mute = musicMuted;
    if (window.backgroundMusic) window.backgroundMusic.setMute(musicMuted);
    const musicText = this.add.text(400, 200, `Music: ${musicMuted ? 'Off' : 'On'}`, { fontSize: '24px', color: '#ccc' }).setOrigin(0.5).setInteractive();
    musicText.on('pointerup', () => {
      const newMuted = !this.game.sound.mute;
      this.game.sound.mute = newMuted;
      localStorage.setItem('musicMuted', newMuted);
      if (window.backgroundMusic) window.backgroundMusic.setMute(newMuted);
      musicText.setText(`Music: ${newMuted ? 'Off' : 'On'}`);
    });
    this.add.text(400, 250, 'Controls: WASD, Mouse (placeholder)', { fontSize: '24px', color: '#ccc' }).setOrigin(0.5);
    // Back button container
    const backBtn = this.add.container(400, 500).setSize(120, 40).setInteractive();
    const btnBg = this.add.rectangle(0, 0, 120, 40, 0x4d5a73).setStrokeStyle(2, 0xa9d1ff);
    const btnText = this.add.text(0, 0, 'Back', { fontSize: '28px', color: '#a9d1ff' }).setOrigin(0.5);
    backBtn.add([btnBg, btnText]);
    backBtn.on('pointerover', () => btnText.setStyle({ color: '#ffffff' }));
    backBtn.on('pointerout', () => btnText.setStyle({ color: '#a9d1ff' }));
    backBtn.on('pointerup', () => this.scene.start('MainMenu'));
  }
}

class GameScene extends Phaser.Scene {
  init(data) {
    // load saved state if present
    this.loadedPowers = new Set(data.powers || ['common']);
    this.loadedHealth = data.health != null ? data.health : 100;
    this.loadedArmor = data.armor != null ? data.armor : 50;
    this.loadedCredits = data.credits != null ? data.credits : 0;
    this.commonFast = data.commonFast || false;
    this.currentPower = data.currentPower || Array.from(this.loadedPowers)[0] || 'common';
  }
  constructor() { super('GameScene'); }
  preload() {
    // load core assets
    this.load.image('grassBg', 'round1Images/Background.png');
    this.load.image('enemy', 'round1Images/enemie.jpg');
    // main character portrait for HUD
    this.load.image('playerPortrait', 'round1Images/Maincharacter.jpg');
    // load main character texture for player sprite
    this.load.image('playerSprite', 'round1Images/Maincharacter.jpg');
  }
  create() {
    // reset and display background image each time GameScene starts
    if (this.grassBg) { this.grassBg.destroy(); }
    this.grassBg = this.add.image(0, 0, 'grassBg')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-1);
    // game round tracking
    this.round = 1;
    // initial grace period before combat (10s) with countdown display
    this.ready = false;
    this.countdown = 10;
    this.countdownText = this.add.text(400, 50, `Combat starts in ${this.countdown}s`, { fontSize: '32px', color: '#ffff00' })
      .setOrigin(0.5)
      .setDepth(10);  // ensure countdown is visible above background graphics
    this.countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 10,
      callback: () => {
        this.countdown--;
        if (this.countdown > 0) {
          this.countdownText.setText(`Combat starts in ${this.countdown}s`);
        } else if (this.countdown === 0) {
          this.countdownText.setText('Go!'); 
          this.ready = true;
          
          // Add a small delay to ensure everything is fully initialized
          this.time.delayedCall(100, () => {
            // Start the global timer when combat begins
            if (window.gameTimer) {
              window.gameTimer.reset();
              window.gameTimer.start();
            }
            
            // Also start the HUD timer for backward compatibility
            if (this.hud && typeof this.hud.startTimer === 'function') {
              this.hud.startTimer();
            }
          });
        } else {
          this.countdownText.destroy();
        }
      }
    });
    // Set up environment graphics and initial biome
    this.graphics = this.add.graphics();
    // biome setup
    this.biomeColors = {
      grass: [0x7cfc00, 0x6b8e23],
      forest: [0x228B22, 0x2E8B57],
      swamp: [0x556B2F, 0x6B8E23],
      ruins: [0x808080, 0xA9A9A9]
    };
    this.availableBiomes = new Set(['grass']);
    this.currentBiome = 'grass';
    this.currentColors = this.biomeColors[this.currentBiome];
    this.availablePowers = this.loadedPowers;
    this.drawEnvironment(this.currentColors); // Ensure drawEnvironment does NOT draw any doors/portals
    // create player sprite using main character image
    this.player = this.physics.add.sprite(400, 300, 'playerSprite')
      .setDisplaySize(64, 64)
      .setCollideWorldBounds(true);
    // input keys
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.playerSpeed = 200;
    // initialize HUD with saved health, armor, credits
    this.hud = new HUD(this);
    this.hud.setHealth(this.loadedHealth);
    this.hud.setArmor(this.loadedArmor);
    this.hud.setCredit(this.loadedCredits);
    // power selection input
    this.input.keyboard.on('keydown-ONE', () => { this.player.power = 'common'; this.hud.setPower('common'); });
    this.input.keyboard.on('keydown-TWO', () => { if (this.availablePowers.has('blue')) { this.player.power = 'blue'; this.hud.setPower('blue'); } });
    this.input.keyboard.on('keydown-THREE', () => { if (this.availablePowers.has('gold')) { this.player.power = 'gold'; this.hud.setPower('gold'); } });
    // Dev: skip to Round 2 (F2)
    this.input.keyboard.on('keydown-F2', () => {
      this.scene.start('Round2Scene', {
        powers: Array.from(this.availablePowers),
        health: this.hud.health,
        armor: this.hud.armor,
        credits: this.hud.credit,
        commonFast: this.commonFast,
        currentPower: this.currentPower
      });
    });
    // Mobile touch controls for Round 1
    if (this.sys.game.device.input.touch && this.round === 1) {
      this.touchLeft = this.touchRight = this.touchUp = this.touchDown = false;
      const width = this.scale.width;
      const height = this.scale.height;
      const btnSize = 40;
      const centerX = btnSize + 20;
      const centerY = height - (btnSize + 20);
      const gap = btnSize + 10;
      // directional buttons
      const leftBtn = this.add.rectangle(centerX - gap, centerY, btnSize, btnSize, 0xffffff, 0.3).setScrollFactor(0).setInteractive();
      const rightBtn = this.add.rectangle(centerX + gap, centerY, btnSize, btnSize, 0xffffff, 0.3).setScrollFactor(0).setInteractive();
      const upBtn = this.add.rectangle(centerX, centerY - gap, btnSize, btnSize, 0xffffff, 0.3).setScrollFactor(0).setInteractive();
      const downBtn = this.add.rectangle(centerX, centerY + gap, btnSize, btnSize, 0xffffff, 0.3).setScrollFactor(0).setInteractive();
      [ {btn: leftBtn, flag: 'touchLeft'}, {btn: rightBtn, flag: 'touchRight'},
        {btn: upBtn, flag: 'touchUp'}, {btn: downBtn, flag: 'touchDown'} ]
      .forEach(({btn, flag}) => {
        btn.on('pointerdown', () => this[flag] = true);
        btn.on('pointerup',   () => this[flag] = false);
        btn.on('pointerout',  () => this[flag] = false);
      });
      // shoot button
      const shootBtn = this.add.circle(width - (btnSize + 20), height - (btnSize + 20), btnSize / 2, 0xff0000, 0.3)
        .setScrollFactor(0).setInteractive();
      shootBtn.on('pointerdown', pointer => this.handleShoot(pointer));
    }
    // initialize combat properties and weapon manager
    this.player.power = this.currentPower;
    this.weaponManager = new WeaponManager(this, this.commonFast);
    // spawn 5 enemies in grass (green) biome
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, this.scale.height - 50);
      const enemy = new Enemy(this, x, y);
      this.enemies.add(enemy);
    }
    // enlarge enemies and hitboxes for Round 1
    if (this.round === 1) {
      this.enemies.getChildren().forEach(enemy => {
        // scale to half original dimensions
        const newW = enemy.width * 0.5;
        const newH = enemy.height * 0.5;
        enemy.setDisplaySize(newW, newH);
        enemy.body.setSize(newW, newH);
      });
    }
    // bullets hit enemies
    this.physics.add.overlap(this.weaponManager.bullets, this.enemies, (bullet, enemy) => {
      let damage;
      const key = bullet.texture.key;
      if (key === 'bullet_common') {
        damage = Phaser.Math.RND.pick([20, 50]);
      } else {
        damage = Phaser.Math.Between(40, 60);
      }
      enemy.takeDamage(damage);
      // award credits on kill
      if (!enemy.active) {
        const credits = this.hud.credit + 10;
        this.hud.setCredit(credits);
        // if all enemies dead and have 50+, start next round
        if (this.enemies.countActive() === 0 && this.round === 1 && credits >= 50) {
          this.advanceRound();
        }
      }
      bullet.destroy();
    });
    // generate enemy bullet texture
    const eg = this.make.graphics({ add: false });
    eg.fillStyle(0x000000, 1).fillCircle(3, 3, 3).generateTexture('bullet_enemy', 6, 6);
    eg.destroy();
    // enemy bullets group
    this.enemyBullets = this.physics.add.group();
    // schedule enemy shooting after grace period
    this.time.delayedCall(10000, () => {
      this.enemies.getChildren().forEach(enemy => {
        const shootTimer = this.time.addEvent({
          delay: 433,
          loop: true,
          callback: () => {
            if (!this.isPlayerAlive || !enemy.active) { shootTimer.remove(); return; }
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const eb = this.enemyBullets.create(enemy.x, enemy.y, 'bullet_enemy');
            const speed = 150;
            eb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            this.time.delayedCall(2000, () => eb.destroy());
          }
        });
      });
    });
    // enemy bullets hit player
    this.physics.add.overlap(this.player, this.enemyBullets, (player, eb) => {
      eb.destroy();
      // armor absorbs damage first
      if (this.hud.armor > 0) {
        this.hud.setArmor(this.hud.armor - 20);
      } else {
        this.hud.setHealth(this.hud.health - 20);
      }
      // handle player death
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
    this.isPlayerAlive = true; // track alive state

    // advance to next round: forest biome with no enemies
    this.advanceRound = function() {
      this.round = 2;
      this.currentBiome = 'forest';
      this.changeBiome(this.biomeColors[this.currentBiome]);
      this.availableBiomes.add('forest');
      
      // Save timer state before advancing
      if (this.hud && typeof this.hud.stopTimer === 'function') {
        // Temporarily stop timer to save current time
        this.hud.stopTimer();
      }
      
      // save loadout to localStorage
      localStorage.setItem('round1Loadout', JSON.stringify({
        powers: Array.from(this.availablePowers),
        health: this.hud.health,
        armor: this.hud.armor,
        credits: this.hud.credit,
        commonFast: this.commonFast,
        currentPower: this.player.power
      }));
      
      this.scene.start('Round2Scene', {
        powers: Array.from(this.availablePowers),
        health: this.hud.health,
        armor: this.hud.armor,
        credits: this.hud.credit,
        commonFast: this.commonFast,
        currentPower: this.player.power
      });
    }
  }
  handleShoot(pointer) {
    if (!this.isPlayerAlive || !this.ready) return; // cannot shoot until ready
    const now = this.time.now;
    let speed, cooldown, count, textureKey;
    switch(this.player.power) {
      case 'blue':
        speed = 200; cooldown = 250; count = 1; textureKey = 'bullet_blue';
        break;
      case 'gold':
        speed = 200; cooldown = 3000; count = 3; textureKey = 'bullet_gold';
        break;
      case 'common':
        if (this.commonFast) { speed = 200; cooldown = 250; }
        else { speed = 100; cooldown = 500; }
        count = 1; textureKey = 'bullet_common';
        break;
      default:
        // fallback to common behavior
        if (this.commonFast) { speed = 200; cooldown = 250; }
        else { speed = 100; cooldown = 500; }
        count = 1; textureKey = 'bullet_common';
    }
    if (now < this.player.lastShot + cooldown) return;
    this.player.lastShot = now;
    const angle = Phaser.Math.Angle.Between(this.player.x,this.player.y, pointer.worldX, pointer.worldY);
    const angles = count===3 ? [angle-0.2, angle, angle+0.2] : [angle];
    angles.forEach(a => {
      const bx = this.weaponManager.bullets.create(this.player.x, this.player.y, textureKey).setDepth(1);
      bx.setVelocity(Math.cos(a)*speed, Math.sin(a)*speed);
      this.time.delayedCall(2000, () => bx.destroy());
    });
  }
  update() {
    this.player.body.setVelocity(0, 0);
    if (this.cursors.left.isDown || this.touchLeft)  this.player.body.setVelocityX(-this.playerSpeed);
    if (this.cursors.right.isDown|| this.touchRight) this.player.body.setVelocityX(this.playerSpeed);
    if (this.cursors.up.isDown   || this.touchUp)    this.player.body.setVelocityY(-this.playerSpeed);
    if (this.cursors.down.isDown || this.touchDown)  this.player.body.setVelocityY(this.playerSpeed);
    this.player.body.velocity.normalize().scale(this.playerSpeed);
  }
  // Redraw environment based on current biome colors
  drawEnvironment(colors) {
    // always draw ground image as background
    this.graphics.clear();
  }

  changeBiome(colors) {
    this.currentColors = colors;
    this.drawEnvironment(colors);
  }
}

// Removed local Round2Scene stub to use external round2.js definition

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  scene: [MainMenu, Settings, NarrativeScene, GameScene, Round2Scene, Round3Scene, EndingScene],
  physics: { default: 'arcade', arcade: { debug: false } }
};

window.onload = () => {
  new Phaser.Game(config);
};
