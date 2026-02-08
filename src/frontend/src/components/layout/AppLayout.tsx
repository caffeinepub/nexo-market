import { ReactNode } from 'react';
import TopNav from './TopNav';
import SecondaryNav from './SecondaryNav';
import Footer from './Footer';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <SecondaryNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
