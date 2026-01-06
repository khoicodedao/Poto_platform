"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageCircle,
    X,
    Send,
    Mic,
    Volume2,
    Loader2,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface Topic {
    id: number;
    title: string;
    description: string;
}

interface AIChatBubbleProps {
    classId: number;
    studentId: number;
}

export function AIChatBubble({ classId, studentId }: AIChatBubbleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Fetch topics when chat opens
    useEffect(() => {
        if (isOpen && classId) {
            fetchTopics();
        }
    }, [isOpen, classId]);

    // Fetch messages when topic changes
    useEffect(() => {
        if (selectedTopic) {
            fetchMessages();
        }
    }, [selectedTopic]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchTopics = async () => {
        try {
            const response = await fetch(`/api/ai-chat/topics?classId=${classId}`);
            const data = await response.json();
            setTopics(data.topics || []);
        } catch (error) {
            console.error("Failed to fetch topics:", error);
        }
    };

    const fetchMessages = async () => {
        if (!selectedTopic) return;
        try {
            const response = await fetch(
                `/api/ai-chat/messages?topicId=${selectedTopic}`
            );
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || !selectedTopic) return;

        const userMessage: Message = {
            id: Date.now(),
            role: "user",
            content,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai-chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topicId: selectedTopic,
                    content,
                }),
            });

            const data = await response.json();
            if (data.message) {
                setMessages((prev) => [...prev, data.message]);

                // Auto-speak the response
                speakText(data.message.content);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Failed to start recording:", error);
            alert("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            // Use Web Speech API for recognition
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = "vi-VN";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                sendMessage(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                alert("Không thể nhận dạng giọng nói. Vui lòng thử lại.");
            };

            recognition.start();
        } catch (error) {
            console.error("Failed to transcribe audio:", error);
            alert("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
        }
    };

    const speakText = async (text: string) => {
        try {
            // Try to use Google TTS API first
            const response = await fetch("/api/ai-chat/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.audioContent && !data.useClientTTS) {
                // Play audio from Google TTS
                const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
                setIsSpeaking(true);
                audio.onended = () => setIsSpeaking(false);
                audio.play();
            } else {
                // Fallback to Web Speech API
                if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = "vi-VN";
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;
                    utterance.volume = 1.0;

                    utterance.onstart = () => setIsSpeaking(true);
                    utterance.onend = () => setIsSpeaking(false);

                    speechSynthesisRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                }
            }
        } catch (error) {
            console.error("Failed to speak text:", error);
        }
    };

    const stopSpeaking = () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return (
        <>
            {/* Chat Bubble Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="lg"
                        className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 hover:scale-110 group"
                    >
                        <Sparkles className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
                        <span className="sr-only">Open AI Chat</span>
                    </Button>
                )}

                {/* Chat Window */}
                {isOpen && (
                    <Card className="w-[400px] h-[600px] shadow-2xl flex flex-col overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                <h3 className="font-semibold">AI Learning Assistant</h3>
                            </div>
                            <Button
                                onClick={() => setIsOpen(false)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Topic Selector */}
                        <div className="p-4 border-b bg-white">
                            <Select
                                value={selectedTopic?.toString()}
                                onValueChange={(value) => setSelectedTopic(parseInt(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn chủ đề để trò chuyện..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {topics.map((topic) => (
                                        <SelectItem key={topic.id} value={topic.id.toString()}>
                                            {topic.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                            {!selectedTopic ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Sparkles className="h-12 w-12 text-purple-400 mb-4" />
                                    <p className="text-gray-500 text-sm">
                                        Chọn một chủ đề để bắt đầu trò chuyện với AI
                                    </p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <MessageCircle className="h-12 w-12 text-purple-400 mb-4" />
                                    <p className="text-gray-500 text-sm">
                                        Gửi tin nhắn đầu tiên để bắt đầu!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex",
                                                message.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-2xl px-4 py-2 shadow-md",
                                                    message.role === "user"
                                                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                                                        : "bg-white text-gray-800 border border-purple-100"
                                                )}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-purple-100 rounded-2xl px-4 py-3 shadow-md">
                                                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(input);
                                        }
                                    }}
                                    placeholder="Nhập tin nhắn..."
                                    disabled={!selectedTopic || isLoading}
                                    className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                />

                                <Button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={!selectedTopic || isLoading}
                                    size="icon"
                                    variant={isRecording ? "destructive" : "outline"}
                                    className={cn(
                                        "rounded-full transition-all",
                                        isRecording && "animate-pulse"
                                    )}
                                >
                                    <Mic className="h-5 w-5" />
                                </Button>

                                <Button
                                    onClick={isSpeaking ? stopSpeaking : () => { }}
                                    disabled={!selectedTopic}
                                    size="icon"
                                    variant="outline"
                                    className={cn(
                                        "rounded-full",
                                        isSpeaking && "bg-purple-100 text-purple-600"
                                    )}
                                >
                                    <Volume2 className={cn("h-5 w-5", isSpeaking && "animate-pulse")} />
                                </Button>

                                <Button
                                    onClick={() => sendMessage(input)}
                                    disabled={!selectedTopic || !input.trim() || isLoading}
                                    size="icon"
                                    className="rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
}
