import type { TemplateComponentSet } from './types';
import { ObsidianTemplate } from '@/templates/obsidian';
import { IvoryTemplate } from '@/templates/ivory';

/**
 * Template Registry
 * 
 * Maps template slugs to their React component sets.
 * When a new template is created, register it here.
 */
const registry: Record<string, TemplateComponentSet> = {
  'obsidian': ObsidianTemplate,
  'ivory': IvoryTemplate,
};

/**
 * Get the component set for a template slug.
 * Falls back to Obsidian if the slug is not found.
 */
export function getTemplateComponents(slug: string): TemplateComponentSet {
  return registry[slug] || registry['obsidian'];
}

/**
 * Get all registered template slugs.
 */
export function getRegisteredSlugs(): string[] {
  return Object.keys(registry);
}
