import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel, MessageCircle, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { auctionEndpoints, chatEndpoints } from "../../api/endpoints";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { AuctionResponse } from "../../types/domain";

interface AuctionPanelProps {
  selectedAuctionId: number | null;
  onSelectAuction: (id: number) => void;
  onChatRoomEnter: (roomId: number) => void;
}

interface BidForm {
  bidAmount: number;
}

export function AuctionPanel({ selectedAuctionId, onSelectAuction, onChatRoomEnter }: AuctionPanelProps) {
  const queryClient = useQueryClient();
  const auctionsQuery = useQuery({ queryKey: ["auctions"], queryFn: auctionEndpoints.list });
  const selectedAuction = auctionsQuery.data?.find((auction) => auction.id === selectedAuctionId) ?? auctionsQuery.data?.[0] ?? null;
  const { register, handleSubmit, reset } = useForm<BidForm>({ defaultValues: { bidAmount: 0 } });

  const bidMutation = useMutation({
    mutationFn: (values: BidForm) => auctionEndpoints.bid(selectedAuction!.id, { bidAmount: Number(values.bidAmount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      reset();
    },
  });

  const enterAuctionChat = useMutation({
    mutationFn: (auction: AuctionResponse) => chatEndpoints.enter({ roomType: "AUCTION", productId: auction.productId }),
    onSuccess: (room) => onChatRoomEnter(room.roomId),
  });

  return (
    <section className="panel p-4">
      <SectionHeader
        title="경매"
        description="auction-service의 목록/입찰 API와 연결됩니다."
        action={
          <button className="btn-muted" onClick={() => auctionsQuery.refetch()} title="새로고침">
            <RefreshCcw size={16} />
            새로고침
          </button>
        }
      />

      {auctionsQuery.isLoading ? <div className="h-48 animate-pulse rounded-lg bg-slate-100" /> : null}
      {auctionsQuery.isError ? <EmptyState title="경매를 불러오지 못했습니다." /> : null}
      {auctionsQuery.data?.length === 0 ? <EmptyState title="진행 중인 경매가 없습니다." /> : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid max-h-[520px] gap-2 overflow-auto pr-1">
          {auctionsQuery.data?.map((auction) => (
            <button
              key={auction.id}
              className={`rounded-lg border p-3 text-left transition hover:border-brand ${
                selectedAuction?.id === auction.id ? "border-brand bg-teal-50" : "border-line bg-white"
              }`}
              onClick={() => onSelectAuction(auction.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">#{auction.id}</span>
                <StatusBadge tone={auction.closed ? "danger" : "good"}>{auction.closed ? "종료" : "진행"}</StatusBadge>
              </div>
              <p className="mt-2 text-sm text-slate-500">상품 ID {auction.productId}</p>
              <p className="mt-1 text-lg font-black text-brand">{auction.currentPrice.toLocaleString()}원</p>
            </button>
          ))}
        </div>

        {selectedAuction ? (
          <div className="rounded-lg border border-line bg-field p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">경매 #{selectedAuction.id}</h3>
                <p className="text-sm text-slate-500">상품 ID {selectedAuction.productId}</p>
              </div>
              <StatusBadge tone={selectedAuction.closed ? "danger" : "good"}>{selectedAuction.closed ? "종료됨" : "입찰 가능"}</StatusBadge>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="시작가" value={`${selectedAuction.startingPrice.toLocaleString()}원`} />
              <Stat label="현재가" value={`${selectedAuction.currentPrice.toLocaleString()}원`} />
              <Stat label="종료" value={formatDate(selectedAuction.endTime)} />
              <Stat label="낙찰자" value={selectedAuction.winnerId ? String(selectedAuction.winnerId) : "-"} />
            </dl>

            <form className="mt-4 grid gap-3" onSubmit={handleSubmit((values) => bidMutation.mutate(values))}>
              <label>
                <span className="label">입찰 금액</span>
                <input
                  className="input"
                  type="number"
                  min={selectedAuction.currentPrice + 1}
                  placeholder={`${selectedAuction.currentPrice + 1000}`}
                  {...register("bidAmount", { required: true, valueAsNumber: true })}
                />
              </label>
              <button className="btn-primary" disabled={selectedAuction.closed || bidMutation.isPending} title="입찰">
                <Gavel size={16} />
                입찰
              </button>
              {bidMutation.isError ? <p className="text-sm font-semibold text-red-600">입찰에 실패했습니다.</p> : null}
            </form>

            <button className="btn-muted mt-3 w-full" onClick={() => enterAuctionChat.mutate(selectedAuction)} title="경매 채팅">
              <MessageCircle size={16} />
              경매 채팅 입장
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold text-ink">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
