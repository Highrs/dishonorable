'use strict';

const draw = require('./draw.js');
const net = require('./net.js');
const Stats = require('stats.js');

const main = async () => {
    console.log('Giant alien spiders are no joke!');
    
    draw.initialDraw();

    var stats = new Stats();
    stats.dom.style.left = "";
    stats.dom.style.right = '0px';
    // console.log(stats.dom);
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    stats.begin();

    draw.connectingScreen();
    net.initialConnect();

    stats.end();
};

window.onload = main;