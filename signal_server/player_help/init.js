const { v4: uuidv4 } = require('uuid');
const { handle_player_message } = require('./player_messaging');

function init_player(ws, sessions, uname, sessionId, clientId)
{  
    if(sessions[sessionId] === undefined || sessions[sessionId] == null)
    {
        ws.send(JSON.stringify({type: 'error', payload: 'Invalid session'}));
        console.log('Invalid session');
        ws.close();
        return;
    }

    //CHECK FOR RECONNECTION LATER

    clientId = uuidv4();
    ws.uname = uname;
    ws.id = clientId;
    ws.RTCConnected = false;

    sessions[sessionId].clients[clientId] = ws;

    ws.send(JSON.stringify({type: 'session_joined', payload: sessionId, clientId: clientId}));
    console.log('Player connected to session:', sessionId);
    sessions[sessionId].controller.send(JSON.stringify({type: 'player_joined', payload: uname, clientId: clientId}));

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        handle_player_message(ws, msg, sessions, sessionId, clientId);
    });

    ws.on('error', (error) => {
        console.log('Error occurred:', error);
        ws.close();
    })

    ws.on('close', () => {
        console.log('Player connection closed');

        if(sessions[sessionId] != null && !sessions[sessionId]?.isStarted )
            delete sessions[sessionId].clients[clientId];
    });


}

module.exports = init_player;