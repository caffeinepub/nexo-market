import { useNavigate } from '@tanstack/react-router';
import { useGetOrders, useGetProducts } from '@/hooks/useQueries';
import RequireAuth from '@/components/auth/RequireAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { formatPrice } from '@/utils/pricing';
import type { OrderData, Product } from '@/backend';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetOrders();
  const { data: allProducts } = useGetProducts();

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-8">Start shopping to see your orders here!</p>
            <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: OrderData) => {
              const orderItemsWithProducts = order.items.map((item) => {
                const product = allProducts?.find((p: Product) => p.id === item.productId);
                return {
                  ...item,
                  product,
                };
              });

              return (
                <Card
                  key={order.orderId.toString()}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => navigate({ to: `/order/${order.orderId}` })}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.orderId.toString()}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${formatPrice(Number(order.total))}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {orderItemsWithProducts.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {item.product?.title || `Product #${item.productId}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity.toString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
