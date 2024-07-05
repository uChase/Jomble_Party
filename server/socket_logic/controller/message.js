
function controller_message_handler(ws, session){
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.action) {
            case 'message':
                if (data.payload){
                    ws.send(JSON.stringify({action: 'message', message: data.payload}));
                }
                break;
            default:
                console.error('Unknown action:', data.action);
        }
    });
}