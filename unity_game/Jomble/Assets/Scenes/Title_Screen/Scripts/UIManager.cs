using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class UIManager : MonoBehaviour
{
    public GameObject mainMenuPanel;
    public GameObject gameLobbyPanel;
    

    void Start()
    {
        ShowMainMenu();
    }

    public void ShowMainMenu()
    {
        mainMenuPanel.SetActive(true);
        gameLobbyPanel.SetActive(false);
    }

    public void ShowGameLobby()
    {
        mainMenuPanel.SetActive(false);
        gameLobbyPanel.SetActive(true);
    }
}