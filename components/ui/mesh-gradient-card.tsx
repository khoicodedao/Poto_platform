import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface MeshGradientCardProps {
    children: React.ReactNode;
    variant?: 'urgent' | 'warning' | 'info' | 'success';
    className?: string;
}

/**
 * Mesh Gradient Card for Alerts and Notifications
 * Provides beautiful animated backgrounds for important messages
 */
export function MeshGradientCard({ children, variant = 'info', className = '' }: MeshGradientCardProps) {
    const variantStyles = {
        urgent: {
            border: 'border-4 border-red-500',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 25%, #fb923c 50%, #dc2626 75%, #ea580c 100%)',
            blobColors: {
                blob1: 'from-red-400/40 to-orange-600/40',
                blob2: 'from-yellow-400/40 to-red-600/40',
                blob3: 'from-orange-400/40 to-pink-600/40',
            }
        },
        warning: {
            border: 'border-2 border-amber-300',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 25%, #fb923c 50%, #eab308 75%, #fbbf24 100%)',
            blobColors: {
                blob1: 'from-amber-400/30 to-orange-600/30',
                blob2: 'from-yellow-400/30 to-amber-600/30',
                blob3: 'from-orange-400/30 to-yellow-600/30',
            }
        },
        success: {
            border: 'border-2 border-emerald-300',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #34d399 50%, #14b8a6 75%, #0d9488 100%)',
            blobColors: {
                blob1: 'from-emerald-400/30 to-teal-600/30',
                blob2: 'from-green-400/30 to-emerald-600/30',
                blob3: 'from-teal-400/30 to-green-600/30',
            }
        },
        info: {
            border: 'border-2 border-blue-300',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 25%, #8b5cf6 50%, #4f46e5 75%, #7c3aed 100%)',
            blobColors: {
                blob1: 'from-blue-400/30 to-indigo-600/30',
                blob2: 'from-purple-400/30 to-blue-600/30',
                blob3: 'from-indigo-400/30 to-purple-600/30',
            }
        }
    };

    const style = variantStyles[variant];

    return (
        <div className={`relative overflow-hidden rounded-3xl shadow-2xl ${style.border} ${className}`}
            style={{
                background: style.gradient,
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite'
            }}
        >
            {/* Animated Blobs */}
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${style.blobColors.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob`}></div>
            <div className={`absolute top-0 left-0 w-80 h-80 bg-gradient-to-br ${style.blobColors.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000`}></div>
            <div className={`absolute bottom-0 left-1/2 w-80 h-80 bg-gradient-to-br ${style.blobColors.blob3} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000`}></div>

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
