import adapter from 'webrtc-adapter';
import { sendMessage } from './socket_logic';

const createPeerConnection = (setDataChannel) => {
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
      channel.onmessage = (e) => console.log('Received Message:', e.data);
      setDataChannel(channel);
    };

    return pc;
  };

  export const handleOffer = async (offer, peerConnectionRef, setDataChannel, candidateQueueRef) => {
    
    peerConnectionRef.current = createPeerConnection(setDataChannel);
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