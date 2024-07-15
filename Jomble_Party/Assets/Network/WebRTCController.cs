using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.WebRTC;
using WebSocketSharp;
using System;

public class WebRTCController : MonoBehaviour
{
    public PlayerManager playerManager;
    public static WebRTCController Instance { get; private set; }
    private WebSocket signalingWebSocket;
    private readonly string serverUrl = "ws://localhost:8080?joinType=controller"; 
    private readonly string token = "SECURE_CONTROLLER_TOKEN";
    public MainThreadDispatcher mainThreadDispatcher;
    public string gameCode = "";
    public delegate void MessageReceivedEventHandler(string type, string message, string id);
    public event MessageReceivedEventHandler OnMessageReceived;
    public delegate void GameCodeReceivedEventHandler(string gameCode);
    public event GameCodeReceivedEventHandler OnGameCodeReceived;


    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(this);
        }
    }

    void Start()
    {
    }

    public void InitSocket()
    {
        signalingWebSocket = new WebSocket(serverUrl);
        signalingWebSocket.OnMessage += OnSocketMessage;

        signalingWebSocket.OnOpen += (sender, e) =>
        {
            Debug.Log("Socket opened");
            // SendCreateSessionMessage();
        };

        signalingWebSocket.OnError += (sender, e) =>
        {
            Debug.LogError("Socket error: " + e.Message);
        };

        signalingWebSocket.OnClose += (sender, e) =>
        {
            Debug.Log("Socket closed: " + e.Code + " - " + e.Reason);
        };

        signalingWebSocket.Connect();
    }

    private void OnSocketMessage(object sender, MessageEventArgs e)
    {
        var message = JsonUtility.FromJson<SignalingMessage>(e.Data);
        switch (message.type)
        {
            case "session_created":
                gameCode = message.payload;
                mainThreadDispatcher.Enqueue(() =>OnGameCodeReceived?.Invoke(gameCode));
                break;
            case "player_joined":
                CreatePeerConnection(message.clientId, message.payload);
                CreateDataChannel(playerManager.GetPlayer(message.clientId));
                CreateAndSendOffer(playerManager.GetPlayer(message.clientId));
                break;
            case "answer":
                var answer = new RTCSessionDescription { type = RTCSdpType.Answer, sdp = message.answer.sdp };
                playerManager.GetPlayer(message.clientId).peerConnection.SetRemoteDescription(ref answer);
                break;
            case "candidate":
                var candidate = message.candidate.ToRTCIceCandidate();
                playerManager.GetPlayer(message.clientId).peerConnection.AddIceCandidate(candidate);
                break;
            case "error":
                Debug.LogError("Error: " + message.payload);
                break;
            default:
                Debug.LogError("Unknown message type: " + message.type);
                break;
        }
    }

    public void SendCreateSessionMessage()
    {
        var message = new SignalingMessage(type: "create_session", clientId: "", payload: token);
        signalingWebSocket.Send(JsonUtility.ToJson(message));
    }


    void CreatePeerConnection(string clientId, string uname)
    {
        RTCConfiguration config = new RTCConfiguration
        {
            iceServers = new RTCIceServer[]
            {
                new RTCIceServer { urls = new string[] { "stun:stun.l.google.com:19302" } }
            }
        };
        PlayerData player = new PlayerData(clientId, uname);
        if (playerManager.AddPlayer(player) == -1)
        {
            Debug.LogError("Failed to add player");
            return;
        }


        player.peerConnection = new RTCPeerConnection(ref config)
        {
            OnIceCandidate = (candidate) => SendIceCandidate(candidate, clientId),
            OnConnectionStateChange = (state) => {
                //this is for lobby
                if (state == RTCPeerConnectionState.Failed)
                {
                    player.dataChannel?.Close();
                    player.peerConnection?.Close();
                    player.peerConnection?.Dispose();
                    string message =  JsonUtility.ToJson(new DataChannelMessage { type = "Disconnected", message = "" });
                    ReceivedMessageFromPlayer(System.Text.Encoding.UTF8.GetBytes(message), player.Id);
                }
            },
        };
    }

    void CreateDataChannel(PlayerData player)
    {
        if (player == null)
        {
            Debug.LogError("Player not found");
            return;
        }
        player.dataChannel = player.peerConnection.CreateDataChannel("dataChannel");
        player.dataChannel.OnOpen = () => {
            OnChannelOpen(player);
        };
        player.dataChannel.OnMessage = (message) => ReceivedMessageFromPlayer(message, player.Id);
        player.dataChannel.OnClose = () => {
            Debug.Log("Data Channel Closed with " + player.Name);
            string message = JsonUtility.ToJson(new DataChannelMessage { type = "Disconnected", message = "" });
            PassHost(player);
            //only delets data if game hasnt started since this will delete in ui_manager
            ReceivedMessageFromPlayer(System.Text.Encoding.UTF8.GetBytes(message), player.Id);
        };
        player.dataChannel.OnError = (error) => {
            Debug.Log("Data Channel Closed with " + player.Name);
            string message = JsonUtility.ToJson(new DataChannelMessage { type = "Disconnected", message = "" });
            PassHost(player);
            //only delets data if game hasnt started since this will delete in ui_manager
            ReceivedMessageFromPlayer(System.Text.Encoding.UTF8.GetBytes(message), player.Id);
        };
    }

    private void OnChannelOpen(PlayerData player)
    {
        Debug.Log("Data Channel Open");
        SendMessageToPlayer(new DataChannelMessage { type = "Connected", message = player.Id }, player.Id);
        PlayerData [] players = playerManager.GetAllPlayers();
        bool isHostTaken = false;
        foreach (var p in players)
        {
            if (p == null)
            {
                continue;
            }
            if (p.Id != player.Id && p.IsHost)
            {
                isHostTaken = true;
            }
        }
        if(isHostTaken == false)
        {
            player.IsHost = true;
            SendMessageToPlayer(new DataChannelMessage { type = "Host", message = "" }, player.Id);
        }
    }

    private void PassHost(PlayerData player)
    {
        if(player.IsHost == true)
        {
            PlayerData [] players = playerManager.GetAllPlayers();
            foreach (var p in players)
            {
                if (p == null)
                {
                    continue;
                }
                if (p.Id != player.Id)
                {
                    p.IsHost = true;
                    SendMessageToPlayer(new DataChannelMessage { type = "Host", message = "" }, p.Id);
                    return;
                }
            }
        }
        return;
    }

    private void ReceivedMessageFromPlayer(byte[] message, string id)
    {
        string messageJsonString = System.Text.Encoding.UTF8.GetString(message);
        string  type = JsonUtility.FromJson<DataChannelMessage>(messageJsonString).type;
        string messageString = JsonUtility.FromJson<DataChannelMessage>(messageJsonString).message;
        Debug.Log("Received message from " + id + ": " + type);

        OnMessageReceived?.Invoke(type, messageString, id);

    }

    
    public void SendMessageToAllPlayers(DataChannelMessage message)
    {
        var json = JsonUtility.ToJson(message);
        foreach (var player in playerManager.GetAllPlayers())
        {
            if (player == null)
            {
                continue;
            }
            if(player.dataChannel.ReadyState == RTCDataChannelState.Open)
            {
                player.dataChannel.Send(json);
            }
        }
    }

    public void SendMessageToPlayer(DataChannelMessage message, string clientId)
    {
        var json = JsonUtility.ToJson(message);
        var player = playerManager.GetPlayer(clientId);
        if (player == null)
        {
            Debug.LogError("Player not found");
            return;
        }
        player.dataChannel.Send(json);
    }
    

    void CreateAndSendOffer(PlayerData player)
    {
        try
        {
            if (player == null)
            {
                Debug.LogError("PlayerData is null");
                return;
            }

            if (player.peerConnection == null)
            {
                Debug.LogError("PeerConnection is null");
                return;
            }
            mainThreadDispatcher.Enqueue(() => StartCoroutine(CreateOfferCoroutine(player)));
        } catch (Exception e)
        {
            Debug.LogError(e);
        }
    }

    IEnumerator CreateOfferCoroutine(PlayerData player)
    {

        // Ensure the peer connection is created on the main thread
        yield return new WaitUntil(() => player.peerConnection != null);

        // Create the offer
        var offerOp = player.peerConnection.CreateOffer();
        yield return offerOp;

        if (offerOp.IsError)
        {
            Debug.LogError("Failed to create offer");
            yield break;
        }

        var sdpOffer = offerOp.Desc;

        // Set the local description
        var setLocalDescOp = player.peerConnection.SetLocalDescription(ref sdpOffer);
        yield return setLocalDescOp;

        if (setLocalDescOp.IsError)
        {
            Debug.LogError(setLocalDescOp.Error.message);
            Debug.LogError("Failed to set local description");
            yield break;
        }

        // Send the offer via WebSocket
        var message = new SignalingMessage(type: "offer", clientId: player.Id, offer: sdpOffer);
        signalingWebSocket.Send(JsonUtility.ToJson(message));
    }

    void SendIceCandidate(RTCIceCandidate candidate, string clientId)
    {
        var message = new SignalingMessage(type: "candidate", clientId: clientId, candidate: candidate);
        signalingWebSocket.Send(JsonUtility.ToJson(message));
    }

    void OnDestroy()
    {
        signalingWebSocket?.Close();
        ClosePeerConnections();
    }

    public void CloseConnections()
    {
        signalingWebSocket?.Close();
        ClosePeerConnections();
    }

    void ClosePeerConnections()
    {
        foreach (var player in playerManager.GetAllPlayers())
        {
            if(player == null)
            {
                continue;
            }
            player.dataChannel?.Close();
            player.peerConnection?.Close();
            player.peerConnection?.Dispose();
        }
    }



    [System.Serializable]
    public class SignalingMessage
    {
        public string type;
        public RTCSessionDescriptionJson offer;
        public RTCSessionDescriptionJson answer;
        public RTCIceCandidateJson candidate;
        public string payload;
        public string clientId;

        public SignalingMessage(string type, string clientId, RTCSessionDescription offer = default, RTCSessionDescription answer = default, RTCIceCandidate candidate = default, string payload = "")
        {
            this.type = type;
            this.clientId = clientId;
            this.offer = !EqualityComparer<RTCSessionDescription>.Default.Equals(offer, default(RTCSessionDescription)) ? new RTCSessionDescriptionJson(offer) : null;
            this.answer = !ReferenceEquals(answer, default(RTCSessionDescription)) ? new RTCSessionDescriptionJson(answer) : null;
            this.candidate = candidate != default ? new RTCIceCandidateJson(candidate) : null;
            this.payload = payload;
        }
    }

    [System.Serializable]
    public class RTCSessionDescriptionJson
    {
        public string sdp;
        public string type;
        
        public RTCSessionDescriptionJson() { }

        public RTCSessionDescriptionJson(RTCSessionDescription desc)
        {
            sdp = desc.sdp;
            type = desc.type.ToString().ToLower();
        }

        public RTCSessionDescription ToRTCSessionDescription()
        {
            return new RTCSessionDescription
            {
                sdp = this.sdp,
                type = Enum.TryParse<RTCSdpType>(this.type, true, out var result) ? result : RTCSdpType.Offer
            };
        }
    }

    [System.Serializable]
    public class RTCIceCandidateJson
    {
        public string candidate;
        public string sdpMid;
        public int sdpMLineIndex;
        
        public RTCIceCandidateJson() { }

        public RTCIceCandidateJson(RTCIceCandidate candidate)
        {
            this.candidate = candidate.Candidate;
            this.sdpMid = candidate.SdpMid;
            this.sdpMLineIndex = (int)candidate.SdpMLineIndex;
        }

        public RTCIceCandidate ToRTCIceCandidate()
        {
            return new RTCIceCandidate(new RTCIceCandidateInit
            {
                candidate = this.candidate,
                sdpMid = this.sdpMid,
                sdpMLineIndex = this.sdpMLineIndex
            });
        }
    }

    public class DataChannelMessage
    {
        public string type;
        public string message;
    }

}
