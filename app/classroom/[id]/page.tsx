"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle, FileText, Send, PenTool } from "lucide-react";

import VideoGrid from "@/components/video-grid";
import VideoControls from "@/components/video-controls";
import { useLiveKitClassroom } from "@/hooks/use-livekit-classroom";

import {
  getChatMessages,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/actions/chat";
import { getFiles } from "@/lib/actions/files";

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useSession();

  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [classFiles, setClassFiles] = useState<any[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentUserId] = useState(
    () => `student-${Math.random().toString(36).slice(2, 8)}`
  );

  const currentUserName = user?.name || "No name";

  const classId = Number.parseInt(params.id);
  const roomName = `class-${classId}`;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // auto scroll chat xuống cuối
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const {
    room,
    localVideoRef,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveRoom,
  } = useLiveKitClassroom({
    roomName,
    userId: currentUserId,
    userName: currentUserName,
  });

  const startScreenRecording = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = stream;
      recordedChunksRef.current = [];

      const options: MediaRecorderOptions = {
        mimeType: "video/webm;codecs=vp9",
      };

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });

          if (blob.size === 0) {
            console.warn("No recorded data");
            return;
          }

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `class-${classId}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } finally {
          recordedChunksRef.current = [];
          screenStreamRef.current?.getTracks().forEach((track) => track.stop());
          screenStreamRef.current = null;
          setIsRecording(false);
        }
      };

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        });
      }

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
      setIsRecording(false);
    }
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      await startScreenRecording();
    } else {
      stopScreenRecording();
    }
  };

  const stopScreenRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      setIsRecording(false);
    }
  };

  // Load chat + files (và có thể polling nhẹ)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [messages, files] = await Promise.all([
          getChatMessages?.(classId) ?? Promise.resolve([]),
          getFiles?.(classId) ?? Promise.resolve([]),
        ]);

        if (!isMounted) return;

        setChatMessages(messages);
        setClassFiles(files);
      } catch (error) {
        console.error("Error loading classroom data:", error);
      }
    };

    loadData();

    // OPTIONAL: polling mỗi 4s để update chat từ người khác
    const interval = setInterval(loadData, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [classId]);

  // auto scroll xuống cuối khi có tin mới
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const result = await sendChatMessage?.(classId, chatMessage);
      if (!result || !result.success) return;

      // dùng message trả về từ server (đã có user info)
      setChatMessages((prev) => [...prev, result.message]);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLeaveCall = () => {
    leaveRoom();
    router.push("/classes");
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
    await toggleScreenShare();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
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
              {participants.length} người tham gia
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* LEFT: video */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <VideoGrid
              localVideoRef={localVideoRef}
              participants={participants}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
            />
          </div>

          <VideoControls
            isScreenSharing={isScreenSharing}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isRecording={isRecording}
            isFullscreen={isFullscreen}
            participantCount={participants.length}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleRecording={handleToggleRecording}
            onToggleFullscreen={handleToggleFullscreen}
            onLeaveCall={handleLeaveCall}
            onShareScreen={handleShareScreen}
          />
        </div>

        {/* RIGHT: sidebar */}
        {isSidebarOpen && (
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

              {/* Chat */}
              <TabsContent value="chat" className="flex-1 flex flex-col p-4">
                <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-96">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {msg.userName?.[0] ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {msg.userName}
                          </span>
                          {msg.userRole === "teacher" && (
                            <Badge variant="secondary" className="text-xs">
                              Giáo viên
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString(
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
                  <div ref={chatEndRef} />
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

              {/* Participants */}
              <TabsContent
                value="participants"
                className="flex-1 p-4 space-y-3 overflow-y-auto"
              >
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{p.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {p.name} {p.isLocal ? "(Bạn)" : ""}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {p.id.includes("teacher") ? "Giáo viên" : "Học viên"}
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

              {/* Files */}
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

              {/* Whiteboard */}
              <TabsContent
                value="whiteboard"
                className="flex-1 p-4 text-center text-gray-500 text-sm"
              >
                <p>Tính năng bảng trắng đang được phát triển.</p>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
