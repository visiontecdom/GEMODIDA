'use client';

import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Card, CardContent } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">GEMODIDA</h1>
          <p className="text-muted-foreground mt-2">Inicia sesión en tu cuenta</p>
        </div>
        <Card>
          <CardContent>
            <AuthForm type="signin" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
