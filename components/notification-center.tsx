"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  X,
  Clock,
  FileText,
  BarChart3,
  UserCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Mail,
  Send,
  Calendar,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  sentVia: string;
  createdAt: string;
  imageUrl?: string;
  read?: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const result = await response.json();
      const notificationsData = result.data || result;
      setNotifications(
        Array.isArray(notificationsData) ? notificationsData : []
      );
      setUnreadCount(
        (Array.isArray(notificationsData) ? notificationsData : []).filter(
          (n: Notification) => n.status === "pending" || !n.read
        ).length
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications(notifications.filter((n) => n.id !== notificationId));
      toast({
        title: "Thành công",
        description: "Đã xóa thông báo",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, status: "sent", read: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const readNotifications = notifications.filter(
        (n) => n.status === "sent" || n.read
      );

      if (readNotifications.length === 0) {
        toast({
          title: "Thông báo",
          description: "Không có thông báo đã đọc nào",
        });
        return;
      }

      // Delete all read notifications
      await Promise.all(
        readNotifications.map((n) =>
          fetch(`/api/notifications/${n.id}`, { method: "DELETE" })
        )
      );

      setNotifications(
        notifications.filter((n) => n.status !== "sent" && !n.read)
      );

      toast({
        title: "Thành công",
        description: `Đã xóa ${readNotifications.length} thông báo đã đọc`,
      });
    } catch (error) {
      console.error("Error deleting all read:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa thông báo",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (notificationId: number) => {
    const newExpandedId = expandedId === notificationId ? null : notificationId;
    setExpandedId(newExpandedId);

    // Auto mark as read when expanding
    if (newExpandedId !== null) {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && notification.status === "pending") {
        handleMarkAsRead(notificationId);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { className: "w-5 h-5" };

    switch (type) {
      case "reminder":
        return <Clock {...iconProps} className="w-5 h-5 text-orange-500" />;
      case "report":
        return <BarChart3 {...iconProps} className="w-5 h-5 text-green-500" />;
      case "assignment":
        return <FileText {...iconProps} className="w-5 h-5 text-blue-500" />;
      case "attendance":
        return <UserCheck {...iconProps} className="w-5 h-5 text-purple-500" />;
      case "general":
      default:
        return <MessageSquare {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "from-orange-50 to-amber-50 border-orange-200";
      case "report":
        return "from-green-50 to-emerald-50 border-green-200";
      case "assignment":
        return "from-blue-50 to-indigo-50 border-blue-200";
      case "attendance":
        return "from-purple-50 to-pink-50 border-purple-200";
      case "general":
      default:
        return "from-gray-50 to-slate-50 border-gray-200";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "app":
        return <Smartphone className="w-3 h-3" />;
      case "zalo":
        return <Send className="w-3 h-3" />;
      case "email":
        return <Mail className="w-3 h-3" />;
      default:
        return <Bell className="w-3 h-3" />;
    }
  };

  const getChannelBadge = (channel: string) => {
    const labels: { [key: string]: string } = {
      app: "App",
      zalo: "Zalo",
      email: "Email",
    };
    return labels[channel] || channel;
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative hover:bg-blue-50 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:w-[540px] flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Thông Báo
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} mới
                  </Badge>
                )}
              </SheetTitle>

              {/* Delete All Read Button */}
              {notifications.filter((n) => n.status === "sent" || n.read).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllRead}
                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Xóa đã đọc
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-auto space-y-3 mt-4 pr-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Không có thông báo nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Thông báo mới sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isExpanded = expandedId === notification.id;

                return (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-200 border-2 bg-gradient-to-br ${getTypeColor(notification.type)} ${notification.status === "pending"
                      ? "shadow-md ring-2 ring-blue-400/30"
                      : "shadow-sm hover:shadow-md"
                      }`}
                  >
                    <div className="p-4">
                      {/* Header - Always Visible */}
                      <div className="flex justify-between items-start gap-3">
                        <div
                          className="flex gap-3 flex-1 cursor-pointer"
                          onClick={() => toggleExpand(notification.id)}
                        >
                          {/* Icon */}
                          <div className="p-2 rounded-lg bg-white shadow-sm">
                            {getTypeIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                              {notification.title}
                            </h3>
                            <p className={`text-sm text-gray-600 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {notification.message}
                            </p>

                            {/* Badges Row */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                {getChannelIcon(notification.sentVia)}
                                {getChannelBadge(notification.sentVia)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(
                                  new Date(notification.createdAt),
                                  "HH:mm dd/MM/yyyy",
                                  { locale: vi }
                                )}
                              </Badge>
                              {notification.imageUrl && (
                                <Badge className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 border-purple-300">
                                  <ImageIcon className="w-3 h-3" />
                                  Có hình ảnh
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(notification.id)}
                            className="hover:bg-white/80"
                            title={isExpanded ? "Thu gọn" : "Xem chi tiết"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="hover:bg-red-100 hover:text-red-600"
                            title="Xóa"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* Full Message */}
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {notification.message}
                            </p>
                          </div>

                          {/* Image if exists */}
                          {notification.imageUrl && (
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  Hình ảnh đính kèm
                                </span>
                              </div>
                              <img
                                src={notification.imageUrl}
                                alt="Notification attachment"
                                className="w-full rounded-lg border-2 border-gray-200 shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2 rounded">
                              <span className="text-gray-500">Loại:</span>
                              <span className="ml-1 font-medium text-gray-700 capitalize">
                                {notification.type}
                              </span>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <span className="text-gray-500">Trạng thái:</span>
                              <span className="ml-1 font-medium text-gray-700">
                                {notification.status === "pending" ? "Mới" : "Đã xem"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
