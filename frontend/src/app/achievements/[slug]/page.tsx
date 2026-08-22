'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { getFileUrl } from '@/utils/urls';
import { useParams } from 'next/navigation';
import Link from '@/components/PreviewLink';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';

// Utility function to strip HTML tags and preserve formatting
const stripHtml = (html: string) => {
  if (!html) return '';
  // Remove HTML tags but preserve line breaks
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

export default function AchievementDetail() {
  const { isInlineEditing } = useInlineEdit();
  const params = useParams();
  const slug = params?.slug;
  const [item, setItem] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || slug === 'null') return;
    fetchApi(`/achievements/slug/${slug}`)
      .then(res => setItem(res.data))
      .catch(() => {
        // Fallback: try fetching by ID if slug lookup fails
        fetchApi(`/achievements/${slug}`)
          .then(res => setItem(res.data))
          .catch(console.error);
      });
  }, [slug]);

  if (!item) return null;

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
  };

  const videoEmbedUrl = item.video_url ? getVideoEmbedUrl(item.video_url) : null;
  const hasMedia = item.featured_image || (item.media && item.media.length > 0);

  return (
    <div className="pt-8 pb-24 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb with Back */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/achievements" className="hover:text-primary transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span>/</span>
          <Link href="/achievements" className="hover:text-primary transition">Achievements</Link>
          <span>/</span>
          <span className="text-gray-300"><InlineResourceText resource="achievements" id={item.id} field="title" defaultValue={item.title} /></span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {item.category && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                <InlineResourceText resource="achievements" id={item.id} field="category" defaultValue={item.category} />
              </span>
            )}
            {item.featured && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                ⭐ Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <InlineResourceText resource="achievements" id={item.id} field="title" defaultValue={item.title} />
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {(item.organization || isInlineEditing) && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <InlineResourceText resource="achievements" id={item.id} field="organization" defaultValue={item.organization || ''} placeholder="Organization" />
              </div>
            )}
            {(item.date || isInlineEditing) && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <InlineResourceText resource="achievements" id={item.id} field="date" defaultValue={item.date || ''} placeholder="Date" />
              </div>
            )}
            {(item.location || isInlineEditing) && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <InlineResourceText resource="achievements" id={item.id} field="location" defaultValue={item.location || ''} placeholder="Location" />
              </div>
            )}
            {(item.role || isInlineEditing) && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <InlineResourceText resource="achievements" id={item.id} field="role" defaultValue={item.role || ''} placeholder="Role" />
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {(item.featured_image || isInlineEditing) && (
          <div className="mb-8 rounded-lg overflow-hidden min-h-[300px] relative">
            <InlineResourceImage
              resource="achievements"
              id={item.id}
              field="featured_image"
              currentSrc={item.featured_image || ''}
              alt={item.title}
              className="w-full h-auto max-h-[500px] object-cover cursor-pointer hover:opacity-90 transition"
              wrapperClassName="w-full h-full"
              width={1000}
            />
          </div>
        )}

        {/* Video */}
        {videoEmbedUrl && (
          <div className="mb-8 rounded-lg overflow-hidden bg-black aspect-video">
            <iframe
              src={videoEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {(item.full_description || item.short_description || isInlineEditing) && (
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">About This Achievement</h2>
                <div className="text-gray-300 whitespace-pre-line">
                  <InlineResourceText resource="achievements" id={item.id} field="full_description" multiline defaultValue={item.full_description || item.short_description || ''} placeholder="About this achievement..." />
                </div>
              </section>
            )}

            {/* Impact */}
            {(item.impact || isInlineEditing) && (
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Impact
                </h2>
                <div className="text-gray-300 whitespace-pre-line">
                  <InlineResourceText resource="achievements" id={item.id} field="impact" multiline defaultValue={item.impact || ''} placeholder="Describe the impact..." />
                </div>
              </section>
            )}

            {/* Why It Matters */}
            {(item.why_it_matters || isInlineEditing) && (
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Why It Matters
                </h2>
                <div className="text-gray-300 whitespace-pre-line">
                  <InlineResourceText resource="achievements" id={item.id} field="why_it_matters" multiline defaultValue={item.why_it_matters || ''} placeholder="Why it matters..." />
                </div>
              </section>
            )}

            {/* Media Gallery */}
            {item.media && item.media.length > 0 && (
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.media.map((mediaUrl: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedImage(mediaUrl)}
                    >
                      <img
                        src={mediaUrl}
                        alt={`${item.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Certificate */}
            {item.certificate_file && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">Certificate</h3>
                <a
                  href={getFileUrl(item.certificate_file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Certificate
                </a>
              </div>
            )}

            {/* Links */}
            {(item.verification_url || item.external_url) && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">Links</h3>
                <div className="space-y-2">
                  {item.verification_url && (
                    <a
                      href={item.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify Achievement
                    </a>
                  )}
                  {item.external_url && (
                    <a
                      href={item.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Learn More
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3">Share</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: item.title, url: window.location.href });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
                >
                  Share
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied!');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
