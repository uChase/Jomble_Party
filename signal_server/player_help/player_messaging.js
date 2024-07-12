
function handle_player_message(ws, message, sessions, sessionId, clientId){
    switch (message.type) {

        case 'leave_session':

            break;
        case 'send_message':

            break;
        case 'answer':
            sessions[sessionId].controller.send(JSON.stringify({type: 'answer', answer: message.payload, clientId: clientId}));
            break
        case 'candidate':
            sessions[sessionId].controller.send(JSON.stringify({type: 'candidate', candidate: message.payload, clientId: clientId}));
            break;
        default:

            break;
    }
}



module.exports = {handle_player_message};