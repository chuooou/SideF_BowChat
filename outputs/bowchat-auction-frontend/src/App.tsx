import { Boxes, Gavel, MessageCircle, PackagePlus } from "lucide-react";
import { useState } from "react";
import { AuctionPanel } from "./features/auctions/AuctionPanel";
import { AuthPanel } from "./features/auth/AuthPanel";
import { ChatPanel } from "./features/chat/ChatPanel";
import { ProductCreateForm } from "./features/products/ProductCreateForm";
import { ProductDetailPanel } from "./features/products/ProductDetailPanel";
import { ProductList } from "./features/products/ProductList";
import { useAuthStore } from "./store/authStore";

type Tab = "market" | "auctions" | "chat";

const tabs: Array<{ id: Tab; label: string; icon: typeof Boxes }> = [
  { id: "market", label: "상품", icon: Boxes },
  { id: "auctions", label: "경매", icon: Gavel },
  { id: "chat", label: "채팅", icon: MessageCircle },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("market");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const user = useAuthStore((state) => state.user);

  const openChatRoom = (roomId: number) => {
    setActiveRoomId(roomId);
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-normal text-ink">BowChat Auction</h1>
            <p className="mt-1 text-sm text-slate-500">MSA 경매, 상품, 실시간 채팅 클라이언트</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-slate-50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`btn h-10 min-w-24 ${activeTab === tab.id ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:bg-white"}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <AuthPanel />
          <section className="panel p-4">
            <div className="mb-4 flex items-center gap-2">
              <PackagePlus size={18} className="text-brand" />
              <h2 className="text-lg font-bold">상품 등록</h2>
            </div>
            {user ? <ProductCreateForm /> : <p className="text-sm text-slate-500">로그인 후 상품을 등록할 수 있습니다.</p>}
          </section>
        </aside>

        <div className="space-y-4">
          {activeTab === "market" ? (
            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <ProductList selectedProductId={selectedProductId} onSelect={setSelectedProductId} />
              <ProductDetailPanel productId={selectedProductId} onChatRoomEnter={openChatRoom} />
            </div>
          ) : null}

          {activeTab === "auctions" ? (
            <AuctionPanel
              selectedAuctionId={selectedAuctionId}
              onSelectAuction={setSelectedAuctionId}
              onChatRoomEnter={openChatRoom}
            />
          ) : null}

          {activeTab === "chat" ? <ChatPanel activeRoomId={activeRoomId} onRoomSelect={(roomId) => setActiveRoomId(roomId || null)} /> : null}
        </div>
      </main>
    </div>
  );
}
