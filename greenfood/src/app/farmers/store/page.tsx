"use client";

import { Suspense } from 'react';
import FarmerStorefrontClient from '../[id]/FarmerStorefrontClient';

export default function FarmerStoreFallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <FarmerStorefrontClient />
    </Suspense>
  );
}
