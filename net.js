'use strict';

let socket = null;

exports.initialConnect = () => {
    socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", (event) => {
        console.log('Connected!');
    });

    socket.addEventListener("message", (event) => {
        let receivedMessageo = JSON.parse(event.data);
    });
};