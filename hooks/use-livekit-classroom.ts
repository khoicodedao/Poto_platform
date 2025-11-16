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

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    const attachLocalVideo = () => {
      const r = roomRef.current;
      if (!r || !localVideoRef.current) return;

      try {
        // v2: dùng getTrackPublications() rồi lọc theo source/kind
        const pubs: TrackPublication[] =
          r.localParticipant.getTrackPublications();

        const videoPub = pubs.find(
          (p) => p.kind === Track.Kind.Video && p.track
        );

        if (videoPub?.track) {
          // detach cũ rồi attach lại để tránh leak
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

      // remoteParticipants: Map<string, RemoteParticipant>
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
        // 1. gọi API lấy token + url
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

        // 2. tạo Room và connect (v2)
        lkRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        await lkRoom.connect(url, token);

        roomRef.current = lkRoom;
        setRoom(lkRoom);
        setIsConnected(true);

        // 3. bật mic + cam
        await lkRoom.localParticipant.setMicrophoneEnabled(true);
        await lkRoom.localParticipant.setCameraEnabled(true);

        // 4. attach local video lần đầu
        attachLocalVideo();

        // khi local publish/replace track → re-attach
        lkRoom.localParticipant.on(ParticipantEvent.TrackPublished, () => {
          attachLocalVideo();
        });

        lkRoom.localParticipant.on(ParticipantEvent.TrackUnpublished, () => {
          attachLocalVideo();
        });

        // 5. quản lý participants
        updateParticipants();

        lkRoom.on(RoomEvent.ParticipantConnected, () => {
          updateParticipants();
        });

        lkRoom.on(RoomEvent.ParticipantDisconnected, () => {
          updateParticipants();
        });

        // nếu remote publish track video → bên VideoGrid sẽ tự attach
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

  const leaveRoom = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setParticipants([]);
  };

  return {
    room,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    localVideoRef,
  };
}
