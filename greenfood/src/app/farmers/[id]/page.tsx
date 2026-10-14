import { Suspense } from 'react';
import FarmerStorefrontClient from './FarmerStorefrontClient';

export const dynamicParams = true;

// Pre-generate static params cho Next.js export / static hosting
export async function generateStaticParams() {
  return [
    { id: '01a11ad7-2d00-72e3-84d5-074abf293ef1' },
    { id: '01a111cf-de77-727c-bf12-292c04160d6c' },
    { id: '00038de6-b547-478a-8635-59fd421f444a' },
    { id: 'a3749a5d-1646-48df-af00-0c0091ab8c61' },
    { id: '6b9c95e4-27cc-4835-a192-9e29def04086' },
    { id: 'd5e4054f-ba7c-4cf8-b43a-f8742060c875' },
    { id: 'demo' },
  ];
}

export default function FarmerStorefrontPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <FarmerStorefrontClient initialId={params.id} />
    </Suspense>
  );
}
