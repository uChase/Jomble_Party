import adapter from 'webrtc-adapter';
import { closeWebSocket, sendMessage } from './socket_logic';

const createPeerConnection = (dataChannel, onChannelMessage, onChannelError, onChannelClose, onChannelOpen) => {
    const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
    const pc = new RTCPeerConnection(config);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({ type: 'candidate', payload: event.candidate });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = onChannelMessage
      channel.onerror = onChannelError;
      channel.onclose = onChannelClose;
      channel.onopen = onChannelOpen

      dataChannel.current = channel;
    };
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        closeWebSocket()
      }
    };


    return pc;
  };


  export const handleOffer = async (offer, peerConnectionRef, dataChannel, candidateQueueRef, onChannelMessage, onChannelError, onChannelClose, onChannelOpen) => {
    
    peerConnectionRef.current = createPeerConnection(dataChannel, onChannelMessage, onChannelError, onChannelClose, onChannelOpen);
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    sendMessage({ type: 'answer', payload: answer})
    candidateQueueRef.current.forEach(candidate => {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
    candidateQueueRef.current = [];
  };

  export const handleAnswer = async (answer, peerConnectionRef) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  export const handleCandidate = async (candidate, peerConnectionRef, candidateQueueRef) => {
    if(!peerConnectionRef.current) {
      candidateQueueRef.current.push(candidate);
      return;
    }
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };