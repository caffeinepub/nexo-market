export function calculateLineTotal(price: number, quantity: number): number {
  return price * quantity;
}

export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.price, item.quantity), 0);
}

export function calculateTax(subtotal: number, taxRate: number = 0.1): number {
  return subtotal * taxRate;
}

export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}
