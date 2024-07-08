using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class Button_Controller : MonoBehaviour
{
    public UIManager uiManager;
    public WebSocketClient webSocketClient;
    public Button back_to_main_menu_from_game_lobby;


    public void Start()
    {
        back_to_main_menu_from_game_lobby.onClick.AddListener(BackFromLobby);
    }

    void BackFromLobby()
    {
        for (int i = 1; i < 7; i++)
        {
            string id = "Name" + i.ToString();
            TextMeshProUGUI text = GameObject.Find(id).GetComponent<TextMeshProUGUI>();
            text.text = "";
        }
        webSocketClient.SendEndSession();
        PlayerManager.Instance.ClearPlayers();
        uiManager.ShowMainMenu();
    }

}
