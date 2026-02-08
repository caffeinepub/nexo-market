import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts, useGetAllOrders, useAddAdminByPrincipal, useAddAdminByEmail } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import RequireRole from '@/components/auth/RequireRole';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, DollarSign, Plus, Shield, Copy, Check, Loader2, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: products } = useGetAllProducts();
  const { data: orders } = useGetAllOrders();
  const addAdminByPrincipal = useAddAdminByPrincipal();
  const addAdminByEmail = useAddAdminByEmail();

  const [principalInput, setPrincipalInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);

  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  const currentPrincipal = identity?.getPrincipal().toString() || '';

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(currentPrincipal);
    setCopiedPrincipal(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopiedPrincipal(false), 2000);
  };

  const handleAssignAdminByPrincipal = async () => {
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await addAdminByPrincipal.mutateAsync(principal);
      toast.success('Admin role assigned successfully');
      setPrincipalInput('');
    } catch (error: any) {
      if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid principal ID format');
      } else if (error.message?.includes('Unauthorized') || error.message?.includes('Not authorized')) {
        toast.error('You do not have permission to grant admin access');
      } else {
        toast.error(error.message || 'Failed to assign admin role');
      }
    }
  };

  const handleAssignAdminByEmail = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await addAdminByEmail.mutateAsync(emailInput.trim());
      toast.success('Admin role assigned successfully');
      setEmailInput('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to assign admin role';
      if (errorMessage.includes('No user profile found')) {
        toast.error(
          'No user found with that email. The target user must sign in and complete profile setup with this email address before they can be granted admin privileges.',
          { duration: 6000 }
        );
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('Not authorized')) {
        toast.error('You do not have permission to grant admin access');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <RequireRole role="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Button
            onClick={() => navigate({ to: '/admin/products/new' })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate({ to: '/admin/products' })}
                variant="outline"
                className="w-full justify-start"
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
              <Button
                onClick={() => navigate({ to: '/admin/products/new' })}
                variant="outline"
                className="w-full justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </CardContent>
          </Card>

          {/* Admin Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Setup
              </CardTitle>
              <CardDescription>
                Manage administrator access for your e-commerce platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Admin Principal */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Principal ID</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentPrincipal}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPrincipal}
                  >
                    {copiedPrincipal ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You are currently signed in as an administrator
                </p>
              </div>

              {/* Assign Admin Role - Tabs for Principal or Email */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Grant Admin Access</Label>
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">
                      <Mail className="h-4 w-4 mr-2" />
                      By Email
                    </TabsTrigger>
                    <TabsTrigger value="principal">
                      <User className="h-4 w-4 mr-2" />
                      By Principal
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                      <Button
                        onClick={handleAssignAdminByEmail}
                        disabled={addAdminByEmail.isPending || !emailInput.trim()}
                      >
                        {addAdminByEmail.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Assign'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The target user must sign in and complete profile setup with this email address before admin privileges can be granted.
                    </p>
                  </TabsContent>
                  <TabsContent value="principal" className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter principal ID..."
                        value={principalInput}
                        onChange={(e) => setPrincipalInput(e.target.value)}
                        className="font-mono text-xs"
                      />
                      <Button
                        onClick={handleAssignAdminByPrincipal}
                        disabled={addAdminByPrincipal.isPending || !principalInput.trim()}
                      >
                        {addAdminByPrincipal.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Assign'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Grant admin access directly using a user's Principal ID
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireRole>
  );
}
