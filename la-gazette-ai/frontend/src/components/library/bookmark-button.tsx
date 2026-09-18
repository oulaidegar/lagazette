'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
    legalUnitId: string;
    size?: 'sm' | 'default' | 'lg' | 'icon';
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    className?: string;
    showText?: boolean;
}

export function BookmarkButton({
    legalUnitId,
    size = 'default',
    variant = 'outline',
    className,
    showText = true
}: BookmarkButtonProps) {
    const { user, session } = useAuth();
    const router = useRouter();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await api.checkBookmarkStatus(legalUnitId, session.access_token);
                setIsBookmarked(res.is_bookmarked);
                setBookmarkId(res.bookmark_id);
            } catch (e) {
                console.error("Failed to check bookmark status", e);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [session, legalUnitId]);

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        if (!session) return;

        setToggling(true);
        try {
            if (isBookmarked && bookmarkId) {
                await api.removeBookmark(bookmarkId, session.access_token);
                setIsBookmarked(false);
                setBookmarkId(null);
            } else {
                const res = await api.addBookmark(legalUnitId, session.access_token);
                setIsBookmarked(true);
                setBookmarkId(res.id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <Button size={size} variant={variant} disabled className={className}>
                <Loader2 className="h-4 w-4 animate-spin" />
                {showText && <span className="ml-2 text-xs">...</span>}
            </Button>
        );
    }

    return (
        <Button
            size={size}
            variant={variant}
            onClick={toggleBookmark}
            className={className}
            disabled={toggling}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this document'}
        >
            {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
            )}
            {showText && <span className="ml-2">{isBookmarked ? 'Saved' : 'Save'}</span>}
        </Button>
    );
}
