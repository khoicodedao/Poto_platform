"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"

interface Participant {
  id: string
  name: string
  stream?: MediaStream
}

interface VideoGridProps {
  localStream: MediaStream | null
  localVideoRef: React.RefObject<HTMLVideoElement>
  participants: Participant[]
  currentUserId: string
  currentUserName: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

export default function VideoGrid({
  localStream,
  localVideoRef,
  participants,
  currentUserId,
  currentUserName,
  isAudioEnabled,
  isVideoEnabled,
}: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full p-4">
      {/* Local Video */}
      <VideoTile
        stream={localStream}
        videoRef={localVideoRef}
        name={currentUserName}
        isLocal={true}
        hasAudio={isAudioEnabled}
        hasVideo={isVideoEnabled}
        isTeacher={false}
      />

      {/* Remote Videos */}
      {participants.map((participant) => (
        <RemoteVideoTile
          key={participant.id}
          participant={participant}
          isTeacher={participant.id.includes("teacher")}
        />
      ))}
    </div>
  )
}

interface VideoTileProps {
  stream: MediaStream | null
  videoRef?: React.RefObject<HTMLVideoElement>
  name: string
  isLocal?: boolean
  hasAudio: boolean
  hasVideo: boolean
  isTeacher: boolean
}

function VideoTile({ stream, videoRef, name, isLocal, hasAudio, hasVideo, isTeacher }: VideoTileProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const activeVideoRef = videoRef || internalVideoRef

  useEffect(() => {
    if (stream && activeVideoRef.current) {
      activeVideoRef.current.srcObject = stream
    }
  }, [stream, activeVideoRef])

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isTeacher ? "lg:col-span-2" : ""}`}>
      {hasVideo && stream ? (
        <video ref={activeVideoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="text-lg">{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">{name}</p>
          </div>
        </div>
      )}

      {/* User Info Overlay */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <div className="bg-black bg-opacity-50 rounded px-2 py-1">
          <span className="text-white text-xs font-medium">{name}</span>
        </div>
        {isTeacher && (
          <Badge variant="default" className="text-xs">
            Giáo viên
          </Badge>
        )}
        {isLocal && (
          <Badge variant="secondary" className="text-xs">
            Bạn
          </Badge>
        )}
      </div>

      {/* Audio/Video Status */}
      <div className="absolute bottom-2 right-2 flex space-x-1">
        {hasAudio ? (
          <div className="bg-green-500 rounded-full p-1">
            <Mic className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className="bg-red-500 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
        {hasVideo ? (
          <div className="bg-green-500 rounded-full p-1">
            <Video className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className="bg-red-500 rounded-full p-1">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

interface RemoteVideoTileProps {
  participant: Participant
  isTeacher: boolean
}

function RemoteVideoTile({ participant, isTeacher }: RemoteVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (participant.stream && videoRef.current) {
      videoRef.current.srcObject = participant.stream
    }
  }, [participant.stream])

  // Simulate random audio/video status for demo
  const hasAudio = Math.random() > 0.3
  const hasVideo = Math.random() > 0.4

  return (
    <VideoTile
      stream={participant.stream || null}
      videoRef={videoRef}
      name={participant.name}
      isLocal={false}
      hasAudio={hasAudio}
      hasVideo={hasVideo}
      isTeacher={isTeacher}
    />
  )
}
