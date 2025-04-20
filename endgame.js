class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
        this.textDisplayComplete = false;
    }
    

  
    create() {
        // Pause background music if playing
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
            window.backgroundMusic.pause();
        }
        // Stop any previous endgameLines audio, then play
        if (this.sound.get('endgameLines')) {
            this.sound.stopByKey('endgameLines');
        }
        try {
            this.sound.play('endgameLines', { loop: false, volume: 1.0 });
        } catch (e) {
            console.log('Error playing endgameLines audio:', e);
        }
        // Set dark background
        this.cameras.main.setBackgroundColor('#000000');
        
        // Add stars/particles to the background for a space-like effect
        this.createStarfield();
        
        // Container for the mission completion message
        const container = this.add.container(400, 300);
        
        // Create a semi-transparent panel background with glowing effect
        const panel = this.add.rectangle(0, 0, 700, 450, 0x111827, 0.85)
            .setStrokeStyle(4, 0x38bdf8)
            .setOrigin(0.5);
        container.add(panel);
        
        // Add decorative elements
        this.addDecorations(container);
        
        // Add mission header with animation
        const header = this.add.text(0, -170, 'MISSION ACCOMPLISHED', {
            fontFamily: 'monospace',
            fontSize: '38px',
            color: '#38bdf8',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5).setAlpha(0);
        container.add(header);
        
        // Fade in and pulse the header
        this.tweens.add({
            targets: header,
            alpha: 1,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: header,
                    scale: 1.05,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        
        // Mission text with improved formatting
        const missionText = [
            "Good work, soldier. You've exceeded our expectations.",
            "",
            "The control center has been destroyed - exactly as planned.",
            "",
            "With their command structure in disarray, now is our moment to strike.",
            "",
            "The real fight begins now, get set, we got more.",
            "",
            "Return to base for debriefing."
        ].join('\n');
        
        const textConfig = {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 600 },
            lineSpacing: 12,
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
        };
        
        // Use typewriter effect for more impact
        this.typewriterText(missionText, textConfig, container);
    }
    
    createStarfield() {
        // Create a simpler starfield with individual sprites instead of particle emitter
        // This is compatible with all Phaser 3 versions
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const scale = Phaser.Math.FloatBetween(0.1, 0.4);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.7);
            
            // Create a star using a small circle
            const star = this.add.circle(x, y, 2, 0xffffff, alpha);
            star.setScale(scale);
            
            // Add a simple twinkling animation
            this.tweens.add({
                targets: star,
                alpha: { from: alpha, to: 0.1 },
                duration: Phaser.Math.Between(1000, 3000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
    
    addDecorations(container) {
        // Top and bottom border decorations
        const topBorder = this.add.rectangle(0, -200, 700, 10, 0x38bdf8).setOrigin(0.5);
        const bottomBorder = this.add.rectangle(0, 200, 700, 10, 0x38bdf8).setOrigin(0.5);
        container.add([topBorder, bottomBorder]);
        
        // Add corner decorative elements
        const cornerSize = 25;
        const corners = [
            this.add.rectangle(-350 + cornerSize/2, -200 + cornerSize/2, cornerSize, cornerSize, 0x38bdf8),
            this.add.rectangle(350 - cornerSize/2, -200 + cornerSize/2, cornerSize, cornerSize, 0x38bdf8),
            this.add.rectangle(-350 + cornerSize/2, 200 - cornerSize/2, cornerSize, cornerSize, 0x38bdf8),
            this.add.rectangle(350 - cornerSize/2, 200 - cornerSize/2, cornerSize, cornerSize, 0x38bdf8)
        ];
        container.add(corners);
        
        // Add animated scanner line effect
        const scanLine = this.add.rectangle(0, -200, 650, 2, 0x38bdf8, 0.8).setOrigin(0.5);
        container.add(scanLine);
        
        this.tweens.add({
            targets: scanLine,
            y: 200,
            duration: 3000,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    typewriterText(text, style, container) {
        // Container for text elements
        const textContainer = this.add.container(0, -50);
        container.add(textContainer);
        
        // Create the text object with fixed width to prevent overflow
        const textObj = this.add.text(0, 0, '', {
            ...style,
            wordWrap: { width: 550 }, // Narrower width to ensure text fits
            lineSpacing: 8 // Reduced line spacing
        }).setOrigin(0.5, 0);
        textContainer.add(textObj);
        
        // Split text into array of characters
        const chars = text.split('');
        let currentText = '';
        let index = 0;
        
        // Typewriter effect timer
        const timer = this.time.addEvent({
            delay: 30,
            callback: () => {
                currentText += chars[index];
                textObj.setText(currentText);
                index++;
                
                if (index >= chars.length) {
                    timer.remove();
                    this.textDisplayComplete = true;
                    this.showButtons(container);
                }
            },
            callbackScope: this,
            repeat: chars.length - 1
        });
        
        // Allow skipping the typewriter effect with a click
        this.input.on('pointerdown', () => {
            if (!this.textDisplayComplete) {
                timer.remove();
                textObj.setText(text);
                this.textDisplayComplete = true;
                this.showButtons(container);
            }
        });
    }
    

    
    showButtons(container) {
        // Create button container for better organization
        const buttonContainer = this.add.container(0, 170);
        container.add(buttonContainer);
        
        // Initially hide buttons
        buttonContainer.setAlpha(0);
        
        // Main Menu button
        const menuBtn = this.createButton(-120, 0, 'MAIN MENU', () => {
            // Resume background music if it exists and is not muted
            if (window.backgroundMusic && localStorage.getItem('musicMuted') !== 'true') {
                window.backgroundMusic.resume();
            }
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('MainMenu');
            });
        });
        
        // Credits button
        const creditsBtn = this.createButton(120, 0, 'CREDITS', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                // If you have a credits scene, start it here
                // Otherwise, just go to main menu
                this.scene.start('MainMenu');
                // If you have a Credits scene:
                // this.scene.start('CreditsScene');
            });
        });
        
        buttonContainer.add([menuBtn, creditsBtn]);
        
        // Fade in buttons
        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 800,
            ease: 'Power2'
        });
        
        // Add a pulsing animation to the main menu button to draw attention
        this.tweens.add({
            targets: menuBtn,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createButton(x, y, text, callback) {
        // Create button container
        const button = this.add.container(x, y).setSize(200, 50).setInteractive({ useHandCursor: true });
        
        // Button background with gradient effect
        const bg = this.add.rectangle(0, 0, 200, 50, 0x38bdf8, 0.7)
            .setStrokeStyle(2, 0xffffff);
        
        // Button text
        const txt = this.add.text(0, 0, text, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        button.add([bg, txt]);
        
        // Add hover effects
        button.on('pointerover', () => {
            bg.setFillStyle(0x38bdf8, 1);
            txt.setStyle({ color: '#000000' });
        });
        
        button.on('pointerout', () => {
            bg.setFillStyle(0x38bdf8, 0.7);
            txt.setStyle({ 
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
        });
        
        // Add click event with sound
        button.on('pointerup', callback);
        
        return button;
    }
}

// Expose EndingScene globally for Phaser config
window.EndingScene = EndingScene;