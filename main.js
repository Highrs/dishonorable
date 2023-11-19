'use strict';

const socket = new WebSocket("ws://localhost:8080");

// Connection opened
socket.addEventListener("open", (event) => {
    let mail = "Hello Server!";
    console.log('sending ' + mail)
    socket.send(mail);
});

// Listen for messages
socket.addEventListener("message", (event) => {
    console.log("Message from server: ", event.data);
});

const main = async () => {
    console.log('Giant alien spiders are no joke!');
};

window.onload = main;