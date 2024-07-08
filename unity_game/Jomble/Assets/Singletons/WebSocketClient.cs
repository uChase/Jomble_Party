using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;
using System;
using TMPro;


public class WebSocketClient : MonoBehaviour
{
    public static WebSocketClient Instance { get; private set; }
    private WebSocket ws;
    private readonly string serverUrl = "ws://localhost:8080?token=SECURE_CONTROLLER_TOKEN"; // Change this to  server's URL and correct token
    private Dictionary<string, Action<WebSocketMessage>> actionHandlers;
    public CreateGameHandler createGameHandler;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            actionHandlers = new Dictionary<string, Action<WebSocketMessage>>();
            InitializeActionHandlers();
        }
        else if (Instance != this)
        {
            Destroy(gameObject);
        }
    }

    void InitializeActionHandlers()
    {
        actionHandlers = new Dictionary<string, Action<WebSocketMessage>>
        {
            { "created_session", HandleCreatedSession },
            { "new_client", HandlePlayerJoined },
            { "lobby_disconnect", HandlePlayerLeftLobby },
            // Add other actions here
        };
    }

    public void ConnectToWebSocket()
    {
        ws = new WebSocket(serverUrl);

        ws.OnOpen += (sender, e) =>
        {
            Debug.Log("WebSocket connection opened.");
        };

        ws.OnMessage += (sender, e) =>
        {
            HandleMessage(e.Data);
        };


        ws.OnError += (sender, e) =>
        {
            Debug.LogError("WebSocket error: " + e.Message);
        };

        ws.OnClose += (sender, e) =>
        {
            Debug.Log("WebSocket connection closed.");
        };

        ws.Connect();
    }

    void HandleMessage(string message)
    {
        // Deserialize the JSON string into an object
        WebSocketMessage data = JsonUtility.FromJson<WebSocketMessage>(message);


        if (actionHandlers.TryGetValue(data.action, out Action<WebSocketMessage> handler))
        {
            MainThreadDispatcher.Instance.Enqueue(() => handler(data));
        }
        else
        {
            Debug.LogWarning("Unknown action: " + data.action);
        }
    }

    public void SendMessage(string action, string clientId, string payload)
    {
        WebSocketMessage message = new WebSocketMessage
        {
            action = action,
            clientId = clientId,
            payload = payload
        };

        string json = JsonUtility.ToJson(message);
        ws?.Send(json);
    }

    void OnDestroy()
    {
        ws?.Close();
    }

    public void SendEndSession()
    {
        SendMessage("end_session", "", "");
        ws?.Close();
    }

    void HandleCreatedSession(WebSocketMessage data)
    {
        Debug.Log("Game code: " + data.payload);
        try
        {
            createGameHandler.SetGameCode(data.payload);
        }
        catch (Exception ex)
        {
            Debug.LogError("Exception in HandleCreatedSession: " + ex.Message);
        }
    }

    void HandlePlayerJoined(WebSocketMessage data)
    {
        try
        {
            int index = PlayerManager.Instance.AddPlayer(new PlayerData(data.clientId, data.payload));
            if (index == -1)
            {
                Debug.LogWarning("No empty slot for player: " + data.payload);
                return;
            }
            TextMeshProUGUI textBox = GameObject.Find("Name" + (index + 1)).GetComponent<TextMeshProUGUI>();
            textBox.text = data.payload;
        }
        catch (Exception ex)
        {
            Debug.LogError("Exception in HandlePlayerJoined: " + ex.Message);
        }
    }

    void HandlePlayerLeftLobby(WebSocketMessage data)
    {
        try
        {
            PlayerData player = PlayerManager.Instance.GetPlayer(data.clientId);
            if (player == null)
            {
                Debug.LogWarning("Player not found: " + data.clientId);
                return;
            }
            int index = PlayerManager.Instance.RemovePlayer(player);
            if (index == -1)
            {
                Debug.LogWarning("Player not found: " + data.clientId);
                return;
            }
            TextMeshProUGUI textBox = GameObject.Find("Name" + (index + 1)).GetComponent<TextMeshProUGUI>();
            textBox.text = "";
        }
        catch (Exception ex)
        {
            Debug.LogError("Exception in HandlePlayerLeftLobby: " + ex.Message);
        }
    }



    public class WebSocketMessage
    {
        public string action;
        public string clientId;
        public string payload;
    }
    
}

