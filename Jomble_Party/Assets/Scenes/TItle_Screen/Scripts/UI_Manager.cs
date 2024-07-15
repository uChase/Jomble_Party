using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class UI_Manager : MonoBehaviour
{
    public GameObject TitleScreen;
    public GameObject Lobby;
    public TextMeshProUGUI gameCodeText;
    public GameObject playerList;
    

    public void Start()
    {
        TitleScreen.SetActive(true);
        Lobby.SetActive(false);
        WebRTCController.Instance.OnGameCodeReceived += HandleGameCodeReceived;
        WebRTCController.Instance.OnMessageReceived += HandleMessageConnectedReceived;

    }

    public void OpenLobby()
    {
        TitleScreen.SetActive(false);
        Lobby.SetActive(true);
    }

    public void CloseLobby()
    {
        TitleScreen.SetActive(true);
        Lobby.SetActive(false);
    }

    private void HandleGameCodeReceived(string gameCode)
    {
        gameCodeText.text = gameCode;
    }

    private void HandleMessageConnectedReceived(string type, string message, string id)
    {
        if(type == "Connected")
        {
            PlayerData player = PlayerManager.Instance.GetPlayer(id);
            int index = PlayerManager.Instance.GetPlayerIndex(id);
            if (player != null)
            {
                playerList.transform.GetChild(index).GetChild(0).GetComponent<TMP_Text>().text = player.Name;
            }
        } else if (type == "Disconnected")
        {
            int index = PlayerManager.Instance.RemovePlayer(PlayerManager.Instance.GetPlayer(id));
            playerList.transform.GetChild(index).GetChild(0).GetComponent<TMP_Text>().text = "Waiting...";
        }
    }

    public void ClearPlayerNameList()
    {
        for (int i = 0; i < playerList.transform.childCount; i++)
        {
            playerList.transform.GetChild(i).GetChild(0).GetComponent<TMP_Text>().text = "Waiting...";
        }
    }


    public void QuitGame()
    {
        Application.Quit();
    }

    void OnDestroy()
    {
        WebRTCController.Instance.OnGameCodeReceived -= HandleGameCodeReceived;
    }

    void OnDisable()
    {
        WebRTCController.Instance.OnGameCodeReceived -= HandleGameCodeReceived;
    }
}
