"use client";

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useQuickAuth } from '@/hooks/useQuickAuth';

interface AppProps {
  title?: string;
  children: React.ReactNode;
}

export default function App({ title, children }: AppProps) {
  const { authenticatedUser, status, signIn } = useQuickAuth();

  useEffect(() => {
    // Call ready to hide splash screen once the app is loaded
    const initializeApp = async () => {
      try {
        // Check if we're in a Mini App environment
        const isInMiniApp = await sdk.isInMiniApp();
        if (isInMiniApp) {
          await sdk.actions.ready();
        }
      } catch (error) {
        console.error('Failed to initialize Mini App:', error);
      }
    };

    initializeApp();
  }, []);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-cyan-300 px-8 py-4 font-mono text-xl font-bold uppercase text-black">
          Loading...
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="mb-8 font-mono text-4xl font-black uppercase text-black">
              {title || 'MoodCaster'}
            </h1>
            <div className="mb-8 border-4 border-black bg-yellow-300 p-6">
              <p className="mb-4 font-mono text-lg font-bold text-black">
                Welcome! Sign in with your Farcaster account to create and vote on polls.
              </p>
            </div>
            <button
              onClick={signIn}
              className="border-4 border-black bg-lime-400 px-8 py-4 font-mono text-xl font-black uppercase transition-transform hover:translate-x-2 hover:translate-y-2 text-black"
            >
              Sign In with Farcaster
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render the main app
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}