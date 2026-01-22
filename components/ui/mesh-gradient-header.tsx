import React from 'react';

interface MeshGradientHeaderProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Modern Mesh Gradient Header Component
 * Features animated gradient background with floating blobs and pattern overlay
 */
export function MeshGradientHeader({ children, className = '' }: MeshGradientHeaderProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-3xl p-8 lg:p-10 shadow-2xl ${className}`}
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite'
            }}
        >
            {/* Animated Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/40 to-purple-600/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400/40 to-orange-600/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-indigo-600/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            ></div>

            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}

interface MeshGradientSectionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Mesh Gradient Section - for full-width sections like hero banners
 */
export function MeshGradientSection({ children, className = '' }: MeshGradientSectionProps) {
    return (
        <section
            className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl ${className}`}
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite'
            }}
        >
            {/* Animated Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400/30 to-orange-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            ></div>

            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </section>
    );
}
