import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.js';
import { normalizePost } from './metadata.js';
import { renderMarkdown } from './markdown.js';

export { normalizePost } from './metadata.js';

async function readConfig(root) {
  try {
    return JSON.parse(await readFile(path.join(root, 'config/siteConfig.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw new Error(`config/siteConfig.json: ${error.message}`, { cause: error });
  }
}

async function markdownFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
      .map((entry) => path.join(directory, entry.name))
      .sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function loadPosts({
  root = process.cwd(),
  contentDir,
  includeDrafts = false,
  config,
} = {}) {
  config ??= await readConfig(root);
  const directories = [
    path.resolve(root, contentDir || 'content/posts'),
    path.resolve(root, 'blogData/markdown'),
  ];
  const posts = new Map();
  for (const directory of [...new Set(directories)]) {
    const directoryIds = new Set();
    for (const filename of await markdownFiles(directory)) {
      try {
        const source = await readFile(filename, 'utf8');
        const parsed = parseFrontmatter(source);
        const post = normalizePost(
          parsed.data,
          parsed.content,
          path.basename(filename, path.extname(filename)),
          config,
        );
        if (directoryIds.has(post.id)) throw new Error(`duplicate post id ${post.id}`);
        directoryIds.add(post.id);
        if (posts.has(post.id)) continue;
        // Remember excluded drafts too: legacy duplicates must not resurrect them.
        if (post.draft && !includeDrafts) {
          posts.set(post.id, null);
          continue;
        }
        const rendered = await renderMarkdown(post.body);
        posts.set(post.id, {
          ...post,
          ...rendered,
          excerpt: post.excerpt || rendered.text.slice(0, 180),
        });
      } catch (error) {
        throw new Error(`${path.relative(root, filename)}: ${error.message}`, { cause: error });
      }
    }
  }
  return [...posts.values()]
    .filter(Boolean)
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id, 'en', { numeric: true }),
    );
}
