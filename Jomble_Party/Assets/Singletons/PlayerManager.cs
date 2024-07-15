using UnityEngine;

public class PlayerManager : MonoBehaviour
{
    public static PlayerManager Instance { get; private set; }
    public PlayerDataScriptableObject playerDataScriptableObject;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (Instance != this)
        {
            Destroy(gameObject);
        }
        playerDataScriptableObject.ClearPlayers();
    }

    public int AddPlayer(PlayerData player)
    {
        return playerDataScriptableObject.AddPlayer(player);
    }

    public int RemovePlayer(PlayerData player)
    {
        return playerDataScriptableObject.RemovePlayer(player);
    }

    public void ClearPlayers()
    {
        playerDataScriptableObject.ClearPlayers();
    }

    public PlayerData GetPlayer(string playerId)
    {
        return playerDataScriptableObject.GetPlayer(playerId);
    }

    public int GetPlayerIndex(string playerId)
    {
        return playerDataScriptableObject.GetPlayerIndex(playerId);
    }

    public PlayerData[] GetAllPlayers()
    {
        return playerDataScriptableObject.Players;
    }
}
