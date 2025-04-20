// Add this new NarrativeScene class before the MainMenu class

class NarrativeScene extends Phaser.Scene {
    preload() {
        console.log('Pregame preload running');
        this.load.audio('pregameLine', 'round1Images/pregameline.mp3');
    }
    constructor() {
      super('NarrativeScene');
    }
  
    create() {
        // Pause background music if playing
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
          window.backgroundMusic.pause();
        }
        // Play pregame line audio once
        this.sound.play('pregameLine', { loop: false, volume: 1.0 });
      // Set dark background
      this.cameras.main.setBackgroundColor('#000000');
      
      // Container for the mission briefing
      const container = this.add.container(400, 300);
      
      // Create a semi-transparent panel background
      const panel = this.add.rectangle(0, 0, 700, 400, 0x111827, 0.8)
        .setStrokeStyle(4, 0x38bdf8)
        .setOrigin(0.5);
      container.add(panel);
      
      // Add top border decoration
      const topBorder = this.add.rectangle(0, -180, 700, 10, 0x38bdf8)
        .setOrigin(0.5);
      container.add(topBorder);
      
      // Add mission header
      const header = this.add.text(0, -140, 'MISSION BRIEFING', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(header);
      
      // Mission text with typewriter effect
      const missionText = "You are assigned to a special mission.\n\nYour goal is to get to the ship and destroy the commander.\n\nIt's most dangerous mission yet.\n\nGet out there and do what you do best.";
      
      const textConfig = {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 600 },
        lineSpacing: 12
      };
      
      const text = this.add.text(0, -30, '', textConfig).setOrigin(0.5, 0);
      container.add(text);
      
      // Add a blinking cursor effect
      const cursor = this.add.text(text.x + 10, text.y, '_', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0, 0);
      container.add(cursor);
      
      // Cursor blinking animation
      this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          cursor.setVisible(!cursor.visible);
        }
      });
      
      // Typewriter effect
      let index = 0;
      const typewriterTimer = this.time.addEvent({
        delay: 50,
        repeat: missionText.length - 1,
        callback: () => {
          text.setText(text.text + missionText[index]);
          cursor.setPosition(text.x + text.width / 2 + 10, text.y + text.height);
          index++;
          
          // When done typing, show the start button
          if (index === missionText.length) {
            this.time.delayedCall(1000, () => {
              this.showStartButton(container);
            });
          }
        }
      });
    }
    
    showStartButton(container) {
      // Create start button after text is complete
      const startBtn = this.add.container(0, 150).setSize(200, 50).setInteractive({ useHandCursor: true });
      const startBg = this.add.rectangle(0, 0, 200, 50, 0x38bdf8, 0.7)
        .setStrokeStyle(2, 0xffffff);
      const startText = this.add.text(0, 0, 'BEGIN MISSION', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      startBtn.add([startBg, startText]);
      container.add(startBtn);
      
      // Add hover effects
      startBtn.on('pointerover', () => {
        startBg.setFillStyle(0x38bdf8, 1);
        startText.setStyle({ color: '#000000' });
      });
      
      startBtn.on('pointerout', () => {
        startBg.setFillStyle(0x38bdf8, 0.7);
        startText.setStyle({ color: '#ffffff' });
      });
      
      // Add pulsing animation to draw attention
      this.tweens.add({
        targets: startBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // When clicked, proceed to MainMenu
      startBtn.on('pointerup', () => {
        // Resume background music if it exists and is not muted
        if (window.backgroundMusic && localStorage.getItem('musicMuted') !== 'true') {
          window.backgroundMusic.resume();
        }
        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
          this.scene.start('MainMenu');
        });
      });
    }
  }
  
// Expose NarrativeScene globally for Phaser config
window.NarrativeScene = NarrativeScene;