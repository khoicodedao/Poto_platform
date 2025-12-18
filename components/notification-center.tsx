"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
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
  read?: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });

      if (!response.ok) throw new Error("Failed to update notification");

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, status: "delivered" } : n
        )
      );

      toast({
        title: "Success",
        description: "Đánh dấu đã đọc",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
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
        title: "Success",
        description: "Đã xóa thông báo",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      reminder: "🔔",
      report: "📊",
      assignment: "📝",
      attendance: "✅",
      general: "ℹ️",
    };
    return icons[type] || "📬";
  };

  const getChannelBadge = (channel: string) => {
    const labels: { [key: string]: string } = {
      app: "Ứng Dụng",
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
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:w-[500px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Thông Báo</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto space-y-3 mt-4">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có thông báo nào
              </p>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 ${
                    notification.status === "pending" ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 flex-1">
                      <span className="text-2xl">
                        {getTypeIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getChannelBadge(notification.sentVia)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(
                              new Date(notification.createdAt),
                              "HH:mm dd/MM",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
