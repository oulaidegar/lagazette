'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Trash2, Plus, Bookmark, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
    const { user, session, loading: authLoading } = useAuth();
    const router = useRouter();
    const [library, setLibrary] = useState<{ folders: any[]; bookmarks: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/library');
        }
    }, [user, authLoading, router]);

    const fetchLibrary = async () => {
        if (!session?.access_token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.getLibrary(session.access_token);
            setLibrary(data);
        } catch (e: any) {
            console.error("Failed to load library", e);
            setError(e?.message || "Failed to load library items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && session) {
            fetchLibrary();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, session, authLoading]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim() || !session) return;
        try {
            await api.createFolder(newFolderName, session.access_token);
            setNewFolderName('');
            setIsCreatingFolder(false);
            fetchLibrary();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session || !confirm('Delete this folder? Bookmarks in it will be un-foldered.')) return;
        try {
            await api.deleteFolder(id, session.access_token);
            if (selectedFolder === id) setSelectedFolder(null);
            fetchLibrary();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteBookmark = async (id: string) => {
        if (!session || !confirm('Remove bookmark?')) return;
        try {
            await api.removeBookmark(id, session.access_token);
            fetchLibrary();
        } catch (e) {
            console.error(e);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">Loading your personal library...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-md text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Sign in to view your Library</h1>
                <p className="text-muted-foreground mb-6">
                    Save laws, decrees, and research files for quick reference.
                </p>
                <Link href="/login?redirect=/library">
                    <Button>Sign In</Button>
                </Link>
            </div>
        );
    }

    if (error || !library) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-lg text-center">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-sm">
                    {error || "Unable to retrieve library records at this time."}
                </div>
                <div className="flex gap-4 justify-center">
                    <Button onClick={fetchLibrary}>Retry</Button>
                    <Link href="/search">
                        <Button variant="outline">Browse Gazette</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const filteredBookmarks = selectedFolder
        ? library.bookmarks.filter((b) => b.folder_id === selectedFolder)
        : library.bookmarks;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">My Library</h1>
                <Link href="/">
                    <Button variant="outline">Back to Search</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar / Folders */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Folders</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsCreatingFolder(!isCreatingFolder)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {isCreatingFolder && (
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Name"
                                className="h-8 text-sm"
                            />
                            <Button size="sm" onClick={handleCreateFolder}>Add</Button>
                        </div>
                    )}

                    <div className="space-y-1">
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${selectedFolder === null ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                }`}
                        >
                            <Bookmark className="h-4 w-4" />
                            All Bookmarks
                        </button>

                        {library.folders.map((folder) => (
                            <button
                                key={folder.id}
                                onClick={() => setSelectedFolder(folder.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group ${selectedFolder === folder.id ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Folder className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <div
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* content */}
                <div className="md:col-span-3">
                    <h2 className="font-semibold text-xl mb-4">
                        {selectedFolder ? library.folders.find(f => f.id === selectedFolder)?.name : 'All Bookmarks'}
                        <span className="ml-2 text-sm text-gray-500 font-normal">({filteredBookmarks.length})</span>
                    </h2>

                    <div className="space-y-4">
                        {filteredBookmarks.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                                <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No bookmarks in this folder</p>
                            </div>
                        ) : (
                            filteredBookmarks.map((bookmark) => (
                                <div key={bookmark.id} className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Link href={`/legal-units/${bookmark.legal_unit_id}`} className="font-medium hover:underline text-lg">
                                                {bookmark.unit_title || `Document #${bookmark.unit_number}`}
                                            </Link>
                                            <div className="text-sm text-gray-500 mt-1 flex gap-2">
                                                <span>{bookmark.unit_date}</span>
                                                <span>•</span>
                                                <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-xs">{bookmark.unit_number}</span>
                                            </div>
                                            {bookmark.note && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                                    "{bookmark.note}"
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-500"
                                            onClick={() => handleDeleteBookmark(bookmark.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
