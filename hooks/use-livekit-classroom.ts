"use client";

import { useEffect, useRef, useState } from "react";
import {
  Room,
  RemoteParticipant,
  LocalParticipant,
  RoomEvent,
  ParticipantEvent,
  Track,
  TrackPublication,
  LocalTrackPublication,
} from "livekit-client";

export type ClassroomParticipant = {
  id: string; // identity
  name: string;
  isLocal: boolean;
  participant: LocalParticipant | RemoteParticipant;
};

type UseLiveKitParams = {
  roomName: string;
  userId: string;
  userName: string;
};

export function useLiveKitClassroom({
  roomName,
  userId,
  userName,
}: UseLiveKitParams) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    const attachLocalVideo = () => {
      const r = roomRef.current;
      if (!r || !localVideoRef.current) return;

      try {
        const pubs: TrackPublication[] =
          r.localParticipant.getTrackPublications();

        const videoPub = pubs.find(
          (p) => p.kind === Track.Kind.Video && p.track
        );

        if (videoPub?.track) {
          videoPub.track.detach(localVideoRef.current);
          videoPub.track.attach(localVideoRef.current);
        }
      } catch (err) {
        console.error("Error attaching local video:", err);
      }
    };

    const updateParticipants = () => {
      const r = roomRef.current;
      if (!r) return;

      const list: ClassroomParticipant[] = [];

      // local
      list.push({
        id: r.localParticipant.identity,
        name: r.localParticipant.name ?? "Tôi",
        isLocal: true,
        participant: r.localParticipant,
      });

      // remote
      Array.from(r.remoteParticipants.values()).forEach((p) => {
        list.push({
          id: p.identity,
          name: p.name ?? p.identity,
          isLocal: false,
          participant: p,
        });
      });

      setParticipants(list);
    };

    let lkRoom: Room | null = null;

    const join = async () => {
      try {
        const res = await fetch("/api/livekit-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            userId,
            userName,
          }),
        });

        if (!res.ok) {
          console.error("Failed to get LiveKit token");
          return;
        }

        const { token, url } = await res.json();

        lkRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        await lkRoom.connect(url, token);

        roomRef.current = lkRoom;
        setRoom(lkRoom);
        setIsConnected(true);

        await lkRoom.localParticipant.setMicrophoneEnabled(true);
        await lkRoom.localParticipant.setCameraEnabled(true);

        attachLocalVideo();
        updateParticipants();

        // 🔁 Khi local publish/unpublish track
        lkRoom.localParticipant.on(
          ParticipantEvent.TrackPublished,
          (pub: LocalTrackPublication) => {
            // camera thay đổi → gắn lại local
            if (pub.source === Track.Source.Camera) {
              attachLocalVideo();
            }

            // bắt đầu share màn hình
            if (pub.source === Track.Source.ScreenShare) {
              setIsScreenSharing(true);

              const track = pub.track;
              if (track && track.mediaStreamTrack) {
                track.mediaStreamTrack.onended = () => {
                  setIsScreenSharing(false);
                };
              }
            }

            // cập nhật lại participants để UI re-render
            updateParticipants();
          }
        );

        lkRoom.localParticipant.on(
          ParticipantEvent.TrackUnpublished,
          (pub: LocalTrackPublication) => {
            if (pub.source === Track.Source.Camera) {
              attachLocalVideo();
            }

            if (pub.source === Track.Source.ScreenShare) {
              setIsScreenSharing(false);
            }

            updateParticipants();
          }
        );

        // 🧑‍🤝‍🧑 join/leave
        lkRoom.on(RoomEvent.ParticipantConnected, () => {
          updateParticipants();
        });

        lkRoom.on(RoomEvent.ParticipantDisconnected, () => {
          updateParticipants();
        });

        // 🆕 remote publish/unpublish track (camera/screen) → cũng re-render

        lkRoom.on(RoomEvent.TrackSubscribed, () => {
          updateParticipants();
        });

        lkRoom.on(RoomEvent.TrackUnsubscribed, () => {
          updateParticipants();
        });
      } catch (err) {
        console.error("Error connecting LiveKit:", err);
      }
    };

    join();

    return () => {
      if (lkRoom) {
        lkRoom.disconnect();
      }
      roomRef.current = null;
      setIsConnected(false);
      setParticipants([]);
      setIsScreenSharing(false);
    };
  }, [roomName, userId, userName]);

  const toggleAudio = async () => {
    if (!roomRef.current) return;
    const enabled = !isAudioEnabled;
    await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
    setIsAudioEnabled(enabled);
  };

  const toggleVideo = async () => {
    if (!roomRef.current) return;
    const enabled = !isVideoEnabled;
    await roomRef.current.localParticipant.setCameraEnabled(enabled);
    setIsVideoEnabled(enabled);
  };

  const toggleScreenShare = async () => {
    if (!roomRef.current) return;

    const target = !isScreenSharing;

    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(target);
      setIsScreenSharing(target);
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  const leaveRoom = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setParticipants([]);
    setIsScreenSharing(false);
  };

  return {
    room,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveRoom,
    localVideoRef,
  };
}
