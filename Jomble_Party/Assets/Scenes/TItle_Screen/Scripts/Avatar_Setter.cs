using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Avatar_Setter : MonoBehaviour
{
    public PlayerManager playerManager;
    private List<int> takenAvatars = new List<int>();

    // Start is called before the first frame update
    void Start()
    {
        WebRTCController.Instance.OnMessageReceived += HandleAvatarMessageReceived;

    }

    private void HandleAvatarMessageReceived(string type, string message, string id)
    {
        //edit this 
        if(type == "take_avatar")
        {
            int avatarId;
            PlayerData player = playerManager.GetPlayer(id);
            try
            {
                avatarId = int.Parse(message);
            }
            catch (Exception e)
            {
                Debug.LogError(e);
                return;
            }
            if(takenAvatars.Contains(avatarId))
            {
                return;
            }
            if(player == null)
            {
                return;
            } 
            if(player.AvatarId != 0)
            {
                takenAvatars.Remove(player.AvatarId);
            }
            if(avatarId != 0)
            {
                takenAvatars.Add(avatarId);
            }
            player.AvatarId = avatarId;
            WebRTCController.Instance.SendMessageToPlayer(new WebRTCController.DataChannelMessage { type="avatar_good", message=avatarId.ToString()}, id);
            WebRTCController.DataChannelMessage dataChannelMessage = new WebRTCController.DataChannelMessage { type="took_avatar", message=JsonUtility.ToJson(new ListWrapper<int>(takenAvatars))};
            WebRTCController.Instance.SendMessageToAllPlayers(dataChannelMessage);
        } else if (type == "Disconnected")
        {
            PlayerData[] players = playerManager.GetAllPlayers();
            takenAvatars.Clear();
            foreach (PlayerData player in players)
            {
                if(player != null && player.AvatarId != 0 && player.Id != id)
                {
                    takenAvatars.Add(player.AvatarId);
                }
            }
            WebRTCController.DataChannelMessage dataChannelMessage = new WebRTCController.DataChannelMessage { type="took_avatar", message=JsonUtility.ToJson(new ListWrapper<int>(takenAvatars))};
            WebRTCController.Instance.SendMessageToAllPlayers(dataChannelMessage);
        } else if (type == "Connected")
        {
            WebRTCController.DataChannelMessage dataChannelMessage = new WebRTCController.DataChannelMessage { type="took_avatar", message=JsonUtility.ToJson(new ListWrapper<int>(takenAvatars))};
            WebRTCController.Instance.SendMessageToPlayer(dataChannelMessage, id);
        }
    }

    public void ClearAvatars()
    {
        takenAvatars.Clear();
    }

    private class ListWrapper<T>
    {
        public List<T> list;

        public ListWrapper(List<T> list)
        {
            this.list = list;
        }
    }

}
