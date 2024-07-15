const { check_controller_token } = require("./check_token");

function handle_controller_message(ws, message, sessions, sessionId){
    switch (message.type) {
        case 'create_session':
            create_session(ws, message.payload, sessions, sessionId);
            break;
        case 'offer':
            if(!validation_check(ws))
            {
                return;
            }
            offer(ws, message, sessions, sessionId);
            break;
        case 'candidate':
            if(!validation_check(ws))
            {
                return;
            }
            candidate(message, sessions, sessionId);
            break;
        case 'send_message':
            if(!validation_check(ws))
            {
                return;
            }
            // send_message(ws, message.payload, sessions);
            break;
        default:
            if(!validation_check(ws))
            {
                return;
            }
            console.log('Unknown message type: ' + message.type);
            break;
    }
}

function create_session(ws, token, sessions, sessionId){
    if(check_controller_token(token)){
        ws.validated = true;
        sessions[sessionId] = {controller: ws, clients: {}, isStarted: false};
        ws.send(JSON.stringify({type: 'session_created', payload: sessionId}));
        console.log('Session started with id:', sessionId);
    } else{
        ws.send(JSON.stringify({type: 'error', payload: 'Invalid token'}));
        ws.close();
    }
}

function validation_check(ws){
    if(!ws.validated){
        ws.send(JSON.stringify({type: 'error', payload: 'Not validated'}));
        ws.close();
        return false
    }
    return true
}

function offer(ws, message, sessions, sessionId){
    const client = sessions[sessionId].clients[message.clientId];
    if(client == null){
        ws.send(JSON.stringify({type: 'error', payload: 'Invalid client'}));
        return;
    }
    client.send(JSON.stringify({type: 'offer', payload: message.offer}));
    console.log('Offer sent to client:', client.uname);
}

function candidate(message, sessions, sessionId){
    sessions[sessionId]?.clients[message.clientId]?.send(JSON.stringify({type: 'candidate', payload: message.candidate}));
}





module.exports = {handle_controller_message};