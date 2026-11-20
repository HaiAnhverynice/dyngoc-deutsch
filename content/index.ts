import type { ContentFile } from '@/vocab/types';

// Bundled by Metro. Bump `version` inside a file to re-seed it on devices (progress is kept).
export const CONTENT_FILES = [
  require('./vocab/a1.json'),
  require('./vocab/a2.json'),
  require('./vocab/b1.json'),
  require('./vocab/b2.json'),
] as ContentFile[];
