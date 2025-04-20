// gametimer.js - Global game timer system
class GameTimer {
  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.timerElement = null;
    this.updateInterval = null;
  }

  // Initialize the timer display
  init() {
    // Create timer display if it doesn't exist
    if (!this.timerElement) {
      // Create a container for the timer
      const timerContainer = document.createElement('div');
      timerContainer.id = 'timer-container';
      timerContainer.style.position = 'fixed';
      timerContainer.style.top = '10px';
      timerContainer.style.right = '10px';
      timerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      timerContainer.style.padding = '5px 10px';
      timerContainer.style.borderRadius = '5px';
      timerContainer.style.color = '#ffffff';
      timerContainer.style.fontFamily = 'monospace';
      timerContainer.style.fontSize = '20px';
      timerContainer.style.zIndex = '1000';
      
      // Create the timer text element
      this.timerElement = document.createElement('div');
      this.timerElement.id = 'game-timer';
      this.timerElement.textContent = 'Time: 00:00';
      
      // Add timer to container
      timerContainer.appendChild(this.timerElement);
      
      // Add container to document
      document.body.appendChild(timerContainer);
    }
    
    // Display best time if available
    this.displayBestTime();
  }
  
  // Start the timer
  start() {
    if (!this.isRunning) {
      this.startTime = Date.now() - this.elapsedTime;
      this.isRunning = true;
      
      // Update timer display every 100ms
      this.updateInterval = setInterval(() => {
        this.update();
      }, 100);
      
      console.log('Timer started');
    }
  }
  
  // Stop the timer
  stop() {
    if (this.isRunning) {
      clearInterval(this.updateInterval);
      this.isRunning = false;
      this.elapsedTime = Date.now() - this.startTime;
      
      // Save the time
      this.saveTime();
      console.log('Timer stopped at', this.formatTime(this.elapsedTime));
    }
  }
  
  // Reset the timer
  reset() {
    clearInterval(this.updateInterval);
    this.elapsedTime = 0;
    this.isRunning = false;
    this.updateDisplay();
    console.log('Timer reset');
  }
  
  // Update the timer
  update() {
    if (this.isRunning) {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateDisplay();
    }
  }
  
  // Update the timer display
  updateDisplay() {
    if (this.timerElement) {
      this.timerElement.textContent = 'Time: ' + this.formatTime(this.elapsedTime);
    }
  }
  
  // Format time as MM:SS
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Save the current time
  saveTime(gameCompleted = false) {
    const formattedTime = this.formatTime(this.elapsedTime);
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    
    // Save current run time
    localStorage.setItem('currentRunTime', formattedTime);
    localStorage.setItem('currentRunTimeSeconds', totalSeconds.toString());
    
    // Only record best time if the game was completed (boss defeated)
    if (gameCompleted) {
      // Mark that the player has defeated the boss at least once
      localStorage.setItem('gameCompleted', 'true');
      
      // Check if this is a new best time
      const bestTimeSeconds = parseInt(localStorage.getItem('bestRunTimeSeconds') || '999999');
      
      if (totalSeconds < bestTimeSeconds && totalSeconds > 0) {
        console.log('New best time:', formattedTime);
        localStorage.setItem('bestRunTime', formattedTime);
        localStorage.setItem('bestRunTimeSeconds', totalSeconds.toString());
        
        // Update best time display
        this.displayBestTime();
      }
    }
  }
  
  // Display the best time
  displayBestTime() {
    const bestTime = localStorage.getItem('bestRunTime') || 'None';
    
    // Create or update best time element
    let bestTimeElement = document.getElementById('best-time');
    
    if (!bestTimeElement) {
      bestTimeElement = document.createElement('div');
      bestTimeElement.id = 'best-time';
      bestTimeElement.style.marginTop = '5px';
      bestTimeElement.style.fontSize = '16px';
      bestTimeElement.style.color = '#ffff00';
      
      // Add to timer container
      const container = document.getElementById('timer-container');
      if (container) {
        container.appendChild(bestTimeElement);
      }
    }
    
    bestTimeElement.textContent = `Best: ${bestTime}`;
  }
}

// Create a global instance
window.gameTimer = new GameTimer();
