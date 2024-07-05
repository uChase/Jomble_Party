using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;
using System;


public class WebSocketClient : MonoBehaviour
{
    private WebSocket ws;
    private readonly string serverUrl = "ws://localhost:8080?token=SECURE_CONTROLLER_TOKEN"; // Change this to  server's URL and correct token
    private Dictionary<string, Action<WebSocketMessage>> actionHandlers;
    public CreateGameHandler createGameHandler;
    public MainThreadDispatcher mainThreadDispatcher;

    void Awake()
    {
        actionHandlers = new Dictionary<string, Action<WebSocketMessage>>();
        InitializeActionHandlers();
    }

    void InitializeActionHandlers()
    {
        actionHandlers = new Dictionary<string, Action<WebSocketMessage>>
        {
            { "created_session", HandleCreatedSession },
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
            MainThreadDispatcher.Enqueue(() => handler(data));
        }
        else
        {
            Debug.LogWarning("Unknown action: " + data.action);
        }
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

    public new void SendMessage(string message)
    {
        if (ws != null && ws.IsAlive)
        {
            ws.Send(message);
        }
    }

    void OnDestroy()
    {
        ws?.Close();
    }

    public class WebSocketMessage
    {
        public string action;
        public string clientId;
        public string payload;
    }
    
}

