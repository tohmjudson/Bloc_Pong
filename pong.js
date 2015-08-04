var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement("canvas");
var width = 1024;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var player = new Player();
var computer = new Computer();
var ball = new Ball(512, 300); //Ball Start Position
var playerScore = 0;
var cpuScore = 0;
var keysDown = {};

var render = function () {
    context.fillStyle = '#353535';
    context.fillRect(0, 0, width, height);
    context.font = "bold 56px sans-serif";
    player.render();
    computer.render();
    ball.render();
    context.fillText(playerScore, 652, 100);
    context.fillText(cpuScore, 362, 100);
    context.fillRect(this.width/2, 0, 2, this.height);
};

var update = function () {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);

};

var step = function () {
    update();
    render();
    animate(step);
};

/*=============== Paddle ================ */
function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function () {
    context.fillStyle = "#FFFFFF";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if (this.y < 0) { // all the way to the top
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > 600) { // all the way to the bottom
        this.y = 600 - this.height;
        this.y_speed = 0;
    }
};


/*=============== CPU ================ */
function Computer() {
    this.paddle = new Paddle(24, 300, 10, 50);
}

Computer.prototype.render = function () {
    this.paddle.render();
    this.score = cpuScore;
};

Computer.prototype.update = function (ball) {

/* ======== Two Players using W/S and UP/DOWN
    for (var key in keysDown) {
            var value = Number(key);
            if (value == 87) { // W
                this.paddle.move(0, -4);
            } else if (value == 83) { // S
                this.paddle.move(0, 4);
            } else {
                this.paddle.move(0, 0);// stop at ends
            }
        }
*/

/*=============== Computer AI ================ */
    var y_pos = ball.y;

    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    if (diff < 0 && diff < -4) { // max speed up
        diff = -5;
    } else if (diff > 0 && diff > 4) { // max speed down
        diff = 5;
    }

   this.paddle.move(0, diff);
    if (this.paddle.x < 0) {
        this.paddle.x = 0;
    } else if (this.paddle.x + this.paddle.height > 600) {
        this.paddle.x = 600 - this.paddle.height;
    }
};

/*=============== Player ================ */

function Player() {
    this.paddle = new Paddle(1000, 300, 10, 50);
}

Player.prototype.render = function () {
    this.paddle.render();
    this.score = playerScore;
    //this.display1 = new Display(this.width/4, 25);
};

Player.prototype.update = function () {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 38) { // down arrow
            this.paddle.move(0, -4);
        } else if (value == 40) { // up arrow
            this.paddle.move(0, 4);
        } else {
            this.paddle.move(0, 0);// stop at ends
        }
    }
};

/*=============== Ball ================ */
function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 3;
    this.y_speed = 0;
}

Ball.prototype.render = function () {
    context.beginPath();
    context.arc(this.x, this.y, 5, 2 * Math.PI, false);
    context.fillStyle = "#FFFFFF";
    context.fill();
};

Ball.prototype.update = function (paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;


    if (this.x < 0) { // a player point was scored
        playerScore++;
        console.log("Player Score: " + playerScore);
        if (playerScore > 2){
            document.getElementById("gameover").innerHTML = "YOU WON! CLICK HERE TO PLAY AGAIN";
            document.getElementById("gameover").style.visibility = "visible";
            document.getElementById("gameover").style.cursor = "pointer";
            cpuScore = 0;
            playerScore = 0;

        }
    }

    if (this.x > 1024) { // a robot point was scored
        cpuScore++;
        console.log("CPU Score: " +cpuScore);
        if (cpuScore >= 2){
            document.getElementById("gameover").innerHTML = "YOU LOSE! CLICK HERE TO PLAY AGAIN";
            document.getElementById("gameover").style.visibility = "visible";
            document.getElementById("gameover").style.cursor = "pointer";
            cpuScore = 0;
            playerScore = 0;
        }
    }

    //WILL BOUNCE UP AND DOWN
    if (this.y - 5 < 0) {
        this.y = 5;
        this.y_speed = -this.y_speed;
        wallAudio();
    } else if (this.y + 5 > 600) {
        this.y = 595;
        this.y_speed = -this.y_speed;
        wallAudio();
    }

    //WILL RESET BALL ON SCORE
    if (this.x < 0 || this.x > 1024) { // a point was scored
        scoreAudio();
        this.x_speed = -3; //Ball Reset Direction
        this.y_speed = .5; //Ball Reset Direction
        this.x = 512; //Ball Reset Position
        this.y = 300; //Ball Reset Position
    }


    //PADDLE COLLISION
    if (top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y) {

            // hit the player's paddle
            this.x_speed = -3;
            this.y_speed += (paddle2.y_speed / 2);
            this.x += this.x_speed;
            player1Audio();

        } else if (top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x && top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y) {
            
            // hit the computer's paddle
            this.x_speed = 3;
            this.y_speed += (paddle2.y_speed / 2);
            this.x += this.x_speed;
            player2Audio();
        }
};

//Displays the score
function Score(x, y) {
    this.x = x;
    this.y = y + 24;
    this.value = 0;
};
 
Score.prototype.draw = function(p) {
    p.fillText(this.value, this.x, this.y);
};

/*=============== Make it so ================ */
window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

window.addEventListener("keydown", function (event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
});

/*=============== WEBAUDIO ================ */
//Detection of older versions of WebAudio API
function audioContextCheck(){
  if (typeof AudioContext !== "undefined") {
    return new AudioContext();
  }
  else if (typeof webkitAudioContext !== "undefined") {
    return new webkitAudioContext();
  }
  else if (typeof mozAudioContext !== "undefined") {
    return new mozAudioContext();
  }
  else {
    throw new Error('AudioContext not supported');
  }
}
    
var audioContext = new AudioContext();

function player1Audio(){

    var osc = audioContext.createOscillator();
    var gainOsc = audioContext.createGain();
    var playlength = 0.1;

    osc.type = "square";
    osc.frequency.value = 300;
    osc.detune.value = 0;
    gainOsc.gain.value = .1;
    osc.connect(gainOsc);
    gainOsc.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + playlength);
};

function player2Audio(){

    var osc = audioContext.createOscillator();
    var gainOsc = audioContext.createGain();
    var playlength = 0.1;

    osc.type = "square";
    osc.frequency.value = 450;
    osc.detune.value = 0;
    gainOsc.gain.value = .1;
    osc.connect(gainOsc);
    gainOsc.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + playlength);
};

function wallAudio(){

    var osc = audioContext.createOscillator();
    var gainOsc = audioContext.createGain();
    var playlength = 0.1;

    osc.type = "square";
    osc.frequency.value = 500;
    osc.detune.value = 0;
    gainOsc.gain.value = .1;
    osc.connect(gainOsc);
    gainOsc.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + playlength);
};

function scoreAudio(){

    var osc = audioContext.createOscillator();
    var gainOsc = audioContext.createGain();
    var playlength = 0.1;

    osc.type = "square";
    osc.frequency.value = 800;
    osc.detune.value = 0;
    gainOsc.gain.value = .1;
    osc.connect(gainOsc);
    gainOsc.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + playlength);
};