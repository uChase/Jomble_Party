import React, { createContext, useState, useEffect, useRef } from "react";
import { closeWebSocket, initializeWebSocket } from "../helpers/socket_logic";
import { handleAnswer, handleCandidate, handleOffer } from "../helpers/rtc_logic";

export const NetworkContext = createContext();

export const NetworkContextProvider = ({ children }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [rtcConnected, setRtcConnected] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState(""); 
  const [isHost, setIsHost] = useState(false);
  const [uname, setUname] = useState("");
  const dataChannel = useRef(null);
  const peerConnectionRef = useRef(null);
  const candidateQueueRef = useRef([]);  // Candidate queue



  const joinSession = (sessionId, uname) => {
    initializeWebSocket(
      sessionId,
      handleOpen,
      handleMessage,
      handleError,
      handleClose,
      uname
    );
    setUname(uname);
    setSessionId(sessionId);
  };

  const handleOpen = () => {
    setSocketConnected(true);
  };

  const handleMessage = async (data) => {
    switch (data.type) {
      case "session_joined":
        console.log("Session joined:", data.payload);
        break;
      case "error":
        setError(data.payload);
        closeWebSocket();
        break;
      case "offer":
        await handleOffer(data.payload, peerConnectionRef, dataChannel, candidateQueueRef, onChannelMessage, onChannelError, onChannelClose, onChannelOpen);
        break;
      case "answer":
        await handleAnswer(data.payload, peerConnectionRef);
        break;
      case "candidate":
        await handleCandidate(data.payload, peerConnectionRef, candidateQueueRef);
        break;
      default:
        console.error("Unknown action:", data.type);
    }
  };

  const onChannelMessage = (event) => {
    console.log('Received Message:', event.data);
    let message = JSON.parse(event.data);
    if(message.type === 'Connected') {
      setRtcConnected(true);
    }
    if(message.type == 'Host')
    {
      setIsHost(true);
    }

  }

  const onChannelError = (error) => {
    console.error("Data channel error:", error);
    setRtcConnected(false);
  }

  const onChannelClose = () => {
    console.log('Data channel closed');
    setRtcConnected(false);
  }

  const onChannelOpen = () => {
    console.log('Data channel opened');
    let message = {
      type: 'Connected'
    }
    dataChannel.current.send(JSON.stringify(message));
  }

  const sendChannelMessage = (message) => {
    dataChannel.current.send(JSON.stringify(message))
  }

  const handleError = (error) => {
    console.error("WebSocket error:", error);
    setError("WebSocket error");
    closeWebSocket();
    // joinSession(sessionId); // Attempt to reconnect
  };

  const handleClose = () => {
    setSocketConnected(false);
  };

  useEffect(() => {
    return () => {
      closeWebSocket();
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        socketConnected,
        rtcConnected,
        sessionId,
        joinSession,
        error,
        setError,
        dataChannel,
        sendChannelMessage,
        uname,
        peerConnectionRef,
        setRtcConnected,
        isHost
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
