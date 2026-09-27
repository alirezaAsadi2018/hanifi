import type { Product } from "../data/mock";
import Icon from "./Icon";
import { Button, formatDecimal, formatNumber } from "./ui";

export default function ProductCard({ product, onOpen, onAdd }: { product: Product; onOpen: () => void; onAdd: () => void }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const soldOut = product.stock === 0;
  return (
    <div className="product-card">
      <Button className="block w-full text-right" onClick={onOpen} label={`مشاهده ${product.name}`}>
        <div className="product-image-wrap">
          <img className={`product-image ${soldOut ? "grayscale" : ""}`} src={product.image} alt={product.name} />
          <span className="product-badge">{soldOut ? "ناموجود" : product.badge}</span>
          {discount > 0 && !soldOut && <span className="discount-badge">{formatNumber(discount)}٪ تخفیف</span>}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-brand">{product.brand}</span>
            <span className="flex items-center gap-1 font-bold text-amber-600">★ {formatDecimal(product.rating)}</span>
          </div>
          <div className="mt-2 font-black">{product.name}</div>
          <div className="mt-1 text-xs text-muted">{product.model}</div>
          <div className="mt-5 min-h-12">
            {soldOut ? (
              <div className="pt-5 text-sm font-black text-muted">فعلاً موجود نیست</div>
            ) : (
              <>
                {product.oldPrice && <div className="old-price">{formatNumber(product.oldPrice)} تومان</div>}
                <div className="mt-1 text-lg font-black">{formatNumber(product.price)} <span className="text-xs font-medium text-muted">تومان</span></div>
                {product.stock <= 3 && <div className="mt-1 text-xs font-bold text-red-600">فقط {formatNumber(product.stock)} عدد باقی مانده</div>}
              </>
            )}
          </div>
        </div>
      </Button>
      {!soldOut && <Button className="add-button absolute bottom-4 left-4" onClick={onAdd} label={`افزودن ${product.name} به سبد`}><Icon name="bag" /></Button>}
    </div>
  );
}
