const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components', 'apps/web/features'];

const REPLACEMENTS = [
  // Backgrounds
  { regex: /\bbg-brand-dark\b/g, replacement: 'bg-canvas text-ink' },
  { regex: /\bbg-brand-gray\/[0-9]+\b/g, replacement: 'bg-canvas' },
  { regex: /\bbg-white\/(?:5|10|15|20|25|30)\b/g, replacement: 'bg-surface-cool' },
  { regex: /\bbg-white\/\[0\.[0-9]+\]\b/g, replacement: 'bg-surface-cool' },
  { regex: /\bbg-black\/[0-9]+\b/g, replacement: 'bg-canvas' },
  { regex: /\bbg-brand-cyan\/[0-9]+\b/g, replacement: 'bg-surface-cool' },
  { regex: /\bbg-brand-cyan\b/g, replacement: 'bg-primary text-on-primary' },
  
  // Text colors
  { regex: /\btext-white\/[5-9]0\b/g, replacement: 'text-graphite' },
  { regex: /\btext-white\/[4]5\b/g, replacement: 'text-graphite' },
  { regex: /\btext-white\/[4]0\b/g, replacement: 'text-graphite' },
  { regex: /\btext-white\/[3]5\b/g, replacement: 'text-stone' },
  { regex: /\btext-white\/[1-3]0\b/g, replacement: 'text-stone' },
  { regex: /\btext-white\/25\b/g, replacement: 'text-stone' },
  { regex: /\btext-white\b/g, replacement: 'text-ink' },
  { regex: /\btext-brand-cyan\b/g, replacement: 'text-ink' },
  { regex: /\btext-brand-dark\b/g, replacement: 'text-on-primary' },
  
  // Borders
  { regex: /\bborder-white\/[0-9]+\b/g, replacement: 'border-hairline' },
  { regex: /\bborder-brand-cyan\/[0-9]+\b/g, replacement: 'border-ink' },
  { regex: /\bborder-brand-cyan\b/g, replacement: 'border-ink' },
  
  // Glows and blurs
  { regex: /\bbackdrop-blur-[a-z0-9]+\b/g, replacement: '' },
  { regex: /\bblur-\[[0-9]+px\]\b/g, replacement: '' },
  { regex: /\bshadow-2xl\b/g, replacement: '' },
  { regex: /\bshadow-\[0_0_[0-9]+px_rgba\([^)]+\)\]\b/g, replacement: '' },
  { regex: /\bshadow-lg\b/g, replacement: '' },
  { regex: /\bshadow-md\b/g, replacement: '' },

  // Rounding (Careful not to replace button pill shapes, but we can target 2xl and 3xl which are mostly cards)
  { regex: /\brounded-2xl\b/g, replacement: 'rounded-none' },
  { regex: /\brounded-3xl\b/g, replacement: 'rounded-none' },
  { regex: /\brounded-xl\b/g, replacement: 'rounded-none' },
  
  // Random other vibe-coded bits
  { regex: /\bhover:border-white\/[0-9]+\b/g, replacement: 'hover:border-hairline-soft' },
  { regex: /\bhover:bg-white\/\[0\.[0-9]+\]\b/g, replacement: 'hover:bg-surface-cool' },
  { regex: /\bhover:bg-white\/[0-9]+\b/g, replacement: 'hover:bg-surface-cool' },
  { regex: /\bhover:text-white\b/g, replacement: 'hover:text-ink' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const { regex, replacement } of REPLACEMENTS) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }

  // Also clean up multiple spaces inside class names
  if (changed) {
    content = content.replace(/className="([^"]+)"/g, (match, classes) => {
      return `className="${classes.replace(/\s+/g, ' ').trim()}"`;
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(d => walkDir(path.join(process.cwd(), d)));
console.log("Done replacing classes!");
