import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useGetProducts, useCheckout } from '@/hooks/useQueries';
import RequireAuth from '@/components/auth/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { calculateSubtotal, calculateTax, calculateTotal, formatPrice } from '@/utils/pricing';
import type { Product } from '@/backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useGetCart();
  const { data: allProducts } = useGetProducts();
  const checkout = useCheckout();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const cartItemsWithProducts = cart?.items.map((item) => {
    const product = allProducts?.find((p: Product) => p.id === item.productId);
    return {
      ...item,
      product,
      price: product ? Number(product.price) : 0,
      quantity: Number(item.quantity),
    };
  }) || [];

  const subtotalCents = calculateSubtotal(cartItemsWithProducts);
  const taxCents = calculateTax(subtotalCents);
  const totalCents = calculateTotal(subtotalCents, taxCents);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      toast.error('Please fill in all required shipping fields');
      return;
    }

    try {
      const orderId = await checkout.mutateAsync();
      toast.success('Order placed successfully!');
      navigate({ to: `/order/${orderId}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleCheckout}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, state: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, country: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Payment will be processed securely. This is a demo checkout.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cartItemsWithProducts.map((item) => (
                      <div key={item.productId.toString()} className="flex justify-between text-sm">
                        <span className="flex-1 truncate">
                          {item.product?.title || `Product #${item.productId}`} × {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${formatPrice(subtotalCents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated tax</span>
                      <span className="font-semibold">${formatPrice(taxCents)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Order total</span>
                      <span className="text-primary">${formatPrice(totalCents)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[oklch(0.828_0.189_84.429)] hover:bg-[oklch(0.75_0.189_84.429)] text-[oklch(0.145_0_0)]"
                    size="lg"
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By placing your order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}
