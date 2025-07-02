"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle, FileText, Send, PenTool } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWebRTC } from "@/hooks/use-webrtc";
import VideoGrid from "@/components/video-grid";
import VideoControls from "@/components/video-controls";
import { getChatMessages, sendChatMessage } from "@/lib/actions/chat";
import { getFiles } from "@/lib/actions/files";

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [classFiles, setClassFiles] = useState<any[]>([]);

  const currentUserId = "student-5";
  const currentUserName = "Minh";
  const classId = Number.parseInt(params.id);

  const {
    localStream,
    localVideoRef,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = useWebRTC({
    roomId: params.id,
    userId: currentUserId,
    userName: currentUserName,
    onParticipantJoined: (participant) => {
      console.log("Participant joined:", participant.name);
    },
    onParticipantLeft: (participantId) => {
      console.log("Participant left:", participantId);
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [messages, files] = await Promise.all([
          getChatMessages(classId),
          getFiles(classId),
        ]);
        setChatMessages(messages);
        setClassFiles(files);
      } catch (error) {
        console.error("Error loading classroom data:", error);
      }
    };

    loadData();
  }, [classId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const result = await sendChatMessage(classId, 5, chatMessage);
      if (result.success) {
        const newMessage = {
          id: result.id,
          user_name: currentUserName,
          user_role: "student",
          message: chatMessage,
          created_at: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, newMessage]);
        setChatMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLeaveCall = () => {
    leaveRoom();
    router.push("/classes");
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? "Stopping recording" : "Starting recording");
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      console.log("Screen sharing started", screenStream);
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang kết nối vào lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-semibold">
                Lớp học trực tuyến - Phòng {params.id}
              </h1>
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            </div>
            <div className="text-white text-sm">
              {participants.length + 1} người tham gia
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <VideoGrid
              localStream={localStream}
              localVideoRef={localVideoRef}
              participants={participants}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
            />
          </div>

          <VideoControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isRecording={isRecording}
            isFullscreen={isFullscreen}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleRecording={handleToggleRecording}
            onToggleFullscreen={handleToggleFullscreen}
            onLeaveCall={handleLeaveCall}
            onShareScreen={handleShareScreen}
            participantCount={participants.length + 1}
          />
        </div>

        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">
                <MessageCircle className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="participants">
                <Users className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="whiteboard">
                <PenTool className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-96">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {msg.user_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {msg.user_name}
                        </span>
                        {msg.user_role === "teacher" && (
                          <Badge variant="secondary" className="text-xs">
                            Giáo viên
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <Button type="submit" size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="participants" className="flex-1 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{currentUserName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {currentUserName} (Bạn)
                    </p>
                    <p className="text-xs text-gray-500">Học viên</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isAudioEnabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isVideoEnabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {participant.id.includes("teacher")
                          ? "Giáo viên"
                          : "Học viên"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent
              value="files"
              className="flex-1 p-4 overflow-y-auto space-y-3"
            >
              {classFiles.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có tài liệu nào.</p>
              ) : (
                classFiles.map((file) => (
                  <div key={file.id} className="text-sm border rounded p-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {file.name}
                    </a>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent
              value="whiteboard"
              className="flex-1 p-4 text-center text-gray-500 text-sm"
            >
              <p>Tính năng bảng trắng đang được phát triển.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
