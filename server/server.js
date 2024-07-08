const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { init_connection_player, init_connection_controller } = require('./socket_logic/setup');
const { controller_message_handler } = require('./socket_logic/controller/message');
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
    let uname = params.get('uname');

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

        controller_message_handler(ws, sessions[code]);


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
        if(!init_connection_player(ws, sessionId, clientId, sessions[sessionId], uname))
        {
            return;
        }

        ws.on('error', () => {
            console.log(`Player with id ${ws.id} error`)
        });

        ws.on('close', () => {
            console.log(`Player with id ${ws?.id} and name ${sessions[sessionId]?.clients[ws?.id]?.name} disconnected `)
            if(sessions[sessionId] !== undefined && !sessions[sessionId]?.started && sessions[sessionId]?.clients[ws.id] !== undefined){
                sessions[sessionId].controller.ws.send(JSON.stringify({action: 'lobby_disconnect', clientId: ws?.id, }));
                delete sessions[sessionId].clients[ws.id];
            }
        });


    }
})

server.listen(8080, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8080/');
});
