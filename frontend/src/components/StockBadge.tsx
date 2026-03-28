interface StockBadgeProps {
  quantity: number;
  minStock: number;
}

export default function StockBadge({ quantity, minStock }: StockBadgeProps) {
  const isLow = quantity <= minStock;
  const isWarning = !isLow && quantity <= minStock * 2;

  const color = isLow
    ? 'bg-red-100 text-red-800'
    : isWarning
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {quantity} in stock
    </span>
  );
}
