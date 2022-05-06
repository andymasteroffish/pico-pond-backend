const communication = require('./ws_communication.js')


var frogs = new Array(10);

//these values should match pico8 vals
var growth_rate = 1;

var max_frog_value = 100;

exports.setup = function(){
  console.log("setup game")
 	exports.reset_game()
}

exports.reset_game = function(){
  for (let i=0; i<frogs.length; i++){
    frogs[i] = {
      id : i,
      active : false,
      button_down : false,
      val : 0,
      ws : null
    }
  }
}

exports.join_player = function(ws){
  console.log("try to join player")
  let my_frog = null;

  //find an open frog
  for (let i=0; i<frogs.length; i++){
    console.log("check frog "+i)
    if (!frogs[i].active){
      my_frog = frogs[i]
      break;
    }
  }

  //if we found one, set it
  if (my_frog != null){
    my_frog.active = true;
    my_frog.ws = ws;
  }

  //if it was full, just return null
  return my_frog;

}

exports.remove_player = function(ws){
  for (let i=0; i<frogs.length; i++){
    if (frogs[i].ws == ws){
      frogs[i].ws = null;
      frogs[i].val = 0;
      frogs[i].active = false;
    }
  }
}

exports.tick = function(){
  // frogs.forEach( frog => {
  //   if (frog.active){
  //     frog.val -= decay_rate
  //     if (frog.val < 0) frog.val = 0
  //   }
  // })
  for (let i=0; i<frogs.length; i++){
    let frog = frogs[i]
    if (frog.active){

      if (frog.button_down) frog.val += growth_rate
      else                  frog.val = 0

      if (frog.val > max_frog_value) frog.val = max_frog_value

      //console.log(i+": "+frog.button_down + " / "+frog.val)
    }
  }

  //send the frog info to all clients
  communication.send_gamestate_to_clients(frogs)
}

exports.get_frog_from_ws = function(ws){
  for (let i=0; i<frogs.length; i++){
    if (frogs[i].ws == ws){
      return frogs[i];
    }
  }

  return null;
}