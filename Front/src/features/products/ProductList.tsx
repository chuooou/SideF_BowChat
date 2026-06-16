import { useQuery } from "@tanstack/react-query";
import { ImageOff, RefreshCcw } from "lucide-react";
import { productEndpoints } from "../../api/endpoints";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import type { ProductResponse } from "../../types/domain";

interface ProductListProps {
  selectedProductId: number | null;
  onSelect: (id: number) => void;
}

export function ProductList({ selectedProductId, onSelect }: ProductListProps) {
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: productEndpoints.list });

  return (
    <section className="panel p-4">
      <SectionHeader
        title="상품"
        description="product-service의 /api/products와 연결합니다."
        action={
          <button className="btn-muted" onClick={() => productsQuery.refetch()} title="새로고침">
            <RefreshCcw size={16} />
            새로고침
          </button>
        }
      />

      {productsQuery.isLoading ? <ProductSkeleton /> : null}
      {productsQuery.isError ? <EmptyState title="상품을 불러오지 못했습니다." /> : null}
      {productsQuery.data?.length === 0 ? <EmptyState title="등록된 상품이 없습니다." /> : null}

      <div className="grid gap-3">
        {productsQuery.data?.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            selected={selectedProductId === product.id}
            onSelect={() => onSelect(product.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ProductRow({ product, selected, onSelect }: { product: ProductResponse; selected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`grid grid-cols-[72px_1fr] gap-3 rounded-lg border p-2 text-left transition hover:border-brand ${
        selected ? "border-brand bg-teal-50" : "border-line bg-white"
      }`}
      onClick={onSelect}
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-slate-100">
        {product.thumbnailUrl ? (
          <img className="h-full w-full object-cover" src={product.thumbnailUrl} alt={product.name} />
        ) : (
          <ImageOff className="text-slate-400" size={22} />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-ink">{product.name}</p>
          <StatusBadge tone={product.saleType === "AUCTION" ? "warn" : "good"}>{product.saleType}</StatusBadge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <p className="mt-2 text-sm font-bold text-brand">{product.startingPrice.toLocaleString()}원</p>
      </div>
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}
