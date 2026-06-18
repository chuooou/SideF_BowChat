import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Gavel, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { auctionEndpoints, chatEndpoints, productEndpoints } from "../../api/endpoints";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";

type ProductDetailPanelProps = {
  productId: number | null;
  onChatRoomEnter: (roomId: number) => void;
};

type AuctionStartForm = {
  startingPrice: number;
  endTime: string;
};

export function ProductDetailPanel({ productId, onChatRoomEnter }: ProductDetailPanelProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<AuctionStartForm>({
    defaultValues: {
      startingPrice: 10000,
      endTime: "",
    },
  });

  const detailQuery = useQuery({
    queryKey: ["products", productId],
    queryFn: () => productEndpoints.detail(productId!),
    enabled: Boolean(productId),
  });

  const startAuction = useMutation({
    mutationFn: (values: AuctionStartForm) =>
      auctionEndpoints.start(productId!, {
        startingPrice: Number(values.startingPrice),
        endTime: values.endTime.replace("T", " ") + ":00",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auctions"] }),
  });

  const enterDirectChat = useMutation({
    mutationFn: () => chatEndpoints.enter({ roomType: "DIRECT", productId: productId! }),
    onSuccess: (room) => onChatRoomEnter(room.roomId),
  });

  if (!productId) {
    return (
      <section className="panel p-4">
        <EmptyState title="상품을 선택하세요" description="목록에서 상품을 고르면 상세 정보와 경매 시작 옵션이 표시됩니다." />
      </section>
    );
  }

  return (
    <section className="panel p-4">
      <SectionHeader title="상품 상세" description="판매자라면 경매를 시작할 수 있습니다." />
      {detailQuery.isLoading ? <div className="h-80 animate-pulse rounded-lg bg-slate-100" /> : null}
      {detailQuery.isError ? <EmptyState title="상품 상세를 불러오지 못했습니다." /> : null}
      {detailQuery.data ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-line bg-slate-50">
            {detailQuery.data.imageUrls[0] ? (
              <img className="h-64 w-full object-cover" src={detailQuery.data.imageUrls[0]} alt={detailQuery.data.productName} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">이미지 없음</div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold">{detailQuery.data.productName}</h3>
              <span className="chip">{detailQuery.data.saleType}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{detailQuery.data.productDescription}</p>
            <p className="mt-3 text-2xl font-black text-brand">{detailQuery.data.productPrice.toLocaleString()}원</p>
            <p className="mt-1 text-sm text-slate-500">판매자 {detailQuery.data.sellerNickname}</p>
          </div>

          <button className="btn-muted w-full" onClick={() => enterDirectChat.mutate()} disabled={enterDirectChat.isPending} title="1:1 채팅">
            <MessageCircle size={16} />
            1:1 채팅 입장
          </button>

          {detailQuery.data.saleType === "AUCTION" ? (
            <form className="rounded-lg border border-line bg-field p-3" onSubmit={handleSubmit((values) => startAuction.mutate(values))}>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Gavel size={16} />
                경매 시작
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="label">시작가</span>
                  <input className="input" type="number" min={1} {...register("startingPrice", { valueAsNumber: true, required: true })} />
                </label>
                <label>
                  <span className="label">종료 시간</span>
                  <input className="input" type="datetime-local" {...register("endTime", { required: true })} />
                </label>
              </div>
              <button className="btn-primary mt-3 w-full" disabled={startAuction.isPending} title="경매 시작">
                <Clock3 size={16} />
                시작
              </button>
              {startAuction.isError ? <p className="mt-2 text-sm font-semibold text-red-600">경매 시작에 실패했습니다.</p> : null}
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
