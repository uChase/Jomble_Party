const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { init_connection_player, init_connection_controller } = require('./socket_logic/setup');
const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



const sessions = {}



wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.split('?')[1]);
    let sessionId = params.get('sessionId');
    let clientId = params.get('clientId');
    const token = params.get('token');

    if (token !== null){
        console.log('Controller connection attempted')
        let code = init_connection_controller(ws, sessionId, token, sessions[sessionId]);
        if (code === 'fail'){
            return;
        }
        if (code != 'recconnected'){
            sessions[code] = {controller: {ws: ws,}, clients: {}};
        }


        ws.on('close', () => {
            console.log('Controller disconnected')
            delete sessions[code];
        });

        ws.on('error', () => {
            console.log('Controller error')
            delete sessions[code];
        })
        
        
    } else {
        console.log('Player connection attempted')
        init_connection_player(ws, sessionId, clientId, sessions[sessionId]);
    }
})

server.listen(8080, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8080/');
});
