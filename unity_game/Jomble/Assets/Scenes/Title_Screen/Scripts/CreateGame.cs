using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class CreateGameHandler : MonoBehaviour
{
    public Button createGameButton;

    public UIManager uiManager;

    public TextMeshProUGUI gameCodeText;

    public WebSocketClient socket;

    void Awake()
    {
        if (uiManager == null)
        {
            uiManager = GameObject.Find("UI_Manager").GetComponent<UIManager>();
        }   
    }

    void Start()
    {
        createGameButton.onClick.AddListener(HandleCreateGame);
    }
    

    void HandleCreateGame()
    {
        //switches ui panels
        uiManager.ShowGameLobby();
        socket.ConnectToWebSocket();
        
    }

    public void SetGameCode(string gameCode)
    {
        gameCodeText.text = gameCode;
    }


}
