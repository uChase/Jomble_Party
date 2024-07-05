import React, { useState } from 'react';
import io from 'socket.io-client';

let socket;

function App() {
    const [connected, setConnected] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');

    const joinSession = () => {
        //This has to update with ip for now
        socket = io('http://192.168.68.93:8080');

        socket.emit('join', sessionId);

        socket.on('update', (session) => {
            setPlayers(session.players);
        });

        socket.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socket.on('error', (errMsg) => {
            setError(errMsg);
            socket.disconnect();
        });

        socket.on('disconnect', () => {
            setConnected(false);
            setError('Disconnected from server');
        });

        setConnected(true);
    };

    const sendMessage = () => {
        if (message) {
            socket.emit('message', { sessionId, message });
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {!connected ? (
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold mb-4">Join Game Session</h1>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <input
                        type="text"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        placeholder="Session ID"
                        className="p-2 border border-gray-300 rounded-md mb-2"
                    />
                    <button
                        onClick={joinSession}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Join
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold mb-4">Game Session: {sessionId}</h1>
                    <div className="flex mb-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here"
                            className="p-2 border border-gray-300 rounded-l-md"
                        />
                        <button
                            onClick={sendMessage}
                            className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                    <ul className="list-none p-0 mb-4">
                        {messages.map((msg, index) => (
                            <li key={index} className="p-2 mb-2 bg-white border border-gray-200 rounded-md shadow-sm">
                                {msg}
                            </li>
                        ))}
                    </ul>
                    <h2 className="text-xl font-bold mb-2">Players</h2>
                    <ul className="list-none p-0">
                        {players.map((player, index) => (
                            <li key={index} className="p-2 mb-2 bg-white border border-gray-200 rounded-md shadow-sm">
                                {player}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
