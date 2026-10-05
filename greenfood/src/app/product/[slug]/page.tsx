import { ALL_PRODUCTS } from '@/data/products';
import ProductClient from './ProductClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductClient initialSlug={params.slug} />;
}
