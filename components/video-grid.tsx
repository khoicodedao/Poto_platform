"use client";

import * as React from "react";
import type { RefObject } from "react";
import {
  Track,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  ParticipantEvent,
} from "livekit-client";
import type { ClassroomParticipant } from "@/hooks/use-livekit-classroom";

type VideoGridProps = {
  localVideoRef: RefObject<HTMLVideoElement>;
  participants: ClassroomParticipant[];
  currentUserId: string;
  currentUserName: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
};

export default function VideoGrid({
  localVideoRef,
  participants,
  currentUserId,
  currentUserName,
}: VideoGridProps) {
  const local = participants.find((p) => p.isLocal) ?? null;
  const remotes = participants.filter((p) => !p.isLocal);

  return (
    <div className="w-full h-full grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 bg-black">
      {/* Local tile */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover bg-black"
        />
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
          {currentUserName} (Bạn)
        </div>
      </div>

      {/* Remote tiles */}
      {remotes.map((p) => (
        <RemoteVideoTile
          key={p.id}
          participant={p.participant as RemoteParticipant}
          name={p.name}
        />
      ))}
    </div>
  );
}

type RemoteVideoTileProps = {
  participant: RemoteParticipant;
  name: string;
};

function RemoteVideoTile({ participant, name }: RemoteVideoTileProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const attachVideo = () => {
      if (!videoRef.current) return;

      // Lấy tất cả publications và chỉ giữ video
      const pubs = participant
        .getTrackPublications()
        .filter(
          (p) =>
            p.kind === Track.Kind.Video &&
            (p as RemoteTrackPublication).isSubscribed &&
            (p as RemoteTrackPublication).videoTrack
        ) as RemoteTrackPublication[];

      const pub = pubs[0];
      if (pub && pub.videoTrack) {
        // detach trước để tránh leak
        pub.videoTrack.detach(videoRef.current);
        pub.videoTrack.attach(videoRef.current);
      }
    };

    const handleTrackSubscribed = (
      track: RemoteTrack,
      pub: RemoteTrackPublication
    ) => {
      if (track.kind === Track.Kind.Video) {
        attachVideo();
      }
    };

    const handleTrackUnsubscribed = (
      _track: RemoteTrack,
      _pub: RemoteTrackPublication
    ) => {
      if (!videoRef.current) return;
      // khi unsub thì clear video
      videoRef.current.srcObject = null;
    };

    attachVideo();

    participant.on(ParticipantEvent.TrackSubscribed, handleTrackSubscribed);
    participant.on(ParticipantEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    return () => {
      participant.off(ParticipantEvent.TrackSubscribed, handleTrackSubscribed);
      participant.off(
        ParticipantEvent.TrackUnsubscribed,
        handleTrackUnsubscribed
      );

      if (videoRef.current) {
        participant
          .getTrackPublications()
          .forEach((p) => p.track?.detach(videoRef.current!));
      }
    };
  }, [participant]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover bg-black"
      />
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
        {name}
      </div>
    </div>
  );
}
