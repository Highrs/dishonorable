'use strict';

const getSvg = require('./get-svg.js');
const renderer = require('onml/renderer.js');

function getPageWidth() {return document.body.clientWidth;}
function getPageHeight() {return document.body.clientHeight;}

const mkRndr = (place) => {
    return renderer(document.getElementById(place));
};

const drawStatic = () => {
    return getSvg({w:getPageWidth(), h:getPageHeight(), i:'allTheStuff'}).concat([
      ['g', {id: 'mainCanvas'}]
    ]);
  };

const main = async () => {
    console.log('Giant alien spiders are no joke!');
    
    let renderStatic = mkRndr('content');
    renderStatic(drawStatic());

    const socket = new WebSocket("ws://localhost:8080");

    // Connection opened
    socket.addEventListener("open", (event) => {
        console.log('Connected!');
        // console.log(socket);
        // console.log(event);
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        console.log("Server says: ", event.data);
    });
};

window.onload = main;