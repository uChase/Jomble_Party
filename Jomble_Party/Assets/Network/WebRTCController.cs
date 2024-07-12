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
        InitSocket();
    }

    private void InitSocket()
    {
        signalingWebSocket = new WebSocket(serverUrl);
        signalingWebSocket.OnMessage += OnSocketMessage;

        signalingWebSocket.OnOpen += (sender, e) =>
        {
            Debug.Log("Socket opened");
            SendCreateSessionMessage();
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
                Debug.Log("Session created: " + message.payload);
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
            OnIceCandidate = (candidate) => SendIceCandidate(candidate, clientId)
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
            Debug.Log("Data Channel Open");
            player.dataChannel.Send("Connected to data channel");
            };
        player.dataChannel.OnMessage = (message) => Debug.Log("Received message: " + message);
        player.dataChannel.OnClose = () => Debug.Log("Data Channel Closed with " + player.Name);
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

}
