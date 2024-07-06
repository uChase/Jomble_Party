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
    let token = params.get('token');

    //CONTROLLER COMMUNICATION
    if (token !== null){
        console.log('Controller connection attempted')
        let code = init_connection_controller(ws, sessionId, token, sessions[sessionId]);
        if (code === 'fail'){
            return;
        }
        if (code != 'recconnected'){
            sessions[code] = {controller: {ws: ws,}, clients: {}, started: false};
        }


        ws.on('close', () => {
            console.log('Controller disconnected')
            delete sessions[code];
        });

        ws.on('error', () => {
            console.log('Controller error')
            delete sessions[code];
        })
        
        
    } 
    else //PLAYER COMMUNICATION
    {
        console.log('Player connection attempted')
        if(!init_connection_player(ws, sessionId, clientId, sessions[sessionId]))
        {
            return;
        }

        ws.on('error', () => {
            console.log(`Player with id ${ws.id} error`)
        });

        ws.on('close', () => {
            console.log(`Player with id ${ws.id} disconnected`)
            if(!sessions[sessionId].started && sessions[sessionId].clients[ws.id] !== undefined){
                delete sessions[sessionId].clients[ws.id];
            }
        });


    }
})

server.listen(8080, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8080/');
});
