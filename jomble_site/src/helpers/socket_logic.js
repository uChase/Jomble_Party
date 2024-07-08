import { getLocalStorage } from "./local_storage";

let socket;
let onMessageHandler;
let onErrorHandler;
let onCloseHandler;

export const initializeWebSocket = (sessionId, onOpen, onMessage, onError, onClose, uname) => {
    let cliId = '';
    console.log(uname)
    if (getLocalStorage('PrevSession') !== null) {
        if (sessionId === getLocalStorage('PrevSession').split(',')[1]) {
            console.log('Reconnecting to previous session');
            cliId = getLocalStorage('PrevSession').split(',')[0];
        }
    }

    socket = new WebSocket(`ws://192.168.68.93:8080?sessionId=${sessionId}&clientId=${cliId}&uname=${uname}`);

    socket.onopen = () => {
        console.log('WebSocket connection opened');
        onOpen();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError(error);
        socket.close();
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
        onClose();
    };

    // Store handlers to call them later if needed
    onMessageHandler = onMessage;
    onErrorHandler = onError;
    onCloseHandler = onClose;
};

export const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
};

export const closeWebSocket = () => {
    if (socket) {
        socket.close();
    }
};
