/*jshint esversion: 6*/

/*
  Author: Joel Rudsberg

  Project Description:
  HTML5 canvas show. Particle simulation.
  User will be able to do the following:
  - Set number of particles
  - Set colors of particles
  - Apply gravity (and change the acceleration)
*/

// ==================================================================== //

// Set canvas to full width of screen
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the context
const c = canvas.getContext('2d');

// Disregard namespace in this project => only 1 script file used
let particleArray;
let numParticles;
let gravityConstant = 0.2;
let friction = 0.45;
let userControlledEngaged = false;
let userParticle = undefined;
let leftKeyCounter = 0;
let rightKeyCounter = 0;
let upKeyCounter = 0;
let downKeyCounter = 0;
let colors = [
  '#E94858',
  '#F3A32A',
  '#82BF6E',
  '#3CB4CB',
  '#16434B'
];
let mouse = {
  x: undefined,
  y: undefined
};

// If mobile device use less particles
let screenWidthUser = window.innerWidth;
if (screenWidthUser < 500) {
  numParticles = 50;
} else if (screenWidthUser < 900) {
  numParticles = 70;
} else {
  numParticles = 175;
}

// Listen for window resize and respawn particles
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

// Listen for mouse position on screen
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Listen for click to destroy particles within radius
window.addEventListener('click', e => {
  let xCoor = e.x;
  let yCoor = e.y;

  // Delete particles within radius of click from canvas
  for (let i = 0; i < particleArray.length; i++) {
    let xParticle = particleArray[i].x;
    let yParticle = particleArray[i].y;

    if (distance(xCoor, yCoor, xParticle, yParticle) < 50) {
      particleArray.splice(i, 1);
    }
  }
});

// Listen for key pressed to bring up options
window.addEventListener('keydown', e => {
  console.log(e);
  if (e.code === 'Enter' || e.code === 'Space') {
    // Pause all particles
    for (let i = 0; i < particleArray.length; i++) {
      particleArray[i].pause = true;
    }

    // Display pop up Modal
    $("#myModal").modal();

    // Show current amount of particles in Modal
    document.getElementById('number-particles').value = numParticles;
  }

  // Let user control a particle
  if ((e.code === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'ArrowUp') && !userControlledEngaged) {
    // Pick a particle and change it's color
    userParticle = particleArray[getRandomInt(0, particleArray.length)];
    userParticle.userControlled = true;
    userControlledEngaged = true;

    // Reset its velocity and gravity
    userParticle.dx = 0;
    userParticle.dy = 0;
    userParticle.gravity = false;
  } else if (e.code === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'ArrowUp') {
    // Let user controll particle with arrows
    // TODO: FIX MOVEMENT, WHY STOPPING? MOVING SIDEWAYS?
    let direction = e.code;
    switch (direction) {
      case 'ArrowRight':
      userParticle.x += 2;
        break;

      case 'ArrowLeft':
      userParticle.x -= 2;
        break;

      case 'ArrowUp':
      userParticle.y -= 2;
        break;

      case 'ArrowDown':
      userParticle += 2;
        break;

    }
  }
});

document.getElementById('submitBtn').addEventListener('click', () => {
  $('#myModal').modal('hide');

  // Change number of particles
  numParticles = document.getElementById('number-particles').value;
  if (numParticles) {
    init();
  }

  // Apply gravity if it was checked
  let input = document.getElementById('gravitySelect').value.toUpperCase();
  if (input === 'YES') {
    for (let i = 0; i < particleArray.length; i++) {
      particleArray[i].gravity = true;
    }
  } else {
    if (particleArray[0].gravity) {
      for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].gravity = false;
      }
    }
  }

  // Apply color if it was changed
  /*
  Color Schemes:
  - Default: #E94858, #F3A32A, #82BF6E, #3CB4CB, #16434B
  - Organ: #2B3D54, #2C5B61, #247065, #60A65F, #FFEC97
  - Retro: #17A598, #F3A346, #EF551F, #D5D8C8, #DB381B
  - Amino: #1A2739, #2B4666, #88B5D6, #B8DBF2, #C6EEF6
  */
  let color = document.getElementById('colorSelect').value.toUpperCase();
  if (color) {
    switch (color) {
      case 'DEFAULT':
        colors = ['#E94858', '#F3A32A', '#82BF6E', '#3CB4CB', '#16434B'];
        updateColor();
        break;

      case 'ORGAN':
        colors = ['#2B3D54', '#2C5B61', '#247065', '#60A65F', '#FFEC97'];
        updateColor();
        break;
      case 'RETRO':
        colors = ['#17A598', '#F3A346', '#EF551F', '#D5D8C8', '#DB381B'];
        updateColor();
        break;
      case 'AMINO':
        colors = ['#1A2739', '#2B4666', '#88B5D6', '#B8DBF2', '#C6EEF6'];
        updateColor();
        break;
    }

    document.getElementById('colorSelect').value = '';
  }

  function updateColor() {
    for (let i = 0; i < particleArray.length; i++) {
      particleArray[i].color = getRandomColor();
    }
  }

  // Resume simulation
  for (let i = 0; i < particleArray.length; i++) {
    particleArray[i].pause = false;
  }
});

