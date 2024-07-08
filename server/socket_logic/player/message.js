
function player_message_handler(ws, session){
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.action) {
            case 'end_session':
                break;
            default:
                console.error('Unknown action:', data.action);
        }
    });
}




module.exports = { player_message_handler };