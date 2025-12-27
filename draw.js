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
        ['g', {id: 'screenFrame'}],
        ['g', {id: 'display'}]
    ]);
};

const drawScreenFrame = () => {
    return ['rect', tt( 0.5, 0.5, {width: getPageWidth()-1, height: getPageHeight()-1, class: 'mainDisplay'})];
}

const drawConnectingScreen = () => {
    let screen = ['g', {id: 'screenConnecting'}];
    screen.push(['g', tt(getPageWidth()/2, getPageHeight()/2) ,
        ['text', {class: 'connectingText'}, 'CONNECTING'],
        ['circle', { r:'5', cx:-20, cy:10, class: 'dot dot1'}],
        ['circle', { r:'5', cx:0, cy:10, class: 'dot dot2'}],
        ['circle', { r:'5', cx:20, cy:10, class: 'dot'}]
    ]);
    return screen;
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

exports.connectingScreen = () => {
    let renderScreenLoading = mkRndr('display');
    renderScreenLoading(drawConnectingScreen());
}