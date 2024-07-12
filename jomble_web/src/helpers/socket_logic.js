let socket;

export const initializeWebSocket = (sessionId, onOpen, onMessage, onError, onClose, uname) => {
    //ADD RECONNECTION LATER AND CLIENT ID TO URL

    socket = new WebSocket('ws://localhost:8080?sessionId=' + sessionId + '&joinType=player&uname=' + uname);

    socket.onopen = () => {
        console.log('WebSocket connection opened');
        onOpen();
    };

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        await onMessage(data);
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

}

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