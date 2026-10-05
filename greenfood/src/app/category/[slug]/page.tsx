import { STATIC_CATEGORY_SLUGS } from '@/data/products';
import CategoryClient from './CategoryClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return STATIC_CATEGORY_SLUGS.map((slug) => ({
    slug,
  }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryClient initialSlug={params.slug} />;
}
