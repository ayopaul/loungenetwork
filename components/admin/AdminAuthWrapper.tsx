'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin-auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-auth');
    router.push('/admin');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-6">
          <h2 className="text-xl font-bold">Admin Login</h2>
          <Input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Login</Button>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <div className="flex justify-end p-4">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}