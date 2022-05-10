const game = require('./game.js')

var clients = []

exports.got_connection = function (ws){
	console.log('Client connected');

	//add this client to the list regardless of if there is room
	clients.push (ws)

	//find an open frog
	let new_frog = game.join_player(ws);

	//send that connected confirmation if there was room
	if (new_frog != null){
		console.log("  found a frog for this player")
		ws.send( JSON.stringify({
			type : "connect_confirm",
			frog_id : new_frog.id
		}))
	}
	//tell them pond was full if there was no available frog
	else{
		console.log("NO SPACE FOR THIS PLAYER")
		ws.send( JSON.stringify({
			type : "pond_full"
		}))
	}

	//recieving info
	ws.on('message', function incoming(msg_raw){
		let msg = JSON.parse(msg_raw)

		//input change: 1=held  0=released
		if (msg.type === 'input_change'){
			let frog = game.get_frog_from_ws(ws);
			if (frog == null){
				console.log("FROG NOT FOUND")
				return;
			}
			frog.button_down = msg.val > 0;
		}
	})

	//disconnecting
	ws.on('close', () => {
		console.log('Client disconnected')
		//kill em
		game.remove_player(ws)
		//remove them from client list
		for (let i=0; i<clients.length; i++){
		  if (clients[i] == ws){
		    console.log("found and killed client")
		    clients.splice(i, 1)
		  }
		}
	});

}

//sends the current frog value to all clients
exports.send_gamestate_to_clients = function(frogs){
	for (let i=0; i<clients.length; i++){
		let json = {
			type : "gamestate",
			frog_vals : []
		}
		for (let f=0; f<frogs.length; f++){
			json.frog_vals.push({
				active: frogs[f].active,
				val : frogs[f].val
			})
		}
		clients[i].send(JSON.stringify(json))
	}
}