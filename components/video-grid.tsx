"use client";

import * as React from "react";
import type { RefObject } from "react";
import { Track } from "livekit-client";
import type { ClassroomParticipant } from "@/hooks/use-livekit-classroom";

type VideoGridProps = {
  localVideoRef: RefObject<HTMLVideoElement>; // giờ không dùng nữa, nhưng giữ lại để tránh lỗi type
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
  // 1. Tìm các track share màn hình (local + remote)
  const screenShareTiles = participants
    .map((p) => {
      const pubs = p.participant.getTrackPublications();

      const screenPub = pubs.find(
        (pub) =>
          pub.source === Track.Source.ScreenShare &&
          // LocalTrackPublication: pub.track
          // RemoteTrackPublication: pub.track hoặc pub.videoTrack
          (pub as any).track
      );

      if (!screenPub) return null;

      return {
        participant: p,
        publication: screenPub,
      };
    })
    .filter(Boolean) as {
    participant: ClassroomParticipant;
    publication: any;
  }[];

  const hasScreenShare = screenShareTiles.length > 0;
  const mainScreenShare = hasScreenShare ? screenShareTiles[0] : null;

  // 2. Camera tiles (local + remote)
  const cameraTiles = participants.map((p) => {
    const pubs = p.participant.getTrackPublications();

    const cameraPub = pubs.find(
      (pub) =>
        pub.source === Track.Source.Camera &&
        ((pub as any).isSubscribed === undefined ||
          (pub as any).isSubscribed) &&
        ((pub as any).videoTrack || (pub as any).track)
    );

    return {
      participant: p,
      publication: cameraPub ?? null,
    };
  });

  // 3. Nếu có share màn hình → màn hình lớn + camera nhỏ
  if (hasScreenShare && mainScreenShare) {
    return (
      <div className="w-full h-full flex flex-col bg-black">
        {/* Màn hình share lớn */}
        <div className="flex-1 m-4 rounded-lg overflow-hidden bg-black">
          <ScreenShareTile
            participantName={mainScreenShare.participant.name}
            publication={mainScreenShare.publication}
          />
        </div>

        {/* Dãy camera thumbnail bên dưới */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          {cameraTiles.map(({ participant, publication }) => (
            <div
              key={participant.id}
              className="relative bg-gray-900 rounded-lg overflow-hidden min-w-[160px] max-w-[220px] h-32"
            >
              <CameraTile
                participant={participant}
                publication={publication}
                isLocal={participant.isLocal}
                fallbackName={
                  participant.isLocal
                    ? `${currentUserName} (Bạn)`
                    : participant.name
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Không share màn hình → grid như cũ
  const remotesOnly = participants.filter((p) => !p.isLocal);
  const local = participants.find((p) => p.isLocal) ?? null;

  return (
    <div className="w-full h-full grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 bg-black">
      {/* Local tile */}
      {local && (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <CameraTile
            participant={local}
            publication={null}
            isLocal={true}
            fallbackName={`${currentUserName} (Bạn)`}
          />
        </div>
      )}

      {/* Remote tiles */}
      {remotesOnly.map((p) => (
        <div
          key={p.id}
          className="relative bg-gray-900 rounded-lg overflow-hidden"
        >
          <CameraTile
            participant={p}
            publication={null}
            isLocal={false}
            fallbackName={p.name}
          />
        </div>
      ))}
    </div>
  );
}

/* ================== CAMERA TILE ================== */

type CameraTileProps = {
  participant: ClassroomParticipant;
  publication: any; // track camera, nếu có
  isLocal: boolean;
  fallbackName: string;
};

function CameraTile({
  participant,
  publication,
  isLocal,
  fallbackName,
}: CameraTileProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const p = participant.participant; // LocalParticipant | RemoteParticipant

    const attachVideo = () => {
      if (!videoRef.current) return;

      let pub: any = publication ?? null;

      if (!pub) {
        // Tự tìm track camera nếu không có sẵn
        const pubs = p.getTrackPublications();
        pub =
          pubs.find(
            (pp) =>
              pp.source === Track.Source.Camera &&
              ((pp as any).isSubscribed === undefined ||
                (pp as any).isSubscribed) &&
              ((pp as any).videoTrack || (pp as any).track)
          ) ?? null;
      }

      const track = pub?.videoTrack ?? pub?.track ?? null;

      if (track) {
        track.detach(videoRef.current);
        track.attach(videoRef.current);
      } else {
        videoRef.current.srcObject = null;
      }
    };

    attachVideo();

    // Cleanup detach
    return () => {
      if (!videoRef.current) return;
      const pubs = p.getTrackPublications();
      pubs.forEach((pp) => {
        (pp as any).track?.detach(videoRef.current!);
        (pp as any).videoTrack?.detach(videoRef.current!);
      });
    };
  }, [participant, publication]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // local mute để tránh echo
        className="w-full h-full object-cover bg-black"
      />

      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
        {fallbackName}
      </div>
    </>
  );
}

/* ================== SCREEN SHARE TILE ================== */

type ScreenShareTileProps = {
  participantName: string;
  publication: any; // LocalTrackPublication | RemoteTrackPublication
};

function ScreenShareTile({
  participantName,
  publication,
}: ScreenShareTileProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (!videoRef.current) return;

    const track = publication?.videoTrack ?? publication?.track;
    if (!track) {
      videoRef.current.srcObject = null;
      return;
    }

    track.attach(videoRef.current);
    return () => {
      track.detach(videoRef.current!);
    };
  }, [publication?.track, publication?.videoTrack]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-black"
      />
      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
        {participantName} đang chia sẻ màn hình
      </div>
    </div>
  );
}
