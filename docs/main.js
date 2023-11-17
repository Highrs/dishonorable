'use strict';

import { io } from "socket.io-client";

const socket = io("ws://localhost:3000");



const main = async () => {
    console.log('Giant alien spiders are no joke!');

    socket.on("hello", (arg) => {
        console.log(arg);
    });

    socket.emit("howdy", "stranger");

};

window.onload = main;