import React, { createContext, useState, useEffect } from 'react';
import { initializeWebSocket, closeWebSocket, sendMessage } from './helpers/socket_logic';
import { getLocalStorage, setLocalStorage } from './helpers/local_storage';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');

    const joinSession = (sessionId) => {
        initializeWebSocket(sessionId, handleOpen, handleMessage, handleError, handleClose);
        setSessionId(sessionId);
    };

    const handleOpen = () => {
        setConnected(true);
    };

    const handleMessage = (data) => {
        switch (data.action) {
            case 'connected':
                console.log("saved")
                setLocalStorage('PrevSession', [data.payload[0], data.payload[1]]); // cliId, sessionId
                break;
            case 'reconnect':
                console.log('Reconnected to previous session');
                break;
            case 'player_update':
                setPlayers(data.payload);
                break;
            case 'message':
                setMessages((prevMessages) => [...prevMessages, data.message]);
                break;
            case 'error':
                setError(data.payload);
                closeWebSocket();
                break;
            default:
                console.error('Unknown action:', data.action);
        }
    };

    const handleError = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket error');
        closeWebSocket();
        joinSession(sessionId); // Attempt to reconnect
    };

    const handleClose = () => {
        setConnected(false);
    };

    useEffect(() => {
        return () => {
            closeWebSocket();
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                connected,
                sessionId,
                message,
                messages,
                players,
                error,
                setMessage,
                joinSession,
                sendMessage,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};