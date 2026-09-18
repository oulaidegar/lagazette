"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/search");
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-9 px-2.5 text-xs sm:text-sm font-medium"
            aria-label="Return to search results"
        >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Search</span>
        </Button>
    );
}
