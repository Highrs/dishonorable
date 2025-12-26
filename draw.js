'use strict';
//What are you doing here? Go away.

const getSvg = require('./get-svg.js');
const tt = require('onml/tt.js');
const renderer = require('onml/renderer.js');

function getPageWidth() {return document.body.clientWidth;}
function getPageHeight() {return document.body.clientHeight;}

const mkRndr = (place) => {return renderer(document.getElementById(place));};

const drawStatic = () => {
    return getSvg({w:getPageWidth(), h:getPageHeight(), i:'allTheStuff'}).concat([
        ['g', {id: 'screenFrame'}]
    ]);
};

const drawScreenFrame = () => {
    let frame = ['g', {}]
    frame.push( ['g', {},
        ['rect', tt( 5, 5, {width: getPageWidth()-10, height: getPageHeight()-10, class: 'mainDisplay'})]
    ]);
    return frame;
}

let renderers = {};

exports.initialDraw = () => {
    let renderStatic = mkRndr('content');
    renderStatic(drawStatic());
    let renderScreenFrame     = mkRndr('screenFrame');
    renderScreenFrame(drawScreenFrame());

    const resizeWindow = () => {
        document.getElementById('allTheStuff').setAttribute('width', getPageWidth());
        document.getElementById('allTheStuff').setAttribute('height', getPageHeight());
        document.getElementById('allTheStuff').setAttribute('viewBox',
            [0, 0, getPageWidth() + 1, getPageHeight() + 1].join(' ')
        );
        renderScreenFrame(drawScreenFrame());
    };
    renderers.resizeWindow = resizeWindow;

    window.addEventListener('resize', function() {resizeWindow();});
}