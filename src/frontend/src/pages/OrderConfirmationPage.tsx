import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder, useGetProducts } from '@/hooks/useQueries';
import RequireAuth from '@/components/auth/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { formatPrice } from '@/utils/pricing';
import type { Product } from '@/backend';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);
  const { data: allProducts } = useGetProducts();

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RequireAuth>
    );
  }

  if (!order) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Button onClick={() => navigate({ to: '/orders' })}>View All Orders</Button>
        </div>
      </RequireAuth>
    );
  }

  const orderItemsWithProducts = order.items.map((item) => {
    const product = allProducts?.find((p: Product) => p.id === item.productId);
    return {
      ...item,
      product,
    };
  });

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. Your order number is #{order.orderId.toString()}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {orderItemsWithProducts.map((item, index) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.product?.title || `Product #${item.productId}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity.toString()}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${formatPrice(Number(item.price) * Number(item.quantity))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Order Total</span>
                <span className="text-primary">${formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate({ to: '/orders' })}>View All Orders</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </RequireAuth>
  );
}
