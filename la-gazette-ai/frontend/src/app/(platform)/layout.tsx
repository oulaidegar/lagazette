export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full">
            {children}
        </div>
    );
}
