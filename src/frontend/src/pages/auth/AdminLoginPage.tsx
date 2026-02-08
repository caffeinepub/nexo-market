import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile, useBootstrapOwnerAdmin } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle, Copy, Check, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const FIRST_OWNER_EMAIL = 'mohamed.afrith.s.ciet@gmail.com';
const SECOND_OWNER_EMAIL = 'afriyaafathima@gmail.com';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const bootstrapOwner = useBootstrapOwnerAdmin();

  const [copiedPrincipal, setCopiedPrincipal] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const currentPrincipal = identity?.getPrincipal().toString() || '';

  const isOwnerEmail = userProfile?.email === FIRST_OWNER_EMAIL || userProfile?.email === SECOND_OWNER_EMAIL;
  const canBootstrap = isAuthenticated && profileFetched && userProfile !== null && isOwnerEmail;

  useEffect(() => {
    if (isAuthenticated && !isCheckingAdmin) {
      if (isAdmin) {
        navigate({ to: '/admin' });
      }
    }
  }, [isAuthenticated, isAdmin, isCheckingAdmin, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(currentPrincipal);
    setCopiedPrincipal(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopiedPrincipal(false), 2000);
  };

  const handleBootstrap = async () => {
    if (!canBootstrap || !userProfile) {
      toast.error('You must complete profile setup with an authorized owner email first');
      return;
    }

    try {
      await bootstrapOwner.mutateAsync(userProfile.email);
      toast.success('Owner admin access granted successfully!');
      // The query invalidation will trigger a redirect via the useEffect
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to claim admin access';
      if (errorMessage.includes('already exists') || errorMessage.includes('Unauthorized')) {
        toast.error('An administrator already exists. Please contact an existing admin for access.');
      } else if (errorMessage.includes('No user profile found')) {
        toast.error('Please complete your profile setup with the correct email first.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Access Denied Screen for authenticated non-admins
  if (isAuthenticated && !isCheckingAdmin && !profileLoading && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have administrator permissions. Only authorized administrators can access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show Principal ID */}
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
                Share this Principal ID with an existing administrator to request access.
              </p>
            </div>

            {/* Profile Setup Instructions */}
            {!profileFetched || userProfile === null ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please complete your profile setup first. Make sure to use the email <strong>{FIRST_OWNER_EMAIL}</strong> or <strong>{SECOND_OWNER_EMAIL}</strong> if you are an authorized owner.
                </AlertDescription>
              </Alert>
            ) : !isOwnerEmail ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your profile email does not match an authorized owner email. An existing administrator must grant you access.
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Bootstrap Button (only for owner) */}
            {canBootstrap && (
              <div className="space-y-3">
                <Alert className="border-primary/50 bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    You are an authorized owner. Click below to claim administrator access.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleBootstrap}
                  disabled={bootstrapOwner.isPending}
                  className="w-full"
                  size="lg"
                >
                  {bootstrapOwner.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Claiming Admin Access...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Claim Owner Admin Access
                    </>
                  )}
                </Button>
              </div>
            )}

            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Sign In</CardTitle>
          <CardDescription>
            Sign in with your administrator account to manage products, view orders, and access admin tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This area is restricted to authorized administrators only.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || isCheckingAdmin}
            className="w-full"
            size="lg"
          >
            {isLoggingIn || isCheckingAdmin ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {isLoggingIn ? 'Signing in...' : 'Checking permissions...'}
              </>
            ) : (
              'Sign In with Internet Identity'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
