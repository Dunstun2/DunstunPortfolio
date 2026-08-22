import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import { API_BASE_URL } from '@/utils/urls';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    console.log(`[getPost SSR] Fetching slug: "${slug}"`);
    const res = await fetch(`${API_BASE_URL}/blog/post/${slug}`, {
      cache: 'no-store',
    });
    console.log(`[getPost SSR] API response status: ${res.status}`);
    if (!res.ok) {
      console.log(`[getPost SSR] Error response text: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('[getPost SSR] Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || '';
  const imageUrl = post.featured_image_url || '';
  const author = post.author_name || 'Admin';

  return {
    title,
    description,
    keywords: post.seo_keywords || '',
    authors: [{ name: author }],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/blog/${post.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
      authors: [author],
      publishedTime: post.published_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
      creator: author,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient initialPost={post} />;
}
