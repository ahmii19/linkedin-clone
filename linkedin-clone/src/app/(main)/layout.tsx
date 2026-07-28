import { Navbar } from "@/components/shared/Navbar";
import { LeftSidebar } from "@/components/shared/LeftSidebar";
import { RightSidebar } from "@/components/shared/RightSidebar";
import { BottomNav } from "@/components/shared/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          <LeftSidebar />
          <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0 pb-20 lg:pb-6">
            {children}
          </main>
          <RightSidebar />
        </div>
      </div>
      <BottomNav />
    </>
  );
}
