"use client";

import * as React from "react";
import type { RefObject } from "react";
import { Track, ParticipantEvent } from "livekit-client";
import type { ClassroomParticipant } from "@/hooks/use-livekit-classroom";
import { VideoOff } from "lucide-react";

type VideoGridProps = {
  localVideoRef: RefObject<HTMLVideoElement>; // không dùng nữa nhưng giữ type
  participants: ClassroomParticipant[];
  currentUserId: string;
  currentUserName: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
};

type AudioTracksProps = {
  participants: ClassroomParticipant[];
};

export default function VideoGrid({
  localVideoRef,
  participants,
  currentUserId,
  currentUserName,
}: VideoGridProps) {
  /* ================== AUDIO TRACKS ================== */
  function AudioTracks({ participants }: AudioTracksProps) {
    React.useEffect(() => {
      const attached: { track: any; el: HTMLAudioElement }[] = [];

      participants.forEach((p) => {
        const lkParticipant = p.participant;
        const pubs = lkParticipant.getTrackPublications();

        const micPub: any =
          pubs.find(
            (pp) =>
              pp.source === Track.Source.Microphone &&
              ((pp as any).isSubscribed === undefined ||
                (pp as any).isSubscribed) &&
              ((pp as any).audioTrack || (pp as any).track)
          ) ?? null;

        const audioTrack = micPub?.audioTrack ?? micPub?.track ?? null;

        // chỉ nghe người khác, không nghe lại mic của mình
        if (audioTrack && !p.isLocal) {
          const audioEl = new Audio();
          audioEl.autoplay = true;
          audioEl.muted = false;
          audioEl.controls = false;

          audioTrack.attach(audioEl);
          attached.push({ track: audioTrack, el: audioEl });
        }
      });

      return () => {
        attached.forEach(({ track, el }) => {
          try {
            track.detach(el);
          } catch (e) {
            // ignore
          }
          el.pause();
          el.srcObject = null;
          el.remove();
        });
      };
    }, [participants]);

    return null;
  }

  // 1. Tìm các track share màn hình (local + remote)
  const screenShareTiles = participants
    .map((p) => {
      const pubs = p.participant.getTrackPublications();

      const screenPub = pubs.find(
        (pub) => pub.source === Track.Source.ScreenShare && (pub as any).track
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

  const remotesOnly = participants.filter((p) => !p.isLocal);
  const local = participants.find((p) => p.isLocal) ?? null;

  // ========== LAYOUT CHUNG: audio luôn được render, main trên - thumbnails dưới ==========
  return (
    <div className="w-full h-full flex flex-col bg-black">
      <AudioTracks participants={participants} />

      {hasScreenShare && mainScreenShare ? (
        // ===== CASE CÓ SHARE MÀN HÌNH: màn hình share to nhất, camera thành thumbnail =====
        <>
          <div className="flex-1 m-4 rounded-lg overflow-hidden bg-black">
            <ScreenShareTile
              participantName={mainScreenShare.participant.name}
              publication={mainScreenShare.publication}
            />
          </div>

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
        </>
      ) : (
        // ===== CASE KHÔNG SHARE MÀN HÌNH: mình to nhất, người khác thành thumbnail dưới =====
        <>
          <div className="flex-1 m-4 rounded-lg overflow-hidden bg-gray-900">
            {local ? (
              <CameraTile
                participant={local}
                publication={null}
                isLocal={true}
                fallbackName={`${currentUserName} (Bạn)`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                Chưa kết nối camera
              </div>
            )}
          </div>

          <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
            {remotesOnly.map((p) => (
              <div
                key={p.id}
                className="relative bg-gray-900 rounded-lg overflow-hidden min-w-[160px] max-w-[220px] h-32"
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
        </>
      )}
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
  const [cameraTrack, setCameraTrack] = React.useState<any | null>(null);

  const lkParticipant = participant.participant;

  // Luôn lấy track camera MỚI NHẤT & kiểm tra mute/disable để hiện icon VideoOff đúng
  React.useEffect(() => {
    const getLatestCameraTrack = () => {
      const pubs = lkParticipant.getTrackPublications();

      let camPub: any = publication ?? null;

      if (!camPub) {
        camPub =
          pubs.find(
            (pp) =>
              pp.source === Track.Source.Camera &&
              ((pp as any).isSubscribed === undefined ||
                (pp as any).isSubscribed) &&
              ((pp as any).videoTrack || (pp as any).track)
          ) ?? null;
      }

      const track = camPub?.videoTrack ?? camPub?.track ?? null;

      if (!track) return null;

      const muted =
        (camPub as any)?.isMuted ??
        (track as any)?.isMuted ??
        (track as any)?.isEnabled === false;

      return muted ? null : track;
    };

    const updateTrack = () => {
      const latest = getLatestCameraTrack();
      setCameraTrack(latest);
    };

    // chạy lần đầu
    updateTrack();

    // lắng nghe thay đổi track (bật/tắt camera, subscribe/unsubscribe,...)
    const ev = ParticipantEvent;
    lkParticipant.on(ev.TrackPublished, updateTrack);
    lkParticipant.on(ev.TrackUnpublished, updateTrack);
    lkParticipant.on(ev.TrackSubscribed, updateTrack);
    lkParticipant.on(ev.TrackUnsubscribed, updateTrack);
    lkParticipant.on(ev.TrackMuted, updateTrack);
    lkParticipant.on(ev.TrackUnmuted, updateTrack);

    return () => {
      const ev = ParticipantEvent;
      lkParticipant.off(ev.TrackPublished, updateTrack);
      lkParticipant.off(ev.TrackUnpublished, updateTrack);
      lkParticipant.off(ev.TrackSubscribed, updateTrack);
      lkParticipant.off(ev.TrackUnsubscribed, updateTrack);
      lkParticipant.off(ev.TrackMuted, updateTrack);
      lkParticipant.off(ev.TrackUnmuted, updateTrack);
    };
  }, [lkParticipant, publication]);

  // Attach/detach vào video element
  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!cameraTrack) {
      el.srcObject = null;
      return;
    }

    try {
      cameraTrack.attach(el);
    } catch (e) {
      // ignore
    }

    return () => {
      try {
        cameraTrack.detach(el);
      } catch (e) {
        // ignore
      }
    };
  }, [cameraTrack]);

  const hasVideo = !!cameraTrack;

  return (
    <>
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover bg-black"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <VideoOff className="w-10 h-10 text-gray-500" />
        </div>
      )}

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

    try {
      track.attach(videoRef.current);
    } catch (e) {
      // ignore
    }

    return () => {
      try {
        track.detach(videoRef.current!);
      } catch (e) {
        // ignore
      }
    };
  }, [publication]);

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
