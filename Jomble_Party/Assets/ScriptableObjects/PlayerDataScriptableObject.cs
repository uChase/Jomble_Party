using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Unity.WebRTC;

[CreateAssetMenu(fileName = "PlayerData", menuName = "ScriptableObjects/PlayerData", order = 1)]
public class PlayerDataScriptableObject : ScriptableObject
{
    
    [HideInInspector]
    public PlayerData[] Players = new PlayerData[6];


    public int AddPlayer(PlayerData player)
    {
        for (int i = 0; i < Players.Length; i++)
        {
            if (Players[i] == null)
            {
                Players[i] = player;
                return i;
            }
        }
        return -1;
    }

    public int RemovePlayer(PlayerData player)
    {
        for (int i = 0; i < Players.Length; i++)
        {
            if (Players[i] == player)
            {
                Players[i] = null;
                return i;
            }
        }
        return -1;
    }

    public PlayerData GetPlayer(string playerId)
    {
        return Players.FirstOrDefault(player => player != null && player.Id == playerId);
    }

    public int GetPlayerIndex(string playerId)
    {
        for (int i = 0; i < Players.Length; i++)
        {
            if (Players[i] != null && Players[i].Id == playerId)
            {
                return i;
            }
        }
        return -1;
    }

    public void ClearPlayers()
    {
        for (int i = 0; i < Players.Length; i++)
        {
            Players[i] = null;
        }
    }
}

[System.Serializable]
public class PlayerData
{
    public string Id;
    public string Name;
    public RTCPeerConnection peerConnection;
    public RTCDataChannel dataChannel;
    public bool IsHost = false;
    public int AvatarId = 0;

    public PlayerData(string id, string name)
    {
        Id = id;
        Name = name;
    }


    public override String ToString()
    {
        return Id;
    }
}
