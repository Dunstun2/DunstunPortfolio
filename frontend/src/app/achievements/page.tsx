'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';

export default function AchievementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch categories
    fetchApi('/achievements/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [selectedCategory, searchQuery]);

  const loadAchievements = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);

    const queryString = params.toString();
    const url = `/achievements/published${queryString ? `?${queryString}` : ''}`;

    fetchApi(url)
      .then(res => {
        setItems(res.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAchievements();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className="pt-20 pb-24 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Achievements</h1>
          <p className="text-gray-400 text-lg hidden md:block">
            A showcase of awards, certifications, and recognitions earned throughout my journey
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-8">
          <div className="flex gap-3 md:gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-auto md:min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 md:px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-white">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-white">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6 text-gray-400">
            {items.length} {items.length === 1 ? 'achievement' : 'achievements'} found
            {hasActiveFilters && ' (filtered)'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No achievements found</h3>
            <p className="text-gray-400 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'Check back later for updates'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Achievements Grid */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(it => (
              <article
                key={it.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all group flex flex-col h-full"
              >
                {/* Featured Image */}
                {it.featured_image && (
                  <Link href={`/achievements/${it.slug}`}>
                    <div className="aspect-video overflow-hidden bg-gray-900">
                      <img
                        src={it.featured_image}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Category Badge */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {it.category && (
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                        {it.category}
                      </span>
                    )}
                    {it.featured && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition line-clamp-2">
                    <Link href={`/achievements/${it.slug}`}>{it.title}</Link>
                  </h2>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                    {it.organization && <span className="truncate">{it.organization}</span>}
                    {it.organization && it.date && <span>•</span>}
                    {it.date && <span>{it.date}</span>}
                  </div>

                  {/* Description - Fixed height */}
                  <div className="mb-4 flex-1">
                    {it.short_description && (
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {it.short_description}
                      </p>
                    )}
                  </div>

                  {/* Read More Link - Always at bottom */}
                  <Link
                    href={`/achievements/${it.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-medium mt-auto"
                  >
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
