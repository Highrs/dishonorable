(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./get-svg.js":2,"onml/renderer.js":5,"onml/tt.js":7}],2:[function(require,module,exports){
module.exports = cfg => {
  cfg = cfg || {};
  cfg.w = cfg.w || 880;
  cfg.h = cfg.h || 256;
  cfg.i = cfg.i || 'sveg';
  return ['svg', {
   xmlns: 'http://www.w3.org/2000/svg',
    width: cfg.w + 1,
    height: cfg.h + 1,
    id: cfg.i,
    viewBox: [0, 0, cfg.w + 1, cfg.h + 1].join(' '),
    class: 'panel'
  }];
};

},{}],3:[function(require,module,exports){
'use strict';

const draw = require('./draw.js');
const net = require('./net.js');

const main = async () => {
    console.log('Giant alien spiders are no joke!');
    
    draw.initialDraw();
    net.initialConnect();
};

window.onload = main;
},{"./draw.js":1,"./net.js":4}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
'use strict';

const stringify = require('./stringify.js');

const renderer = root => {
  const content = (typeof root === 'string')
    ? document.getElementById(root)
    : root;

  return ml => {
    let str;
    try {
      str = stringify(ml);
      content.innerHTML = str;
    } catch (err) {
      console.log(ml);
    }
  };
};

module.exports = renderer;

/* eslint-env browser */

},{"./stringify.js":6}],6:[function(require,module,exports){
'use strict';

const isObject = o => o && Object.prototype.toString.call(o) === '[object Object]';

function indenter (indentation) {
  if (!(indentation > 0)) {
    return txt => txt;
  }
  var space = ' '.repeat(indentation);
  return txt => {

    if (typeof txt !== 'string') {
      return txt;
    }

    const arr = txt.split('\n');

    if (arr.length === 1) {
      return space + txt;
    }

    return arr
      .map(e => (e.trim() === '') ? e : space + e)
      .join('\n');
  };
}

const clean = txt => txt
  .split('\n')
  .filter(e => e.trim() !== '')
  .join('\n');

function stringify (a, indentation) {
  const cr = (indentation > 0) ? '\n' : '';
  const indent = indenter(indentation);

  function rec(a) {
    let body = '';
    let isFlat = true;

    let res;
    const isEmpty = a.some((e, i, arr) => {
      if (i === 0) {
        res = '<' + e;
        return (arr.length === 1);
      }

      if (i === 1) {
        if (isObject(e)) {
          Object.keys(e).map(key => {
            let val = e[key];
            if (Array.isArray(val)) {
              val = val.join(' ');
            }
            res += ' ' + key + '="' + val + '"';
          });
          if (arr.length === 2) {
            return true;
          }
          res += '>';
          return;
        }
        res += '>';
      }

      switch (typeof e) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
        body += e + cr;
        return;
      }

      isFlat = false;
      body += rec(e);
    });

    if (isEmpty) {
      return res + '/>' + cr; // short form
    }

    return isFlat
      ? res + clean(body) + '</' + a[0] + '>' + cr
      : res + cr + indent(body) + '</' + a[0] + '>' + cr;
  }

  return rec(a);
}

module.exports = stringify;

},{}],7:[function(require,module,exports){
'use strict';

module.exports = (x, y, obj) => {
  let objt = {};
  if (x || y) {
    const tt = [x || 0].concat(y ? [y] : []);
    objt = {transform: 'translate(' + tt.join(',') + ')'};
  }
  obj = (typeof obj === 'object') ? obj : {};
  return Object.assign(objt, obj);
};

},{}]},{},[3]);
