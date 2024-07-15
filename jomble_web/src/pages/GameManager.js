import React, { useContext, useState } from 'react'
import { NetworkContext } from '../context/NetworkContext';
import { PlayerContextProvider } from '../context/PlayerContext';
import ChooseAvatar from './ChooseAvatar';


function GameManager() {
    const {rtcConnected, peerConnectionRef, setRtcConnected } = useContext(NetworkContext);

    if(!rtcConnected) {
        return
    }

    let aliveInterval = setInterval(() => {
        //and check for gamestate being lobby
        if(peerConnectionRef.current.iceConnectionState === 'failed') {
            setRtcConnected(false);
        }
    }, 1000);


    return (
    <PlayerContextProvider>
        <ChooseAvatar />
    </PlayerContextProvider>
    )
}

export default GameManager