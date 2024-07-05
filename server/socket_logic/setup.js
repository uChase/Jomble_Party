const { v4: uuidv4 } = require('uuid');
const { check_controller_token } = require('./check_tokens');


function init_connection_player(ws, sessionId, clientId, session)
{
    console.log('New connection');
    if (session === undefined){
        console.log(`Session ${sessionId} not found`);
        ws.send(JSON.stringify({action: 'error', error: 'Session not found'}));
        ws.close();
        return;
    }
    if (checkReconnectionPlayer(ws, sessionId, clientId, session)){
        return;
    }
    clientId = uuidv4();
    session.clients[clientId] = {ws: ws};
    ws.send(JSON.stringify({action: 'connected', clientId: clientId}));
}

function checkReconnectionPlayer(ws, sessionId, clientId, session){
    if (clientId != '' && session.clients[clientId] !== undefined && session.clients[clientId].ws.readyState === ws.CLOSED){
        console.log(`Client ${clientId} reconnected`);
        session.clients[clientId].ws = ws;
        ws.send(JSON.stringify({action: 'reconnect'}));
        return true;
    } else if (clientId != '' && session.clients[clientId] !== undefined && session.clients[clientId].ws.readyState === ws.OPEN){
        console.log(`Client ${clientId} already connected`);
        ws.send(JSON.stringify({action: 'error', payload: 'Already connected'}));
        ws.close();
        return true
    }
    return false;
}

function init_connection_controller(ws, sessionId, token, session){
    console.log('New connection');
    if (checkReconnectionController(ws, sessionId, token, session)){
        return 'recconnected';
    }
    if (!check_controller_token(token)){
        console.log('Invalid token');
        ws.send(JSON.stringify({action: 'error', payload: 'Invalid token'}));
        ws.close();
        return 'fail';
    }
    code = generate_code();
    ws.send(JSON.stringify({action: 'created_session', payload: code}));
    return code;

}

function checkReconnectionController(ws, sessionId, token, session){
    if (session !== undefined && session.controller !== undefined && session.controller.ws.readyState === ws.CLOSED && check_controller_token(token)){
        console.log(`Controller reconnected`);
        session.controller.ws = ws;
        ws.send(JSON.stringify({action: 'reconnect'}));
        return true;
    } else if (session?.controller !== undefined && session.controller.ws.readyState === ws.OPEN){
        console.log(`Controller already connected`);
        ws.send(JSON.stringify({action: 'error', payload: 'Already connected'}));
        ws.close();
        return true
    }
    return false;
}

function generate_code(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

module.exports = { init_connection_player, init_connection_controller, check_controller_token };