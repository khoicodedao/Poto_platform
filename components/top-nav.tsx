"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import clsx from "clsx";

type TopNavProps = {
  user: AuthUser | null;
};

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/classes", label: "Lớp học" },
  { href: "/assignments", label: "Bài tập" },
  { href: "/files", label: "Tài liệu" },
];

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              E
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                EduPlatform
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Không gian học tập
              </p>
            </div>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 rounded-full bg-gray-100 px-1 py-1 text-sm font-medium text-gray-500 md:flex">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-full px-4 py-1 transition",
                    isActive
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </>
          ) : (
            <UserMenu user={user} />
          )}
        </div>
      </div>
    </header>
  );
}
