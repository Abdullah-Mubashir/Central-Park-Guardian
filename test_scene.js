// test_scene.js - A simple test scene to verify scene transitions
class TestScene extends Phaser.Scene {
  constructor() {
    super('TestScene');
  }

  create() {
    // Simple background
    this.cameras.main.setBackgroundColor('#333333');
    
    // Add some text
    const text = this.add.text(400, 200, 'TEST SCENE WORKS!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Add a button to go back to main menu
    const button = this.add.rectangle(400, 300, 200, 50, 0x4444ff)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
    
    const buttonText = this.add.text(400, 300, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    button.on('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }
}

// Expose globally
window.TestScene = TestScene;
