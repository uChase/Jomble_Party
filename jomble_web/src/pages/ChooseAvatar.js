import React, { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { NetworkContext } from "../context/NetworkContext";

function ChooseAvatar() {
  const [avatarId, setAvatarId] = useState(null);
  const [chosenAvatars, setChosenAvatars] = useState([]);
  const {rtcConnected, dataChannel, sendChannelMessage, uname, isHost } = useContext(NetworkContext);
  const { setPlayerAvatar, setPlayerName, setIsHost } = useContext(PlayerContext);
  const [localHost, setLocalHost] = useState(false);

  useEffect(() => {
    if (rtcConnected) {
      setPlayerName(uname);
      setIsHost(isHost);
      setLocalHost(isHost);
      dataChannel.current.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log("Received Message:", message);

        if (message.type === "avatar_good") {
          setAvatarId(message.message);
          setPlayerAvatar(message.message);
        } else if (message.type === "took_avatar") {
          let list = JSON.parse(message.message)['list'];
          setChosenAvatars(list);
        }  else if (message.type === "Host") {
          setLocalHost(true);
        }
      
      }
    }
    return () => {
      if (rtcConnected) {
        dataChannel.current.onmessage = null;
      }
      setAvatarId(null);
      setChosenAvatars([]);
    }
  }, [])

  if(!rtcConnected) {
    return
  }

  const avatarIds = [1, 2, 3, 4, 5, 6];

  const handleAvatarSelect = (clickedAvatarId) => {
    if (avatarId == String(clickedAvatarId))
    {
        sendChannelMessage({ type: "take_avatar", message: 0 }); 
    } else if (!chosenAvatars.includes(clickedAvatarId)) {
        sendChannelMessage({ type: "take_avatar", message: clickedAvatarId });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <div className="text-6xl font-bold mb-4 text-white text-center">
        {avatarId ? `You chose: ${avatarId}` : "Choose your character"}
      </div>
      <div className="text-3xl mb-8 text-white">Choose your character</div>
      <div className="grid grid-cols-3 gap-4">
        {avatarIds.map((listAvatarId) => (
          <button
            key={listAvatarId}
            onClick={() => handleAvatarSelect(listAvatarId)}
            className={`w-24 h-24 text-2xl font-bold flex items-center justify-center rounded-lg
                ${
                    chosenAvatars.includes(listAvatarId) && listAvatarId != avatarId
                    ? "bg-gray-300 cursor-not-allowed"
                    : ( avatarId == listAvatarId ? "bg-green-500 text-white cursor-pointer hover:bg-green-600" : "bg-blue-500 text-white cursor-pointer hover:bg-blue-600")
                }`}
            disabled={chosenAvatars.includes(listAvatarId) && listAvatarId != avatarId}
          >
            {listAvatarId}
          </button>
        ))}
      </div>
      <div>
        {localHost ?
        <button className="mt-8 bg-blue-500 text-white text-2xl font-bold px-4 py-2 rounded-lg hover:bg-blue-600" onClick={() => sendChannelMessage({ type: "start_game", message: "" })}>
          Start Game
        </button>
        : null }
      </div>
    </div>
  );
}

export default ChooseAvatar;
