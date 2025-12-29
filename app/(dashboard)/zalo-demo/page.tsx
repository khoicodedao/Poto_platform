/**
 * Example/Demo Page for Zalo Integration
 * 
 * This page demonstrates all Zalo components
 * You can use this for testing or as a reference
 * 
 * To use: Navigate to /zalo-demo (add route if needed)
 */

import { Suspense } from "react";
import {
    SendZaloMessageDialog,
    ZaloConnectionCard,
    ZaloTestConnection,
    CheckStudentsFollowers,
    ExportFollowersButton,
    BulkUpdateZaloIdsDialog,
    RegisteredAccountsList,
    AllFollowersList,
    ZaloTestSendForm,
} from "@/components/zalo";

// Example data
const exampleClasses = [
    { id: 1, name: "Lớp Toán 101" },
    { id: 2, name: "Lớp Lý 202" },
    { id: 3, name: "Lớp Hóa 303" },
];

export default function ZaloDemoPage() {
    return (
        <div className="container mx-auto max-w-6xl space-y-8 p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">📱 Zalo Integration Demo</h1>
                <p className="text-muted-foreground">
                    Trang demo các tính năng tích hợp Zalo OA
                </p>
            </div>

            {/* Section 0: Quick Test Send */}
            <section className="space-y-4">
                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-1">
                    <div className="rounded-lg bg-white p-4">
                        <h2 className="mb-2 text-xl font-semibold">🧪 Test Nhanh - Gửi tin đến chính bạn</h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Test gửi tin nhắn Zalo đến Zalo ID của bạn (hoạt động với FREE OA)
                        </p>
                        <ZaloTestSendForm />
                    </div>
                </div>
            </section>

            <hr className="my-8" />

            {/* Section 1: Student Features */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold">Tính năng cho Học viên</h2>
                    <p className="text-sm text-muted-foreground">
                        Kết nối tài khoản Zalo để nhận thông báo
                    </p>
                </div>
                <div className="max-w-md">
                    <Suspense fallback={<div>Loading...</div>}>
                        <ZaloConnectionCard />
                    </Suspense>
                </div>
            </section>

            <hr className="my-8" />

            {/* Section 2: Teacher Features */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold">Tính năng cho Giáo viên</h2>
                    <p className="text-sm text-muted-foreground">
                        Gửi thông báo Zalo đến học viên
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Send to class */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 font-medium">Gửi đến cả lớp</h3>
                        <SendZaloMessageDialog classes={exampleClasses} />
                    </div>

                    {/* Send to specific class */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 font-medium">Gửi đến lớp cụ thể</h3>
                        <SendZaloMessageDialog
                            classes={exampleClasses}
                            classId={1} // Pre-select class
                        />
                    </div>

                    {/* Send to individual student */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 font-medium">Gửi đến học viên cụ thể</h3>
                        <SendZaloMessageDialog
                            classes={[]}
                            recipientId={123}
                            recipientName="Nguyễn Văn A"
                        />
                    </div>
                </div>
            </section>

            <hr className="my-8" />

            {/* Section 3: Admin Features */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold">Tính năng cho Admin</h2>
                    <p className="text-sm text-muted-foreground">
                        Quản lý và test Zalo OA connection
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <ZaloTestConnection />
                    <CheckStudentsFollowers classes={exampleClasses} />
                </div>

                {/* Export & Bulk Update tools */}
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-medium">📥 Export Danh sách</h3>
                        <p className="text-sm text-muted-foreground">
                            Export Excel với thông tin students & followers
                        </p>
                        <ExportFollowersButton classes={exampleClasses} />
                    </div>

                    <div className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-medium">📤 Bulk Update</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload Excel để cập nhật Zalo IDs hàng loạt
                        </p>
                        <BulkUpdateZaloIdsDialog />
                    </div>
                </div>
            </section>

            <hr className="my-8" />

            {/* Section 4: All Followers với tính năng liên kết */}
            <section className="space-y-4">
                <AllFollowersList />
            </section>

            <hr className="my-8" />

            {/* Section 5: Registered Accounts */}
            <section className="space-y-4">
                <RegisteredAccountsList />
            </section>

            {/* Instructions */}
            <section className="rounded-lg bg-blue-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-blue-900">
                    📖 Hướng dẫn sử dụng
                </h3>
                <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex gap-2">
                        <span className="font-semibold">1.</span>
                        <span>
                            Cấu hình Zalo credentials trong <code>.env.local</code>
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-semibold">2.</span>
                        <span>
                            Đọc hướng dẫn trong file{" "}
                            <code>.agent/workflows/zalo-oa-integration.md</code>
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Test connection bằng component "Test Zalo OA Connection"</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-semibold">4.</span>
                        <span>
                            Kết nối Zalo account và thử gửi tin nhắn test
                        </span>
                    </li>
                </ol>
            </section>
        </div>
    );
}