document.getElementById('closeBtn').addEventListener('click', () => {
  // Resume simulation
  for (let i = 0; i < particleArray.length; i++) {
    particleArray[i].pause = false;
  }
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  // Resume simulation
  for (let i = 0; i < particleArray.length; i++) {
    particleArray[i].pause = false;
  }
});

// Animate loop function
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Continiously call update function of each particle
  for (let i = 0; i < particleArray.length; i++) {
    particleArray[i].update();
  }
}

// Initilizing function
function init() {
  particleArray = [];
  for (let i = 0; i < numParticles; i++) {
    let radius = getRandomInt(10, 15);
    let x = getRandomInt(radius, canvas.width - radius);
    let y = getRandomInt(radius, canvas.height - radius);
    let dx = Math.random() * -1;
    let dy = Math.random() * -1;
    let color = getRandomColor();
    let pause = false;
    let gravity = false;
    let userControlled = false;

    // Make sure they don't spawn on top of each other
    if (i !== 0) {
      for (let j = 0; j < particleArray.length; j++) {
        if (distance(x, y, particleArray[j].x, particleArray[j].y) < radius + particleArray[j].radius) {
          x = getRandomInt(radius, canvas.width - radius);
          y = getRandomInt(radius, canvas.height - radius);

          // Restart loop after generating new values
          j = -1;
        }
      }
    }

    particleArray.push(new Particle(x, y, dx, dy, radius, color, pause, gravity, userControlled));
  }
}

// Particle object
function Particle(x, y, dx, dy, radius, color, pause, gravity, userControlled) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: dx,
    y: dy
  };
  this.radius = radius;
  this.color = color;
  this.pause = pause;
  this.gravity = gravity;
  this.mass = 1;
  this.opacity = 0;
  this.userControlled = userControlled;

  // TODO: ADD SOME USER Interactivity

  // Manipulates particle values and adds the logic to its movements
  this.update = () => {
    if (!this.pause) {


      // Bounce Particle on sides
      if (this.x + this.radius + this.velocity.x >= canvas.width || this.x <= this.radius) {
        this.velocity.x = -this.velocity.x;
      }
      if (this.y + this.radius + this.velocity.y >= canvas.height || this.y <= this.radius) {
        this.velocity.y = -this.velocity.y;
      }

      // Apply collision detection
      for (let i = 0; i < particleArray.length; i++) {
        // Don't compare itself to itself
        if (this === particleArray[i]) continue;

        if (distance(this.x, this.y, particleArray[i].x, particleArray[i].y) < this.radius + particleArray[i].radius) {
          resolveCollision(this, particleArray[i]);
        }
      }

      // Mouse Interactivity
      if (distance(this.x, this.y, mouse.x, mouse.y) < 100 && this.opacity < 0.2) {
        this.opacity += 0.02;
      } else if (this.opacity > 0) {
        this.opacity -= 0.02;
        // Prevent opacity to below 0
        this.opacity = Math.max(0, this.opacity);
      }

      if (this.gravity) {
        if (this.y + this.radius + this.velocity.y > canvas.height) {
          this.velocity.y = -this.velocity.y * friction;
        } else {
          this.velocity.y += gravityConstant;
        }
      }

      if (this.userControlled) {

      } else {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      }
    }

    this.draw();
  };

  // Draws the particle on the canvas
  this.draw = () => {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.save();
    // Opacity for only particles bcz it's contained within save()
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    if (this.userControlled) {
      c.fillStyle = 'red';
      c.fill();
      c.strokeStyle = 'red';
      c.stroke();
    } else {
      c.strokeStyle = this.color;
      c.stroke();
    }
  };
}

// Utility functions
function getRandomInt(lowerLimit, upperLimit) {
  return Math.floor(Math.random() * (upperLimit - lowerLimit + 1) + lowerLimit);
}

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function distance(x1, y1, x2, y2) {
  let xDist = x2 - x1;
  let yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

// Source of rotate and resolveCollision function: https://gist.github.com/christopher4lis/f9ccb589ee8ecf751481f05a8e59b1dc
function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

    // Grab angle between the two colliding particles
    const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
      y: u1.y
    };
    const v2 = {
      x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
      y: u2.y
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}


// Run it
init();
animate();
