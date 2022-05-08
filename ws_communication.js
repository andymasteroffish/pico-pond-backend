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
	//TODO: tell them pond was full if there was no available frog
	else{
		console.log("NO SPACE FOR THIS PLAYER")
		ws.send( JSON.stringify({
			type : "pond_full"
		}))
	}

	//recieving info
	ws.on('message', function incoming(msg_raw){
		//console.log("I got "+msg_raw)
		let msg = JSON.parse(msg_raw)

		if (msg.type === 'input_change'){
			//console.log("new val: "+msg.val)
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
		//remove them from vlient list
		for (let i=0; i<clients.length; i++){
		  if (clients[i] == ws){
		    console.log("found and killed client")
		    clients.splice(i, 1)
		  }
		}
	});

	/*
	clients.push(ws)

	let base_info = game.get_base_info()

	//send that they connected confirmation
	ws.send( JSON.stringify({
		type:"connect_confirm",
		turn_time:base_info.turn_time,
		cols: base_info.cols,
		rows: base_info.rows,
		info: game.generate_game_info(),
		wait_message: game.get_wait_message()
	}))

	//start listening
	ws.on('message', function incoming(msg_raw){
		//console.log("I got "+msg_raw)
		let msg = JSON.parse(msg_raw)

		if (msg.type === 'join_request'){
			game.join_player(msg, ws)
			exports.send_wait_pulse()
		}

		if (msg.type === 'client_move'){
			game.parse_client_move(msg, ws)
		}

		if (msg.type === "force_start"){
			console.log("you have forced me to start")
			game.start_game(true)
		}

		if (msg.type === "force_end"){
			console.log("you have forced me to end")
			game.end_game()
		}

		if (msg.type === "force_slow_test"){
			console.log("debug: starting slow test")
			game.start_slow_test()
		}
		if (msg.type === "resolve"){
			console.log("debug:resolving ")
			game.get_debug_resolve()
		}

	})

	ws.on('close', () => {
		console.log('Client disconnected')
		//kill em
		game.remove_player(ws)
		for (let i=0; i<clients.length; i++){
		  if (clients[i] == ws){
		    console.log("found and killed client")
		    clients.splice(i, 1)
		  }
		}
	});

	*/
}

exports.send_gamestate_to_clients = function(frogs){
	//console.log("send state")
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

/*
exports.send_wait_pulse = function(){
	//console.log("send wait pulse")
  let val = {
    type:"wait_pulse",
    info: game.generate_game_info(),
    wait_message: game.get_wait_message()
  }
  exports.send_json_to_clients(JSON.stringify(val))
}

exports.send_game_end = function(){

  let val = {
    type:"game_end",
    info: game.generate_game_info(),
    wait_message: game.get_wait_message()
  }
  exports.send_json_to_clients(JSON.stringify(val))
}

exports.send_board = function(){
  let time = Date.now()
  //console.log(time)
  let val = {
    type:"board",
    info: game.generate_game_info()
  }
  let json = JSON.stringify(val)
  exports.send_json_to_clients(json)
}

exports.send_pulse = function(){
  let time = Date.now()
  //console.log(time)
  let val = {
    type:"pulse",
    phase: game.get_beat_phase(),
    time: time,
    wait_message: ""
  }
  let json = JSON.stringify(val)
  exports.send_json_to_clients(json)
}

exports.send_json_to_clients = function(json){
  for (let i=0; i<clients.length; i++){
    clients[i].send(json)
  }
}
*/




