"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafEffect = void 0;
const colors = ['#D7A50F', '#704910', '#A22D16', '#BB8144'];
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
function floorRandom(min, max) {
    return (min || 0) + Math.random() * ((max || 1) - (min || 0));
}
function microtime() {
    return new Date().getTime() * 0.001;
}
class Leaf {
    origin;
    position;
    velocity;
    amplitude;
    dx;
    color;
    rotation;
    rotationSpeed;
    settled;
    settleTime;
    settleDuration;
    constructor(origin, velocity, amplitude, rotationSpeed) {
        this.origin = origin;
        this.position = new Vector2(origin.x, origin.y);
        this.velocity = velocity || new Vector2(0, 0);
        this.amplitude = amplitude;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotationSpeed = rotationSpeed;
        // randomize start values a bit
        this.dx = Math.random() * 100;
        this.rotation = Math.random() * Math.PI * 2; // Random initial rotation
        this.settled = false;
        this.settleTime = 0;
        this.settleDuration = floorRandom(4, 7);
    }
    update(timeDelta) {
        if (this.settled) {
            return;
        }
        this.position.y += this.velocity.y * timeDelta;
        // oscillate the x value between -amplitude and +amplitude
        this.dx += this.velocity.x * timeDelta;
        this.position.x = this.origin.x + this.amplitude * Math.sin(this.dx);
        // update rotation for flutter effect
        this.rotation += this.rotationSpeed * timeDelta;
    }
}
class LeafEffect {
    name = 'Leaves';
    description = 'Falling leaves effect';
    canvas;
    ctx;
    particles = [];
    running = false;
    startTime = 0;
    frameTime = 0;
    maxTimeDelta = 0.1;
    treeLine = 600; // y position of the tree line. Exactly half the height of the graphic
    scale = 1; // scale of the leaf graphic. Adjusted for pet size
    pAmount = 25; // Leafiness
    pSwing = [0.1, 1]; // min and max oscillation speed for x movement
    pSpeed = [10, 50]; // min and max y speed
    pAmplitude = [5, 100]; // min and max distance for x movement
    pRotationSpeed = [0.5, 3]; // min and max rotation speed for flutter effect
    floor = 0;
    enable() {
        this.running = true;
        this.startTime = this.frameTime = microtime();
        this.loop();
    }
    disable() {
        this.running = false;
    }
    init(foregroundCanvas, backgroundCanvas, scale, floor, 
    // eslint-disable-next-line no-unused-vars
    themeKind) {
        // use the container width and height
        this.canvas = foregroundCanvas;
        this.ctx = this.canvas.getContext('2d');
        this.floor = floor;
        switch (scale) {
            case "nano" /* PetSize.nano */:
                this.pAmount = 100;
                this.treeLine = 187 / 2;
                this.scale = 1 / 20;
                this.pSpeed = [2, 10];
                break;
            case "small" /* PetSize.small */:
                this.pAmount = 50;
                this.treeLine = 250 / 2;
                this.scale = 1 / 15;
                this.pSpeed = [5, 20];
                break;
            case "medium" /* PetSize.medium */:
                this.pAmount = 20;
                this.treeLine = 375 / 2;
                this.scale = 1 / 10;
                this.pSpeed = [10, 30];
                break;
            case "large" /* PetSize.large */:
                this.pAmount = 15;
                this.treeLine = 500 / 2;
                this.scale = 1 / 10;
                this.pSpeed = [20, 50];
                break;
        }
        this.initParticles();
    }
    loop() {
        if (this.running) {
            this.clear();
            this.update();
            this.draw();
            this.queue();
        }
        else {
            console.log('Leaf effect stopped');
        }
    }
    initParticles() {
        if (!this.canvas) {
            console.log('Canvas not initialized');
            return;
        }
        // clear the particles array
        this.particles.length = 0;
        for (var i = 0; i < this.pAmount; i++) {
            var origin = new Vector2(floorRandom(0, this.canvas.width), floorRandom(this.canvas.height - this.treeLine, this.canvas.height - this.floor));
            var velocity = new Vector2(floorRandom(this.pSwing[0], this.pSwing[1]), floorRandom(this.pSpeed[0], this.pSpeed[1]));
            var amplitude = floorRandom(this.pAmplitude[0], this.pAmplitude[1]);
            var rotationSpeed = floorRandom(this.pRotationSpeed[0], this.pRotationSpeed[1]);
            this.particles.push(new Leaf(origin, velocity, amplitude, rotationSpeed));
        }
    }
    update() {
        if (!this.canvas) {
            console.log('Canvas not initialized');
            return;
        }
        // calculate the time since the last frame
        // this can be large when window is minimized so also impose a limit
        var timeNow = microtime();
        var timeDelta = Math.min(timeNow - this.frameTime, this.maxTimeDelta);
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            particle.update(timeDelta);
            var leafCenterY = particle.position.y + 119.5 * this.scale;
            if (leafCenterY >= this.canvas.height - this.floor) {
                if (!particle.settled) {
                    particle.settled = true;
                    particle.settleTime = timeNow;
                    particle.position.y =
                        this.canvas.height - this.floor - 119.5 * this.scale;
                }
                else {
                    if (timeNow - particle.settleTime >=
                        particle.settleDuration) {
                        particle.position.y = particle.origin.y =
                            this.canvas.height - this.treeLine;
                        particle.position.x = particle.origin.x =
                            Math.random() * this.canvas.width;
                        particle.dx = Math.random() * 100;
                        particle.rotation = Math.random() * Math.PI * 2;
                        particle.settled = false;
                        particle.settleDuration = floorRandom(2, 5);
                    }
                }
            }
        }
        // save this time for the next frame
        this.frameTime = timeNow;
    }
    draw() {
        if (!this.ctx) {
            console.log('Canvas context not initialized');
            return;
        }
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            var x = particle.position.x;
            var y = particle.position.y;
            // Save the current transformation matrix
            this.ctx.save();
            // Move to the center of the leaf for rotation
            var centerX = x + (100 * this.scale) / 2;
            var centerY = y + (85 * this.scale + 169 * this.scale) / 2;
            this.ctx.translate(centerX, centerY);
            // Apply rotation for flutter effect
            this.ctx.rotate(particle.rotation);
            // Move back to original position (relative to rotation center)
            this.ctx.translate(-centerX, -centerY);
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.moveTo(100 * this.scale + x, 85 * this.scale + y);
            this.ctx.lineTo(0 + x, 107 * this.scale + y);
            this.ctx.lineTo(73 * this.scale + x, 112 * this.scale + y);
            this.ctx.lineTo(32 * this.scale + x, 138 * this.scale + y);
            this.ctx.lineTo(92 * this.scale + x, 123 * this.scale + y);
            this.ctx.lineTo(100 * this.scale + x, 169 * this.scale + y);
            this.ctx.lineTo(123 * this.scale + x, 123 * this.scale + y);
            this.ctx.lineTo(168 * this.scale + x, 133 * this.scale + y);
            this.ctx.lineTo(133 * this.scale + x, 112 * this.scale + y);
            this.ctx.lineTo(184 * this.scale + x, 110 * this.scale + y);
            this.ctx.lineTo(100 * this.scale + x, 85 * this.scale + y);
            this.ctx.lineTo(100 * this.scale + x, 70 * this.scale + y);
            this.ctx.fill();
            // Restore the transformation matrix
            this.ctx.restore();
        }
    }
    clear() {
        if (!this.ctx || !this.canvas) {
            console.log('Canvas or context not initialized');
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    queue() {
        window.requestAnimationFrame(() => this.loop());
    }
    handleResize() {
        return;
    }
}
exports.LeafEffect = LeafEffect;
//# sourceMappingURL=leaves.js.map