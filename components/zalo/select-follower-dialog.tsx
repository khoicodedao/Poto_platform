"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, UserCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type ZaloFollower = {
    userId: string;
    displayName: string;
    avatar: string | null;
    isFollower: boolean;
    lastInteraction: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentName: string;
    onSelect: (zaloUserId: string, followerInfo: ZaloFollower) => void;
};

export function SelectFollowerDialog({
    open,
    onOpenChange,
    studentName,
    onSelect,
}: Props) {
    const [followers, setFollowers] = useState<ZaloFollower[]>([]);
    const [filteredFollowers, setFilteredFollowers] = useState<ZaloFollower[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFollower, setSelectedFollower] = useState<ZaloFollower | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadFollowers();
        }
    }, [open]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = followers.filter(
                (f) =>
                    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.userId.includes(searchQuery)
            );
            setFilteredFollowers(filtered);
        } else {
            setFilteredFollowers(followers);
        }
    }, [searchQuery, followers]);

    const loadFollowers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/zalo/followers-with-details");
            const data = await response.json();

            if (data.success) {
                setFollowers(data.followers || []);
                setFilteredFollowers(data.followers || []);
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách followers",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối đến server",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = () => {
        if (selectedFollower) {
            onSelect(selectedFollower.userId, selectedFollower);
            onOpenChange(false);
            setSelectedFollower(null);
            setSearchQuery("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chọn Zalo Follower</DialogTitle>
                    <DialogDescription>
                        Chọn follower từ OA để liên kết với <strong>{studentName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc Zalo ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Followers List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px] rounded-lg border">
                            <div className="p-4 space-y-2">
                                {filteredFollowers.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <UserCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Không tìm thấy follower nào</p>
                                    </div>
                                ) : (
                                    filteredFollowers.map((follower) => (
                                        <div
                                            key={follower.userId}
                                            onClick={() => setSelectedFollower(follower)}
                                            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedFollower?.userId === follower.userId
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "hover:bg-gray-50"
                                                }`}
                                        >
                                            {/* Avatar */}
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={follower.avatar || undefined} />
                                                <AvatarFallback>
                                                    {follower.displayName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <p className="font-medium">{follower.displayName}</p>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    ID: {follower.userId.substring(0, 20)}...
                                                </p>
                                                {follower.lastInteraction && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Tương tác: {follower.lastInteraction}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Selected indicator */}
                                            {selectedFollower?.userId === follower.userId && (
                                                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <svg
                                                        className="h-4 w-4 text-white"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    )}

                    {/* Summary */}
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground">
                            Tổng: <strong>{filteredFollowers.length}</strong> followers
                            {searchQuery && ` (lọc từ ${followers.length})`}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSelect} disabled={!selectedFollower}>
                        Chọn follower này
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
