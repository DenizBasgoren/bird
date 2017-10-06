
// name, score, name, score, ...
let worldRecords = ['DenizBasgoren',1];

let http = require('http');
let fs = require('fs');

http.createServer( function(req,res) {
	switch (req.url) {

		case '/':
		res.writeHead(200, {'Content-Type': 'text/html'});		
		fs.readFile('./index.html', function(err,data) {
			if (err) throw err;
			res.end(data);
		});
		break;

		case "/style.css":
		res.writeHead(200, {'Content-Type': 'text/css'});
		fs.readFile("./style.css", (err,data) => {
			if (err) throw err;
			res.end(data);
		});
		break;

		case "/game.js":
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		fs.readFile("./game.js", (err,data) => {
			if (err) throw err;
			res.end(data);
		});
		break;

		//AJAX calls
		case '/all':
		console.log('/all');
		res.end(worldRecords.join(','));
		break;

		case '/new':
		let body = '';
		
		req.on('data', function (data) {
			body += data;
			if (body.length > 1e6)
				req.connection.destroy();
		});

		req.on('end', function () {
			body = body.split(',');
			console.log('new entry'+body);
			updateRecords(body);
			console.log(worldRecords);
			res.end();
			});
	}

}).listen(process.env.PORT || 3000);


function updateRecords(x) {
	x[1] = parseInt(x[1]);
	
	for (let i = 0; i<worldRecords.length; i+=2) {
		if (x[0] == worldRecords[i]) {
			if (x[1] <= worldRecords[i+1]) return;
			else worldRecords.splice(i,2);
		}
	}
	for (let i = 1; i<worldRecords.length; i+=2) {
		if (x[1] > worldRecords[i]) {
			for (let j = worldRecords.length-1; j>i-2; j--) {
				worldRecords[j+2] = worldRecords[j];
			}
			worldRecords[i-1] = x[0];
			worldRecords[i] = x[1];
			break;
		}
	}

	if (worldRecords.length > 20) worldRecords.length = 20;
	
	
}