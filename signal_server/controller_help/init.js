const { handle_controller_message } = require("./controller_messaging");

function init_controller(ws, sessions)
{
    let code = generate_code(sessions);
    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        handle_controller_message(ws, msg, sessions, code);
    });

    ws.on('error', (error) => {
        console.log('Error occurred:', error);
        ws.close();
    })

    ws.on('close', () => {
        console.log('Controller connection closed');
        delete sessions[code];
    });


}

function generate_code(sessions){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    while(typeof sessions[code] !== 'undefined' && sessions[code] !== null)
    {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    }
    return "A";
}

module.exports = init_controller;