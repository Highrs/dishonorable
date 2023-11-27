(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
'use strict';

const getSvg = require('./get-svg.js');
const renderer = require('onml/renderer.js');
const tt = require('onml/tt.js');

function getPageWidth() {return document.body.clientWidth;}
function getPageHeight() {return document.body.clientHeight;}

const mkRndr = (place) => {
    return renderer(document.getElementById(place));
};

const drawStatic = () => {
    return getSvg({w:getPageWidth(), h:getPageHeight(), i:'allTheStuff'}).concat([
        ['g', {id: 'mainCanvas'},
            ['g', tt( 5, 5, {id: 'lobbyListDisplay'} )],
            ['g', tt( 210, 5, {id: 'mainDisplayOverall'}),
                ['rect', {width: 500, height: 200, class: 'mainDisplay'}],
                ['g', tt(250, 100, {id: 'mainDisplay'})]
            ],
        ]
    ]);
};

const displayLobbies = (lobbiesList, renderLobbyList, cliento) => {
    // console.log('displayingLobbies ' + lobbiesList.length);
    renderLobbyList(drawLobbyList(lobbiesList, cliento));
};

const displayMainDisplay = (renderMainDisplay, cliento, lobbyo) => {
    if (cliento.state === 'menu') {
        renderMainDisplay(drawMainDisplayLobbySelect(cliento.state));
    } else if (cliento.state === 'lobby') {
        renderMainDisplay(drawMatchMain(cliento, lobbyo));
        createListenersCommands();
    }
};

const drawLobbyList = (lobbiesList, cliento) => {
    let box = ['g', {}];

    for ( let i = 0; i < lobbiesList.length; i++ ) {
        let lobby = lobbiesList[i];
        // console.log(lobby);
        let playerOne = lobby.players[0];
        let playerTwo = lobby.players[1];
        let playerOneID = 'EMPTY';
        let playerTwoID = 'EMPTY';

        if (playerOne !== null) {playerOneID = playerOne.id;}
        if (playerTwo !== null) {playerTwoID = playerTwo.id;}
        
        let entryHeight = 30;

        let variableBoxClass = 'lobbyBox';
        // console.log(cliento);
        if (cliento.state === 'menu') {variableBoxClass = 'lobbyBoxSelectable'};

        box.push(
            ['g', tt(0, (entryHeight + 5) * i, {id: 'lobbyEntry' + i, class: 'lobbyBox'}),
                ['rect', {width: 200, height: entryHeight}],
                ['g', tt(5,5, {class: variableBoxClass, id: 'lobbyEntry' + i + 'p1'}),
                    ['rect', {width: 80, height: entryHeight-10}],
                    ['text', {class: 'dataText', x: 4, y:15}, playerOneID],
                ],
                ['g', tt(115,5, {class: variableBoxClass, id: 'lobbyEntry' + i + 'p2'}),
                    ['rect', {width: 80, height: entryHeight-10}],
                    ['text', {class: 'dataText', x: 4, y:15}, playerTwoID],
                ],
                ['text', {class: 'dataText', x: 90, y:20}, 'VS'],
            ]
        );
    }

    return box;
};

const drawMatchMain = (cliento, lobbyo) => {
    // console.log(lobbyo);
    let drawnCraft = ['g', {}]

    lobbyo.hulls.forEach(crafto => {
        let owned = cliento.side === crafto.id ? true : false;
        // console.log(owned);
        drawnCraft.push(drawCraft(crafto, owned));
    }); 

    return drawnCraft;
};

// const drawGrid = () => {};

const drawCraft = (crafto, owned) => {
    
    const drawnCraft = ['g', {
        transform: 'translate('+crafto.loc.x+', '+crafto.loc.y+')',
        id: 'craft' + crafto.id
    },
        ['g', tt(10, 10, {id: 'craftTac' + crafto.id}),
            drawTac(crafto, owned)
        ],
        ['g', {id: 'craftIcon' + crafto.id, class: (owned ? 'craft' : 'craft enemy')},
            icons.craft(crafto)
        ]
    ];

    return drawnCraft;
};

const drawTac = (crafto, owned) => {
    let drawn = ['g', {}];

    drawn.push(['g', {},
        ['line', {
            x1: 0,
            y1: 0,
            x2: -10,
            y2: -10,
            class: 'data'
        }],
        ['rect', {width: 50, height: 20, class: 'data'}],
        ['text', {class: 'dataText', x: 4, y:15}, owned ? 'ASSET' : 'ENEMY'],
        ['g', tt(0,25),
            drawHealthBar(crafto)
        ]
    ])

    if (owned) {
        drawn.push(
            ['g', tt(0,40, {id: 'attackButton', class: 'lobbyBoxSelectable'}),
                ['rect', {width: 60, height: 20}],
                ['text', {class: 'dataText', x: 4, y:15}, 'ATTACK']
            ],
            ['g', tt(0,65, {id: 'defendButton', class: 'lobbyBoxSelectable'}),
                ['rect', {width: 60, height: 20}],
                ['text', {class: 'dataText', x: 4, y:15}, 'DEFEND']
            ]
        )
    }

    return drawn;
};

const createListenersCommands = () => {
    document.getElementById('attackButton').addEventListener('click', function () {
        sendActionSelection('attack');
    });

    document.getElementById('defendButton').addEventListener('click', function () {
        sendActionSelection('defend');
    });
};

const sendActionSelection = (action) => {
    let packageo = {
        type: 'actionSelection',
        action: action
    };
    
    socket.send(JSON.stringify(packageo));

    console.log('Sent action selection to server.');
}

const drawHealthBar = (crafto) => {
    let bar = ['g', {}];

    // console.log(crafto);
    for (let i = 1; i <= crafto.maxHealth; i++) {
        bar.push(
            ['rect', {
                x: (i-1)*10, 
                y: 0, 
                width: 10, 
                height: 10, 
                class: i <= crafto.currentHealth ? 'healthSquare' : 'healthSquare depleted'
            }]
        );
    }

    // console.log(bar);

    return bar;
};

const icons = {
    craft:        (crafto) => {
        const icono = {
            arrow: 'M 0,0 L 3,-3 L 0, 5 L -3,-3 Z'
        };
    
        let iconString =
          icono[crafto.icon] ?
          icono[crafto.icon] :
          'M 0,3 L 3,0 L 0,-3 L -3,0 Z';
    
        return ['g', {},
          ['path', {
            transform: 'scale(2, 2)',
            d: iconString,
            // class: 'craft'
          }]
        ];
      },
};

const drawMainDisplayLobbySelect = (clientState) => {
        return ['g', {},
            ['text',
                {
                    x: 0,
                    y: 0,
                    class: 'largeOverlayText'
                }, 
                '///SELECT LOBBY///'
            ]
        ];
};

const createListenersForLobbyList = (lobbiesList) => {
    for ( let i = 0; i < lobbiesList.length; i++ ) {
        let lobby = lobbiesList[i];
        if (lobby.players[0] === null) {
            document.getElementById('lobbyEntry' + i + 'p1').addEventListener('click', function () {
                // console.log('Click lobby ' + i + ' player 1');
                sendLobbySelectionToServer(socket, i+1, 0);
            });
        }
        if (lobby.players[1] === null) {
            document.getElementById('lobbyEntry' + i + 'p2').addEventListener('click', function () {
                // console.log('Click lobby ' + i + ' player 2');
                sendLobbySelectionToServer(socket, i+1, 1);
            });
        }

    }
};

const sendLobbySelectionToServer = (socket, lobbyId, side) => {
    let packageo = {
        type: 'lobbySelection',
        lobbyId: lobbyId,
        side: side,
    };
    
    socket.send(JSON.stringify(packageo));

    console.log('Sent lobby selection to server.');
};

let cliento = {};
let lobbyo = null;
let socket = null;

const main = async () => {
    console.log('Giant alien spiders are no joke!');
    
    let renderStatic = mkRndr('content');
    renderStatic(drawStatic());
    let renderLobbyList = mkRndr('lobbyListDisplay');
    let renderMainDisplay = mkRndr('mainDisplay');


    socket = new WebSocket("ws://localhost:8080");

    // Connection opened
    socket.addEventListener("open", (event) => {
        console.log('Connected!');
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {

        let receivedMessageo = JSON.parse(event.data);

        if (receivedMessageo.type === 'consoleLogMessage') {
            console.log("Receiving text message:");
            console.log(receivedMessageo.text);
        } else
        if (receivedMessageo.type === 'lobbyList') {
            console.log('Receiving lobby list.');
            displayLobbies(receivedMessageo.lobbiesList, renderLobbyList, receivedMessageo.cliento);
            if (receivedMessageo.cliento.state === 'menu') {
                createListenersForLobbyList(receivedMessageo.lobbiesList);
            }
        } else
        if (receivedMessageo.type === 'clientObj') {
            cliento = receivedMessageo.cliento;
            lobbyo = receivedMessageo.lobbyo;
            displayMainDisplay(renderMainDisplay, cliento, lobbyo);
        }
    });
};

window.onload = main;
},{"./get-svg.js":1,"onml/renderer.js":3,"onml/tt.js":5}],3:[function(require,module,exports){
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

},{"./stringify.js":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}]},{},[2]);
