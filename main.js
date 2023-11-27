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