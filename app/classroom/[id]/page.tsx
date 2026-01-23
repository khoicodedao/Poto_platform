"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle, FileText, Send, PenTool, Video } from "lucide-react";

import VideoGrid from "@/components/video-grid";
import VideoControls from "@/components/video-controls";
import { useLiveKitClassroom } from "@/hooks/use-livekit-classroom";

import {
  getChatMessages,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/actions/chat";
import { getFiles } from "@/lib/actions/files";

// Dynamic import Excalidraw để tránh lỗi SSR
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useSession();

  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [classFiles, setClassFiles] = useState<any[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Sidebar tab: chat / participants / files
  const [sidebarTab, setSidebarTab] = useState("chat");

  // Whiteboard full màn hình
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  // Auto-attendance state
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

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

  // Load chat + files
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

    // polling mỗi 4s để update chat
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

  // Auto-attendance when student joins classroom
  useEffect(() => {
    const markAutoAttendance = async () => {
      // Chỉ điểm danh khi:
      // 1. Đã kết nối vào phòng
      // 2. Chưa điểm danh
      // 3. User đã đăng nhập
      console.log("[Auto-Attendance] Check conditions:", {
        isConnected,
        attendanceMarked,
        hasUser: !!user,
        classId
      });

      if (!isConnected || attendanceMarked || !user) {
        console.log("[Auto-Attendance] Skipping - conditions not met");
        return;
      }

      console.log("[Auto-Attendance] Starting auto-attendance for classId:", classId);

      try {
        const response = await fetch(`/api/classroom/${classId}/auto-attendance`, {
          method: "POST",
        });

        console.log("[Auto-Attendance] API response status:", response.status);
        const data = await response.json();
        console.log("[Auto-Attendance] API response data:", data);

        if (data.success) {
          setAttendanceMarked(true);

          const message = data.alreadyMarked
            ? `Bạn đã được điểm danh cho buổi: ${data.sessionTitle || "buổi học này"}`
            : `✓ Điểm danh ${data.status === "late" ? "muộn" : "thành công"} cho buổi: ${data.sessionTitle || "buổi học"}${data.minutesLate > 0 ? ` (Muộn ${data.minutesLate} phút)` : ""}`;

          setAttendanceMessage({
            type: data.status === "late" ? "info" : "success",
            text: message,
          });

          console.log("[Auto-Attendance] Success! Message:", message);

          // Tự động ẩn sau 8 giây
          setTimeout(() => setAttendanceMessage(null), 8000);
        } else {
          // Không có buổi học nào đang diễn ra
          console.warn("[Auto-Attendance] Failed:", data.message || data.error);

          // Hiển thị thông báo warning cho user để debug
          setAttendanceMessage({
            type: "info",
            text: `ℹ️ ${data.message || "Không tìm thấy buổi học đang diễn ra"}`,
          });
          setTimeout(() => setAttendanceMessage(null), 8000);
        }
      } catch (error) {
        console.error("[Auto-Attendance] Error:", error);
        setAttendanceMessage({
          type: "error",
          text: `❌ Lỗi điểm danh tự động: ${error}`,
        });
        setTimeout(() => setAttendanceMessage(null), 8000);
      }
    };

    markAutoAttendance();
  }, [isConnected, attendanceMarked, classId, user]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const result = await sendChatMessage?.(classId, chatMessage);
      if (!result || !result.success) return;

      setChatMessages((prev) => result.message ? [...prev, result.message] : prev);
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
      <div className="h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-6 w-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang kết nối vào lớp học...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-120px)] flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden">
        <header className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-b border-white/10 shadow-lg">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg">
                      Lớp học trực tuyến - Phòng {params.id}
                    </h1>
                    <p className="text-blue-100 text-xs">Phiên học trực tiếp</p>
                  </div>
                </div>
                <Badge className="bg-red-500 text-white border-0 animate-pulse shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-ping" />
                  LIVE
                </Badge>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-semibold">
                  {participants.length} người
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Auto-attendance notification */}
        {attendanceMessage && (
          <div
            className={`flex-shrink-0 px-4 py-2 ${attendanceMessage.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-500"
              : attendanceMessage.type === "info"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-gradient-to-r from-red-500 to-rose-500"
              } text-white text-center text-sm font-medium animate-in slide-in-from-top duration-300 shadow-md`}
          >
            {attendanceMessage.text}
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* LEFT: video */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              <VideoGrid
                localVideoRef={localVideoRef}
                participants={participants}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
              />
            </div>

            <div className="flex-shrink-0">
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
          </div>

          {/* RIGHT: sidebar */}
          {isSidebarOpen && (
            <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-gray-200/50 flex flex-col shadow-xl min-h-0">
              <Tabs
                value={sidebarTab}
                onValueChange={async (value) => {
                  if (value === "whiteboard") {
                    setIsWhiteboardOpen(true);
                    // Tự động share màn hình khi mở bảng trắng
                    if (!isScreenSharing) {
                      await handleShareScreen();
                    }
                    // không đổi sidebarTab để vẫn giữ tab đang xem (vd: chat)
                    return;
                  }
                  setSidebarTab(value);
                }}
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-none">
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="participants"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <Users className="h-4 w-4 text-indigo-600" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <FileText className="h-4 w-4 text-purple-600" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="whiteboard"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <PenTool className="h-4 w-4 text-pink-600" />
                  </TabsTrigger>
                </TabsList>

                {/* Chat */}
                <TabsContent value="chat" className="flex-1 flex flex-col p-4 min-h-0">
                  <div className="flex-1 min-h-0 space-y-3 overflow-y-auto mb-4 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="flex space-x-2 group">
                        <Avatar className="w-8 h-8 border-2 border-blue-100">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                            {msg.userName?.[0] ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {msg.userName}
                            </span>
                            {msg.userRole === "teacher" && (
                              <Badge className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                                Giáo viên
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg rounded-tl-none p-3 border border-gray-200 group-hover:border-blue-200 transition-colors">
                            <p className="text-sm text-gray-700">
                              {msg.message}
                            </p>
                          </div>
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
                      className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                    />
                    <Button type="submit" size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                {/* Participants */}
                <TabsContent
                  value="participants"
                  className="flex-1 min-h-0 p-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
                >
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 border-2 border-indigo-100">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {p.name} {p.isLocal ? "(Bạn)" : ""}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {p.id.includes("teacher")
                              ? "Giáo viên"
                              : "Học viên"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-300" />
                        <span className="text-xs font-medium text-emerald-600">Trực tuyến</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Files */}
                <TabsContent
                  value="files"
                  className="flex-1 min-h-0 p-4 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
                >
                  {classFiles.length === 0 ? (
                    <div className="py-4">
                      <FileText className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">Chưa có tài liệu nào.</p>
                    </div>
                  ) : (
                    classFiles.map((file) => (
                      <div key={file.id} className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-white to-purple-50/30 border border-purple-100 hover:border-purple-200 hover:shadow-sm transition-all">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate"
                        >
                          {file.name}
                        </a>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* WHITEBOARD FULL MÀN HÌNH */}
      {isWhiteboardOpen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg">Bảng trắng</span>
                  <p className="text-xs text-blue-100">
                    Để chia sẻ: bấm Share Screen và chọn cửa sổ này trong LiveKit
                  </p>
                </div>
              </div>
              <div className="space-x-2">
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-md font-semibold transition-all"
                  onClick={() => setIsWhiteboardOpen(false)}
                >
                  Thoát bảng trắng
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <Excalidraw />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
