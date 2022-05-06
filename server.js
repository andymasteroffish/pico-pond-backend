//https://devcenter.heroku.com/articles/node-websockets

"use strict";

const express = require("express");
const { Server } = require("ws");

//heroku will force this to be port 80
const PORT = process.env.PORT || 3001;
const INDEX = "/index.html"; //TODO: get rid of this

const communication = require("./ws_communication.js");
const game = require("./game.js");

//setting up a sevrer
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

function setup() {
  game.setup();

  //setup the repeating loop
  setInterval(() => {
    tick();
  }, 1000.0/30.0 );  //30 fps to match pico 8

}

function tick() {
  game.tick();
}

//getting a new connection
wss.on("connection", ws => {
  communication.got_connection(ws);
});

setup();

//***************
//Gameplay
//***************

//reset
