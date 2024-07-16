import React, { useContext, useState } from 'react'
import { NetworkContext } from '../context/NetworkContext';
import { PlayerContextProvider } from '../context/PlayerContext';
import ChooseAvatar from './ChooseAvatar';
import { GameStateContext } from '../context/GameStateContext';


function GameManager() {
    const {rtcConnected, peerConnectionRef, setRtcConnected } = useContext(NetworkContext);
    const {gameState} = useContext(GameStateContext)


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
        <Screen gameState={gameState} />
    </PlayerContextProvider>
    )
}

export default GameManager

const Screen = ({gameState}) => {

    switch(gameState) {
        case "lobby":
            return <ChooseAvatar />
        default:
            return <div>Invalid game state</div>
    }
}