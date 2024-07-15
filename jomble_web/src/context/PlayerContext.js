import React, { createContext, useState, useEffect, useRef } from "react";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
    const [playerName, setPlayerName] = useState("");
    const [money, setMoney] = useState(0);
    const [playerAvatar, setPlayerAvatar] = useState(null);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {

        return () => {
            setPlayerName("");
            setMoney(0);
            setPlayerAvatar(null);
            setIsHost(false);
        }
    }, [])


    return (
        <PlayerContext.Provider value={{ playerName, setPlayerName, money, setPlayerAvatar, setIsHost}}>
            {children}
        </PlayerContext.Provider>
    );

}