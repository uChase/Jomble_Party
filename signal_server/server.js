const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const init_controller = require('./controller_help/init');
const init_player = require('./player_help/init');
const app = express();
app.use(cors());

const sessions = {};

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    try{
        const params = new URLSearchParams(req.url.split('?')[1]);
        const sessionId = params.get('sessionId');
        const joinType = params.get('joinType');
        const uname = params.get('uname');
        let clientId = params.get('clientId');

        switch (joinType) {
            case 'controller':
                console.log('controller connection attempted');
                init_controller(ws, sessions);
                break;
            case 'player':
                console.log('player connection attempted to session:', sessionId + ' name:',  uname);
                init_player(ws, sessions, uname, sessionId, clientId);
                break;
            default:
                console.log('Unknown join type:', joinType);
                ws.close();
                break;
        }
    } catch (error) {
        console.log('Error:', error);
        console.log('Closing connection to avoid server crash.');
        ws.close();
    }
})  


server.listen(8080, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8080/');
});