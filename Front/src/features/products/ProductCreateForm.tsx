import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { productEndpoints } from "../../api/endpoints";
import type { SaleType } from "../../types/domain";

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  imageUrls: string;
  saleType: SaleType;
};

export function ProductCreateForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: 10000,
      imageUrls: "",
      saleType: "AUCTION",
    },
  });

  const mutation = useMutation({
    mutationFn: productEndpoints.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
    },
  });

  const submit = (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      saleType: values.saleType,
      imageUrls: values.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
    };
    mutation.mutate(payload);
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
      <label>
        <span className="label">상품명</span>
        <input className="input" {...register("name", { required: true })} />
      </label>
      <label>
        <span className="label">설명</span>
        <textarea className="textarea" {...register("description", { required: true })} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="label">가격</span>
          <input className="input" type="number" min={1} {...register("price", { required: true, valueAsNumber: true })} />
        </label>
        <label>
          <span className="label">판매 방식</span>
          <select className="input" {...register("saleType")}>
            <option value="AUCTION">경매</option>
            <option value="DIRECT">직거래</option>
          </select>
        </label>
      </div>
      <label>
        <span className="label">이미지 URL</span>
        <textarea className="textarea" placeholder="한 줄에 하나씩 입력" {...register("imageUrls")} />
      </label>
      <button className="btn-primary" disabled={mutation.isPending} title="상품 등록">
        <PackagePlus size={16} />
        상품 등록
      </button>
      {mutation.isError ? <p className="text-sm font-semibold text-red-600">상품 등록에 실패했습니다.</p> : null}
    </form>
  );
}
