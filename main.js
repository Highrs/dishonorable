'use strict';

const draw = require('./draw.js');
const net = require('./net.js');

const main = async () => {
    console.log('Giant alien spiders are no joke!');
    
    draw.initialDraw();
    net.initialConnect();
};

window.onload = main;