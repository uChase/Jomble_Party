
 function controller_message_handler(ws, session){
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.action) {
            case 'end_session':
                end_session(session);
                break;
            default:
                console.error('Unknown action:', data.action);
        }
    });
}


function end_session(session){
    for (const client in session.clients){
        session.clients[client].ws.close();
    }
    session.controller.ws.close();
    delete session;
}

module.exports = { controller_message_handler };