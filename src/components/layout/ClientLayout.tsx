'use client';

export default function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {children}
    </div>
  );
} 