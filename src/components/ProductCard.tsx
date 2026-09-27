import type { Product } from "../data/mock";
import Icon from "./Icon";
import { Button, formatNumber } from "./ui";

export default function ProductCard({ product, onOpen, onAdd }: { product: Product; onOpen: () => void; onAdd: () => void }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return (
    <div className="product-card">
      <Button className="block w-full text-right" onClick={onOpen} label={`مشاهده ${product.name}`}>
        <div className="product-image-wrap">
          <img className="product-image" src={product.image} alt={product.name} />
          <span className="product-badge">{product.badge}</span>
          {discount > 0 && <span className="discount-badge">{formatNumber(discount)}٪ تخفیف</span>}
        </div>
        <div className="p-5">
          <div className="text-xs font-bold text-brand">فروش مستقیم گروه حنیفی</div>
          <div className="mt-2 font-black">{product.name}</div>
          <div className="mt-1 text-xs text-muted">{product.model}</div>
          <div className="mt-5">
            {product.oldPrice && <div className="old-price">{formatNumber(product.oldPrice)} تومان</div>}
            <div className="mt-1 text-lg font-black">{formatNumber(product.price)} <span className="text-xs font-medium text-muted">تومان</span></div>
          </div>
        </div>
      </Button>
      <Button className="add-button absolute bottom-4 left-4" onClick={onAdd} label={`افزودن ${product.name} به سبد`}><Icon name="bag" /></Button>
    </div>
  );
}
