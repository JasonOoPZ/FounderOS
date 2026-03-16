import fs from 'fs';
import path from 'path';

export type Resource = {
  title: string;
  url: string;
  category: string;
};

const JUNK_HEADINGS = [
  'About', 'Who Is This For?', "What's Inside?", 'Quick Start',
  'Table of Contents', 'Contributing', 'License', 'Acknowledgments',
  'Community & Support', 'Sponsorship', 'Contribution Guidelines',
  '📋 Table of Contents', '🤝 Contributing', '📜 License', '💬 Community & Support',
];

export function parseDirectory(): { resources: Resource[]; categories: string[] } {
  const filePath = path.join(process.cwd(), '_data', 'founders-kit.md');
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Strip escape backslashes
  const content = raw.replace(/\\([\[#\-\*!&])/g, '$1');

  const resources: Resource[] = [];
  const categories: string[] = [];
  let currentCategory = 'General';

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Only use ## headings as categories
    const headingMatch = trimmed.match(/^#{2}\s+(.+)/);
    if (headingMatch) {
      const heading = headingMatch[1].replace(/#+/g, '').trim();
      if (
        !heading.includes('http') &&
        heading.length < 60 &&
        !JUNK_HEADINGS.includes(heading)
      ) {
        currentCategory = heading;
        if (!categories.includes(currentCategory)) {
          categories.push(currentCategory);
        }
      }
      continue;
    }

    // Detect markdown links: - [Title](url)
    const linkMatch = trimmed.match(/^-?\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (linkMatch) {
      const title = linkMatch[1].trim();
      const url = linkMatch[2].trim();
      const JUNK_TITLES = ['Table of Contents', 'Contributing', 'License', 'Acknowledgments', 'Community & Support', 'Sponsorship', 'Contribution Guidelines', 'Individuals Matter - Dan Luu'];
if (title && url && !title.startsWith('!') && !JUNK_TITLES.includes(title)) {
        resources.push({ title, url, category: currentCategory });
      }
    }
  }

  return { resources, categories };
}