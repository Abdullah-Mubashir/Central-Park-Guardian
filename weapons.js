// weapons.js - centralized weapon shooting logic
class WeaponManager {
  constructor(scene, commonFast) {
    this.scene = scene;
    this.commonFast = commonFast;
    this.setupTextures();
    this.bullets = scene.physics.add.group();
    this.lastShot = 0;
    scene.input.on('pointerdown', pointer => this.shoot(pointer));
  }
  setupTextures() {
    const gfx = this.scene.make.graphics({ add: false });
    gfx.fillStyle(0xcccccc,1).fillCircle(4,4,4).generateTexture('bullet_common',8,8);
    gfx.clear().fillStyle(0x0000ff,1).fillCircle(4,4,4).generateTexture('bullet_blue',8,8);
    gfx.clear().fillStyle(0xffd700,1).fillCircle(4,4,4).generateTexture('bullet_gold',8,8);
    // power pickup textures
    gfx.clear().fillStyle(0xcccccc,1).fillCircle(8,8,8).generateTexture('power_common',16,16);
    gfx.clear().fillStyle(0x0000ff,1).fillCircle(8,8,8).generateTexture('power_blue',16,16);
    gfx.clear().fillStyle(0xffd700,1).fillCircle(8,8,8).generateTexture('power_gold',16,16);
    gfx.destroy();
  }
  shoot(pointer) {
    // Block shooting until countdown ends (only relevant in Round3)
    if (this.scene.ready === false) return;
    const now = this.scene.time.now;
    const power = this.scene.player.power;
    let speed, cooldown, count, textureKey;
    switch(power) {
      case 'blue': speed = 400; cooldown = 300; count = 1; textureKey = 'bullet_blue'; break;
      case 'gold': speed = 300; cooldown = 1000; count = 3; textureKey = 'bullet_gold'; break;
      default:
        speed = this.commonFast ? 300 : 200;
        cooldown = this.commonFast ? 250 : 500;
        count = 1; textureKey = 'bullet_common';
    }
    if (now < this.lastShot + cooldown) return;
    this.lastShot = now;
    // Play gun sound on every shot

    const angle = Phaser.Math.Angle.Between(this.scene.player.x, this.scene.player.y, pointer.worldX, pointer.worldY);
    const angles = (count === 3) ? [angle - 0.1, angle, angle + 0.1] : [angle];
    angles.forEach(a => {
      const b = this.bullets.create(this.scene.player.x, this.scene.player.y, textureKey);
      // assign damage matching Round2: common [20,50], others [40,60]
      if (textureKey === 'bullet_common') b.damage = Phaser.Math.RND.pick([20, 50]);
      else b.damage = Phaser.Math.Between(40, 60);
      b.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
      // Blue bullets lifespan reduced by 16%; others unchanged
      const lifespan = (textureKey === 'bullet_blue') ? Math.round(1400 * 0.84) : 1400;
      this.scene.time.delayedCall(lifespan, () => b.destroy());
    });
  }
}
window.WeaponManager = WeaponManager;
