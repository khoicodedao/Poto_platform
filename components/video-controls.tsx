"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Settings,
  Maximize,
  Minimize,
  Users,
  MessageCircle,
  FileText,
  PenTool,
} from "lucide-react"

interface VideoControlsProps {
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isRecording: boolean
  isFullscreen: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleRecording: () => void
  onToggleFullscreen: () => void
  onLeaveCall: () => void
  onShareScreen?: () => void
  participantCount: number
}

export default function VideoControls({
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
}: VideoControlsProps) {
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const handleShareScreen = () => {
    setIsScreenSharing(!isScreenSharing)
    onShareScreen?.()
  }

  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700">
      <div className="flex items-center justify-between">
        {/* Left side - Call info */}
        <div className="flex items-center space-x-4 text-white">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{participantCount} người tham gia</span>
          </div>
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">Đang ghi</span>
            </div>
          )}
        </div>

        {/* Center - Main controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={onToggleAudio}
            className="rounded-full w-12 h-12"
            title={isAudioEnabled ? "Tắt mic" : "Bật mic"}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={onToggleVideo}
            className="rounded-full w-12 h-12"
            title={isVideoEnabled ? "Tắt camera" : "Bật camera"}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={handleShareScreen}
            className="rounded-full w-12 h-12"
            title="Chia sẻ màn hình"
          >
            <Share2 className="h-5 w-5" />
          </Button>

          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={onToggleRecording}
            className="rounded-full w-12 h-12"
            title={isRecording ? "Dừng ghi" : "Bắt đầu ghi"}
          >
            <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-white" : "bg-red-500"}`} />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={onLeaveCall}
            className="rounded-full w-12 h-12"
            title="Rời khỏi cuộc gọi"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>

        {/* Right side - Additional controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onToggleFullscreen}
            className="rounded-full w-10 h-10"
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="lg" className="rounded-full w-10 h-10" title="Cài đặt">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick access tabs */}
      <div className="flex items-center justify-center space-x-1 mt-3">
        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
          <MessageCircle className="h-4 w-4 mr-1" />
          Chat
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
          <Users className="h-4 w-4 mr-1" />
          Người tham gia
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
          <FileText className="h-4 w-4 mr-1" />
          Tài liệu
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
          <PenTool className="h-4 w-4 mr-1" />
          Bảng vẽ
        </Button>
      </div>
    </div>
  )
}
