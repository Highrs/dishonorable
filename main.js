'use strict';

import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("ws://localhost:3000");

const main = async () => {
    console.log('Giant alien spiders are no joke!');

    socket.on("hello", (arg) => {
        console.log(arg);
    });

    socket.emit("howdy", "stranger");

};

window.onload = main;