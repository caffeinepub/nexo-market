import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface AccessDeniedScreenProps {
  requiredRole?: string;
}

export default function AccessDeniedScreen({ requiredRole }: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            {requiredRole 
              ? `You don't have permission to access this page. This area is restricted to ${requiredRole}s only.`
              : "You don't have permission to access this page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/' })} className="w-full">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
