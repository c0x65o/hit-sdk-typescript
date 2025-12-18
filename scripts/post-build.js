#!/usr/bin/env node

/**
 * Post-build script to add 'use client' directive to provider.js
 * This is needed because TypeScript doesn't preserve the directive in compiled output
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist', 'provider.js');

try {
  let content = readFileSync(distPath, 'utf-8');
  
  // Only add if not already present
  if (!content.startsWith("'use client'")) {
    content = "'use client';\n" + content;
    writeFileSync(distPath, content, 'utf-8');
    console.log('✓ Added "use client" directive to provider.js');
  } else {
    console.log('✓ "use client" directive already present in provider.js');
  }
} catch (error) {
  console.error('Error adding "use client" directive:', error);
  process.exit(1);
}

