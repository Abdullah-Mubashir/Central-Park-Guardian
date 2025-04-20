// hud.js - Heads-Up Display for health, armor, and timer
class HUD {
  constructor(scene) {
    this.scene = scene;
    this.health = 100;
    this.armor = 50;
    this.power = 'common';
    this.credit = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerRunning = false;
    // Position texts top-left
    this.healthText = scene.add.text(
      10, 10,
      `HP: ${this.health}`,
      { fontSize: '20px', color: '#ff4444' }
    );
    this.armorText = scene.add.text(
      10, 40,
      `AR: ${this.armor}`,
      { fontSize: '20px', color: '#44ffff' }
    );
    // Power display and instructions
    this.powerText = scene.add.text(
      10, 70,
      `Power: ${this.power}`,
      { fontSize: '20px', color: '#ffffff' }
    );
    this.instructionText = scene.add.text(
      10, 100,
      '1:Common  2:Blue  3:Gold',
      { fontSize: '18px', color: '#aaaaaa' }
    );
    // Inventory display
    this.inventoryText = scene.add.text(
      10, 130,
      `Inventory: ${this.power}`,
      { fontSize: '18px', color: '#ffffff' }
    );
    // credits display
    this.creditText = scene.add.text(
      10, 160,
      `Credits: ${this.credit}`,
      { fontSize: '20px', color: '#ffff00' }
    );
    

  }
  setHealth(value) {
    this.health = Phaser.Math.Clamp(value, 0, 100);
    this.healthText.setText(`HP: ${this.health}`);
  }
  setArmor(value) {
    this.armor = Phaser.Math.Clamp(value, 0, 100);
    this.armorText.setText(`AR: ${this.armor}`);
  }
  setPower(value) {
    this.power = value;
    // update color based on power
    let color = '#ffffff';
    if (value === 'blue') color = '#0000ff';
    if (value === 'gold') color = '#ffd700';
    this.powerText.setStyle({ color });
    this.powerText.setText(`Power: ${this.power}`);
  }
  setCredit(value) {
    this.credit = value;
    this.creditText.setText(`Credits: ${this.credit}`);
  }
  // Update inventory list
  setInventory(powers) {
    this.inventoryText.setText(`Inventory: ${powers.join(', ')}`);
  }
  
  // Timer methods
  startTimer() {
    this.startTime = this.scene.time.now;
    this.timerRunning = true;
    
    // Create an update event to refresh the timer display
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    
    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,  // Update every second
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }
  
  stopTimer() {
    if (this.timerRunning) {
      this.timerRunning = false;
      this.elapsedTime = this.scene.time.now - this.startTime;
      
      if (this.timerEvent) {
        this.timerEvent.remove();
      }
      
      // Save the time to localStorage
      this.saveTime();
    }
  }
  
  resetTimer() {
    this.elapsedTime = 0;
    this.updateTimerDisplay();
  }
  
  updateTimer() {
    if (this.timerRunning) {
      this.elapsedTime = this.scene.time.now - this.startTime;
      this.updateTimerDisplay();
    }
  }
  
  updateTimerDisplay() {
    // Convert milliseconds to minutes and seconds
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
  }
  
  saveTime() {
    // Save the current time to localStorage
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Save current run time
    localStorage.setItem('currentRunTime', formattedTime);
    localStorage.setItem('currentRunTimeSeconds', totalSeconds.toString());
    localStorage.setItem('timePlayed', formattedTime);
    
    // Check if this is a new best time
    const bestTimeSeconds = parseInt(localStorage.getItem('bestRunTimeSeconds') || '999999');
    
    if (totalSeconds < bestTimeSeconds && totalSeconds > 0) {
      console.log('New best time:', formattedTime);
      localStorage.setItem('bestRunTime', formattedTime);
      localStorage.setItem('bestRunTimeSeconds', totalSeconds.toString());
    }
  }
}
