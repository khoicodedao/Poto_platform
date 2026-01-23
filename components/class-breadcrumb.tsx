import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface ClassBreadcrumbProps {
    classId: number;
    className?: string;
    currentPage: string;
    items?: BreadcrumbItem[];
}

export function ClassBreadcrumb({
    classId,
    className,
    currentPage,
    items = [],
}: ClassBreadcrumbProps) {
    return (
        <nav
            className="flex items-center text-sm font-medium text-gray-500 mb-6"
            aria-label="Breadcrumb"
        >
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
                <Home className="h-4 w-4" />
                Trang chủ
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link
                href="/classes"
                className="hover:text-indigo-600 transition-colors"
            >
                Lớp học
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link
                href={`/classes/${classId}`}
                className="hover:text-indigo-600 transition-colors max-w-[200px] truncate"
                title={className}
            >
                {className || `Lớp ${classId}`}
            </Link>
            {items.map((item, index) => (
                <span key={index} className="flex items-center">
                    <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-indigo-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-500">{item.label}</span>
                    )}
                </span>
            ))}
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">{currentPage}</span>
        </nav>
    );
}
