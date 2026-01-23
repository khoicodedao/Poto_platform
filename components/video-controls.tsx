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
  PanelRight, // 🆕 icon ẩn/hiện sidebar
} from "lucide-react";
import { Button } from "@/components/ui/button";

type VideoControlsProps = {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  isScreenSharing: boolean;
  participantCount: number;

  // 🆕 props để điều khiển sidebar
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;

  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleRecording: () => void;
  onToggleFullscreen: () => void;
  onLeaveCall: () => void;
  onShareScreen: () => void;
};

const VideoControls: React.FC<VideoControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isRecording,
  isFullscreen,
  isScreenSharing,
  participantCount,
  isSidebarOpen,
  onToggleSidebar,
  onToggleAudio,
  onToggleVideo,
  onToggleRecording,
  onToggleFullscreen,
  onLeaveCall,
  onShareScreen,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200">
        <div className="relative">
          <Circle className="h-3 w-3 text-emerald-500 fill-emerald-500 animate-pulse" />
          <Circle className="absolute inset-0 h-3 w-3 text-emerald-500 animate-ping opacity-75" />
        </div>
        <span className="text-sm font-semibold text-gray-700">Đang trực tuyến</span>
        <span className="mx-1 text-gray-400">•</span>
        <span className="text-sm font-medium text-gray-600">{participantCount} người</span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Toggle sidebar */}
        <Button
          size="icon"
          className={isSidebarOpen
            ? "bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
          }
          onClick={onToggleSidebar}
          aria-pressed={isSidebarOpen}
        >
          <PanelRight className="h-4 w-4" />
        </Button>

        {/* Mic */}
        <Button
          size="icon"
          className={isAudioEnabled
            ? "bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-md"
            : "bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-md"
          }
          onClick={onToggleAudio}
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>

        {/* Camera */}
        <Button
          size="icon"
          className={isVideoEnabled
            ? "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md"
            : "bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-md"
          }
          onClick={onToggleVideo}
        >
          {isVideoEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>

        {/* Recording */}
        <Button
          size="icon"
          className={isRecording
            ? "bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-md animate-pulse"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
          }
          onClick={onToggleRecording}
        >
          <Circle className={isRecording ? "h-4 w-4 fill-white" : "h-4 w-4"} />
        </Button>

        {/* Screen share */}
        <Button
          size="icon"
          className={isScreenSharing
            ? "bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
          }
          onClick={onShareScreen}
        >
          <MonitorUp className="h-4 w-4" />
        </Button>

        {/* Fullscreen */}
        <Button
          size="icon"
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        {/* Leave call */}
        <Button
          size="icon"
          className="bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 shadow-lg ml-2"
          onClick={onLeaveCall}
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VideoControls;
