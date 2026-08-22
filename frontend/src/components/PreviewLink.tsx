'use client';

import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';

/**
 * PreviewLink — A drop-in replacement for Next.js Link that automatically
 * preserves the `?preview_template=<slug>` query parameter during template
 * preview mode. This prevents navigating away from the previewed template
 * when clicking internal links.
 *
 * Usage: import Link from '@/components/PreviewLink';
 * (identical API to next/link)
 */
export default function PreviewLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get('preview_template');
  const inlineEdit = searchParams.get('inline_edit');

  let finalHref = href;

  if (typeof href === 'string' && href.startsWith('/')) {
    const paramsToAdd: string[] = [];
    if (previewSlug && !href.includes('preview_template')) {
      paramsToAdd.push(`preview_template=${encodeURIComponent(previewSlug)}`);
    }
    if (inlineEdit && !href.includes('inline_edit')) {
      paramsToAdd.push(`inline_edit=${encodeURIComponent(inlineEdit)}`);
    }
    if (paramsToAdd.length > 0) {
      const separator = href.includes('?') ? '&' : '?';
      finalHref = `${href}${separator}${paramsToAdd.join('&')}`;
    }
  }

  return <NextLink href={finalHref} {...props} />;
}
