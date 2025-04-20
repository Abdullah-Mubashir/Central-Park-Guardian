// enemy.js - Enemy class with health and armor
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');
    // scale enemy image to 32×32
    this.setScale(32 / this.width, 32 / this.height);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setImmovable(true);
    this.health = 100;
    this.armor = 100;
  }
  takeDamage(damage) {
    let remaining = damage;
    if (this.armor > 0) {
      const armorHit = Math.min(this.armor, remaining);
      this.armor -= armorHit;
      remaining -= armorHit;
    }
    if (remaining > 0) {
      this.health -= remaining;
    }
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
// expose globally
window.Enemy = Enemy;
