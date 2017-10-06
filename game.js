// WHAT ARE YOU DOING HERE >:-V

(function() {

let canvas, ctx, table;
let bird, score=0, highscore=0, pipe;






//setup
document.getElementById('start').onclick = function() {
	if (!document.getElementById('yourname').value) return;

	document.getElementById('yourname').style.display = "none";
	this.style.display = "none";
	document.getElementById('canvas').style.display = "block";
	document.getElementById('info').style.display = "inline";
	table = document.getElementById('worldrecords');
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	bird = new Bird();
	pipe = new Pipe( rndm(50,250,true), rndm(200,400,true) );
	getRecords();
}






//constructors
function Bird ( ) {
	this.x = 200;
	this.y = 250;
	this.dy = 1; // speed
	this.dx = 0;
}

function Pipe ( holeY, holeLength ) {
	this.x = 1000;
	this.width = 100;
	this.holeY = holeY;
	this.holeLength = holeLength;
	this.hit = false;
}






//main functions
function update ( ) {

	bird.y += bird.dy;
	bird.x += bird.dx;

	bird.dy += 0.2;

	if (bird.dx < -0.01) {
		bird.dx += 0.2;
	}
	if (bird.dx > 0.01) {
		bird.dx -= 0.2;
	}
	if (bird.y > 450) {
		bird.y = 450;
		bird.dy = 1;
	}
	else if (bird.y<50) {
		bird.y=50;
		bird.dy = 1;
	}
	if (bird.x<50) {
		bird.x=50;
	}
	else if (bird.x>950) {
		bird.x=950;
	}

	score+=0.3;
	if (score > highscore) highscore = score;
	
	pipe.x -= 10 + Math.floor( score/10 );
	
	if (pipe.x < -150) {
		let holeY = rndm(30,300,true);
		let holeLength = rndm(200, 500-holeY, true )
		pipe = new Pipe( holeY, holeLength);
	}

	if (
		collides(bird.x-50, bird.y-50, 100,100, pipe.x, 0, pipe.width, pipe.holeY) ||
		collides(bird.x-50, bird.y-50, 100,100, pipe.x, pipe.holeY+pipe.holeLength, pipe.width, 500-pipe.holeY-pipe.holeLength)
	) {
		pipe.hit = true;
		let name = document.getElementById('yourname');
		if (name.value && score>30) {
			newRecord(name.value, Math.floor(score));
			getRecords();
		}
		score = 0;
	}
	
}

function draw () {

	//bird
	ctx.fillStyle = "#dddd00";
	ctx.beginPath();
    ctx.arc(bird.x, bird.y, 50, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(bird.x+35, bird.y);
    ctx.arc(bird.x, bird.y, 35, 0, Math.PI, false);  // Mouth (clockwise)
    ctx.moveTo(bird.x-10, bird.y-10);
    ctx.arc(bird.x-15, bird.y-10, 5, 0, Math.PI*2, false);  // Left eye
    ctx.moveTo(bird.x+20, bird.y-10);
    ctx.arc(bird.x+15, bird.y-10, 5, 0, Math.PI*2, false);  // Right eye
	ctx.fill();
	ctx.font = "10px Arial";		
	ctx.fillStyle = "#aaaa00";
	ctx.fillText("BIRD", bird.x-12, bird.y-30);
	
	//pipes
	if (pipe.hit) ctx.fillStyle = "#ff0000";
	else ctx.fillStyle = "#00ff00";
	
	ctx.fillRect(pipe.x, 0, pipe.width, pipe.holeY) ;
	ctx.fillRect(pipe.x, pipe.holeY+pipe.holeLength, pipe.width, 500);

	//score
	ctx.font = "30px Arial";	
	ctx.fillStyle = "black";
	ctx.fillText(`Your score: ${parseInt(score)}. Highscore: ${parseInt(highscore)}`, 550, 30);

}

function clean ( ) {
	ctx.fillStyle = "aquamarine";
	ctx.fillRect(0,0,1000,500);
}






//input handlers
onkeypress = function ( x ) {
	if (x.keyCode == 119) { // w
		bird.dy -= 10;		
	}
	else if (x.keyCode == 115) { // s
		bird.dy = 10;
	}
	else if (x.keyCode == 100) { // d
		bird.dx = 10;		
	}
	else if (x.keyCode == 97) { // a
		bird.dx = -10;		
	}
}






//game loop
setInterval( function() {
	clean();	
	update();
	draw();
} ,30);

setInterval( getRecords, 30000);







//helper functions
function rndm(from,to, int) {
	let num = Math.random() * (to-from) + from;
	if (int) return Math.floor(num);
	else return num;
}

function distance (x1, y1, x2, y2) {
	return Math.sqrt( (x2-x1)**2 + (y2-y1)**2);
}

function between ( what, a, b ) {
	return what>a && what<b;
}

function collides (x1, y1, w1, h1, x2, y2, w2, h2) {
	return (x1 < x2 + w2 &&
		x1 + w1 > x2 &&
		y1 < y2 + h2 &&
		h1 + y1 > y2)
}





// AJAX
function ajaxreq(url, verb, body, isJSON, callback) {
	let ajax = new XMLHttpRequest();
	ajax.open(verb, url, true);
	ajax.send(body);

	ajax.onreadystatechange = () => {
		if (ajax.readyState==4 && ajax.status==200) {
			if (isJSON) callback( JSON.parse(ajax.responseText) );
			else callback(ajax.responseText);
		}
	}
}

function getRecords () {
	ajaxreq('all', 'GET', null, false, (data) => {
		let string = '<table><tr><td>World Records:</td></tr>';
		data = data.split(',');
		for(let i = 0; i<data.length; i+=2) {
			string += `<tr><td>${data[i]}</td><td>${data[i+1]}</td></tr>`;
		}
		string += '</table>';
		table.innerHTML = string;
	});
}

function newRecord (name, score) {
	let body = `${name},${score}`;
	ajaxreq('new', 'POST', body, false, (data) => {});
}





//html

document.getElementById('yourname').oninput = function () {
	let final = '';
	for (let i = 0; i<this.value.length; i++) {
		if (
		between( this.value.charCodeAt(i), 64, 91) ||
		between( this.value.charCodeAt(i), 96, 123)
		) {
			final += this.value[i];
		}
	}
	this.value = final.substr(0,15);
}



})();