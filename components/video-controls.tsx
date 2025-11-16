"use client";

import type React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  MonitorUp,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type VideoControlsProps = {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleRecording: () => void;
  onToggleFullscreen: () => void;
  onLeaveCall: () => void;
  onShareScreen: () => void;
  participantCount: number;
};

const VideoControls: React.FC<VideoControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isRecording,
  isFullscreen,
  onToggleAudio,
  onToggleVideo,
  onToggleRecording,
  onToggleFullscreen,
  onLeaveCall,
  onShareScreen,
  participantCount,
}) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2 text-gray-300 text-sm">
        <Circle className="h-3 w-3 text-red-500 mr-1" />
        <span>Đang trực tuyến</span>
        <span className="mx-2">•</span>
        <span>{participantCount} người tham gia</span>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          size="icon"
          variant={isAudioEnabled ? "secondary" : "destructive"}
          onClick={onToggleAudio}
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant={isVideoEnabled ? "secondary" : "destructive"}
          onClick={onToggleVideo}
        >
          {isVideoEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant={isRecording ? "destructive" : "secondary"}
          onClick={onToggleRecording}
        >
          <Circle className="h-4 w-4" />
        </Button>

        <Button size="icon" variant="secondary" onClick={onShareScreen}>
          <MonitorUp className="h-4 w-4" />
        </Button>

        <Button size="icon" variant="secondary" onClick={onToggleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <Button size="icon" variant="destructive" onClick={onLeaveCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VideoControls;
