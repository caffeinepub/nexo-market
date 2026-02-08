import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, Search, User, Shield, ShoppingBag } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCart } from '@/hooks/useQueries';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TopNav() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: cart } = useGetCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!identity;
  const cartItemCount = cart?.items.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/products', search: { q: searchQuery } });
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[oklch(0.145_0_0)] text-white">
        <div className="w-full px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/assets/generated/nexo-market-logo.dim_512x512.png"
                alt="Nexo Market"
                className="h-8 w-8"
              />
              <span className="font-bold text-lg hidden sm:inline">Nexo Market</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
              <div className="flex w-full">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none border-none bg-white text-foreground focus-visible:ring-0"
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-[oklch(0.828_0.189_84.429)] hover:bg-[oklch(0.75_0.189_84.429)] text-[oklch(0.145_0_0)]"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex flex-col items-start h-auto py-1 px-2 text-white hover:bg-white/10">
                    <span className="text-xs">Hello, {isAuthenticated ? 'User' : 'Sign in'}</span>
                    <span className="text-sm font-semibold flex items-center gap-1">
                      Account <User className="h-3 w-3" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!isAuthenticated ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate({ to: '/login' })}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Customer Sign In
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: '/login/admin' })}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Sign In
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate({ to: '/orders' })}>
                        Your Orders
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                            Admin Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: '/admin/products' })}>
                            Manage Products
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <div className="w-full">
                          <LoginButton />
                        </div>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Orders Link */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: '/orders' })}
                  className="hidden md:flex flex-col items-start h-auto py-1 px-2 text-white hover:bg-white/10"
                >
                  <span className="text-xs">Returns</span>
                  <span className="text-sm font-semibold">& Orders</span>
                </Button>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/cart' })}
                className="relative text-white hover:bg-white/10 px-2 sm:px-3"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[oklch(0.828_0.189_84.429)] text-[oklch(0.145_0_0)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
                <span className="hidden sm:inline ml-1 text-sm font-semibold">Cart</span>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link
                      to="/"
                      onClick={closeMobileMenu}
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                    >
                      Home
                    </Link>
                    <Link
                      to="/products"
                      onClick={closeMobileMenu}
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                    >
                      Products
                    </Link>
                    {!isAuthenticated ? (
                      <>
                        <div className="pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-3">Sign In</p>
                          <Button
                            onClick={() => {
                              closeMobileMenu();
                              navigate({ to: '/login' });
                            }}
                            variant="outline"
                            className="w-full justify-start mb-2"
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Customer Sign In
                          </Button>
                          <Button
                            onClick={() => {
                              closeMobileMenu();
                              navigate({ to: '/login/admin' });
                            }}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Sign In
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/orders"
                          onClick={closeMobileMenu}
                          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                        >
                          Your Orders
                        </Link>
                        <Link
                          to="/cart"
                          onClick={closeMobileMenu}
                          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                        >
                          Cart
                        </Link>
                        {isAdmin && (
                          <>
                            <div className="pt-4 border-t">
                              <p className="text-xs text-muted-foreground mb-3">Admin</p>
                              <Link
                                to="/admin"
                                onClick={closeMobileMenu}
                                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 block"
                              >
                                Admin Dashboard
                              </Link>
                              <Link
                                to="/admin/products"
                                onClick={closeMobileMenu}
                                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 block"
                              >
                                Manage Products
                              </Link>
                            </div>
                          </>
                        )}
                        <div className="pt-4 border-t">
                          <LoginButton />
                        </div>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-2">
          <form onSubmit={handleSearch} className="flex w-full">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none border-none bg-white text-foreground"
            />
            <Button
              type="submit"
              className="rounded-l-none bg-[oklch(0.828_0.189_84.429)] hover:bg-[oklch(0.75_0.189_84.429)] text-[oklch(0.145_0_0)]"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </header>
    </>
  );
}
