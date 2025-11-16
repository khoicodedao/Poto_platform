"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

interface Participant {
  id: string;
  name: string;
  role: string;
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
}

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  userName: string;
  userRole?: string;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onChatMessage?: (message: any) => void;
}

export function useWebRTC({
  roomId,
  userId,
  userName,
  userRole = "student",
  onParticipantJoined,
  onParticipantLeft,
  onChatMessage,
}: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const isInitializedRef = useRef(false);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      // Thêm TURN server nếu cần (cho production)
      // {
      //   urls: "turn:your-turn-server.com:3478",
      //   username: "username",
      //   credential: "password"
      // }
    ],
  };

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }, []);
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Create peer connection
  const createPeerConnection = useCallback(
    (participantId: string) => {
      const peerConnection = new RTCPeerConnection(iceServers);

      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        console.log("Received remote stream from:", participantId);

        setParticipants((prev) => {
          const updated = new Map(prev);
          const participant = updated.get(participantId);
          if (participant) {
            participant.stream = remoteStream;
            updated.set(participantId, participant);
          }
          return updated;
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            targetId: participantId,
            senderId: userId,
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `Peer connection with ${participantId}: ${peerConnection.connectionState}`
        );

        if (peerConnection.connectionState === "failed") {
          console.log(
            `Connection failed with ${participantId}, attempting restart`
          );
          peerConnection.restartIce();
        }
      };

      peerConnections.current.set(participantId, peerConnection);
      return peerConnection;
    },
    [localStream, userId]
  );

  // Send offer to participant
  const sendOffer = useCallback(
    async (participantId: string) => {
      const peerConnection = createPeerConnection(participantId);

      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await peerConnection.setLocalDescription(offer);

        if (socketRef.current) {
          socketRef.current.emit("offer", {
            offer,
            targetId: participantId,
            senderId: userId,
          });
        }
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    },
    [createPeerConnection, userId]
  );

  // Initialize Socket.IO connection
  const initializeSocket = useCallback(() => {
    const serverUrl =
      process.env.NEXT_PUBLIC_SIGNALING_SERVER || "http://localhost:3001";

    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // Socket event handlers
    socket.on("connect", () => {
      console.log("Connected to signaling server");
      setIsConnected(true);

      // Join room
      socket.emit("join-room", {
        roomId,
        userId,
        userName,
        userRole,
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from signaling server");
      setIsConnected(false);
    });

    socket.on("room-users", (users: any[]) => {
      console.log("Current room users:", users);

      setParticipants((prev) => {
        const updated = new Map(prev);
        users.forEach((user) => {
          if (user.userId !== userId) {
            updated.set(user.userId, {
              id: user.userId,
              name: user.userName,
              role: user.userRole,
            });
          }
        });
        return updated;
      });

      // Send offers to existing users
      users.forEach((user) => {
        if (user.userId !== userId) {
          setTimeout(() => sendOffer(user.userId), 1000);
        }
      });
    });

    socket.on("user-joined", (user: any) => {
      console.log("User joined:", user);

      setParticipants((prev) => {
        const updated = new Map(prev);
        updated.set(user.userId, {
          id: user.userId,
          name: user.userName,
          role: user.userRole,
        });
        return updated;
      });

      onParticipantJoined?.({
        id: user.userId,
        name: user.userName,
        role: user.userRole,
      });

      // Send offer to new user
      setTimeout(() => sendOffer(user.userId), 1000);
    });

    socket.on("user-left", (user: any) => {
      console.log("User left:", user);

      setParticipants((prev) => {
        const updated = new Map(prev);
        updated.delete(user.userId);
        return updated;
      });

      // Close peer connection
      const peerConnection = peerConnections.current.get(user.userId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(user.userId);
      }

      onParticipantLeft?.(user.userId);
    });

    socket.on("offer", async (data: any) => {
      const { offer, senderId } = data;
      console.log("Received offer from:", senderId);

      const peerConnection = createPeerConnection(senderId);

      try {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", {
          answer,
          targetId: senderId,
          senderId: userId,
        });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("answer", async (data: any) => {
      const { answer, senderId } = data;
      console.log("Received answer from:", senderId);

      const peerConnection = peerConnections.current.get(senderId);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(answer);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      }
    });

    socket.on("ice-candidate", async (data: any) => {
      const { candidate, senderId } = data;
      console.log("Received ICE candidate from:", senderId);

      const peerConnection = peerConnections.current.get(senderId);
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    socket.on("chat-message", (message: any) => {
      console.log("Received chat message:", message);
      onChatMessage?.(message);
    });

    socket.on("user-audio-toggled", (data: any) => {
      console.log("User audio toggled:", data);
      // Update participant audio status
    });

    socket.on("user-video-toggled", (data: any) => {
      console.log("User video toggled:", data);
      // Update participant video status
    });

    return socket;
  }, [
    roomId,
    userId,
    userName,
    userRole,
    createPeerConnection,
    sendOffer,
    onParticipantJoined,
    onParticipantLeft,
    onChatMessage,
  ]);

  // Send chat message
  const sendChatMessage = useCallback(
    (message: string) => {
      if (socketRef.current) {
        socketRef.current.emit("chat-message", {
          roomId,
          message,
          userId,
          userName,
          userRole,
        });
      }
    },
    [roomId, userId, userName, userRole]
  );

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);

        if (socketRef.current) {
          socketRef.current.emit("toggle-audio", {
            roomId,
            userId,
            enabled: audioTrack.enabled,
          });
        }
      }
    }
  }, [localStream, roomId, userId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      console.log("Local stream tracks:", localStream?.getTracks());

      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);

        if (socketRef.current) {
          socketRef.current.emit("toggle-video", {
            roomId,
            userId,
            enabled: videoTrack.enabled,
          });
        }
      }
    }
  }, [localStream, roomId, userId]);

  // Share screen
  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];

      peerConnections.current.forEach((peerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);

      if (socketRef.current) {
        socketRef.current.emit("start-screen-share", {
          roomId,
          userId,
        });
      }

      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  }, [roomId, userId]);

  // Stop screen share
  const stopScreenShare = useCallback(async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = cameraStream.getVideoTracks()[0];

      // Replace screen track with camera track
      peerConnections.current.forEach((peerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }

      setLocalStream(cameraStream);
      setIsScreenSharing(false);

      if (socketRef.current) {
        socketRef.current.emit("stop-screen-share", {
          roomId,
          userId,
        });
      }
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  }, [roomId, userId]);

  // Leave room
  const leaveRoom = useCallback(() => {
    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit("leave-room");
      socketRef.current.disconnect();
    }

    setParticipants(new Map());
    setLocalStream(null);
    setIsConnected(false);
  }, [localStream]);

  // Initialize on mount
  useEffect(() => {
    if (isInitializedRef.current) return;

    const initialize = async () => {
      try {
        await initializeLocalStream();
        initializeSocket();
        isInitializedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
      }
    };

    initialize();

    return () => {
      leaveRoom();
      isInitializedRef.current = false;
    };
  }, [initializeLocalStream, initializeSocket, leaveRoom]);

  return {
    localStream,
    localVideoRef,
    participants: Array.from(participants.values()),
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    shareScreen,
    stopScreenShare,
    sendChatMessage,
    leaveRoom,
  };
}
