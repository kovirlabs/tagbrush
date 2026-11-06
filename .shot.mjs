import { chromium } from '@playwright/test';
const [,, tag] = process.argv;
const b = await chromium.launch();
for (const name of ['landing', 'signup', 'dashboard', 'blog-post', 'docs', 'admin-users']) {
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
  await p.route(/cdn\.jsdelivr\.net\/npm\/tagbrush@1\/tagbrush(\.min)?\.css/, (r) => r.fulfill({ path: 'tagbrush.css', contentType: 'text/css' }));
  await p.goto('file:///Users/evangress/github/tagbrush/evals/pages/' + name + '.html');
  await p.screenshot({ path: '/private/tmp/claude-501/-Users-evangress-github-tagbrush/30036361-68f6-4693-a4c0-32c605be39a1/scratchpad/evals/' + tag + '-' + name + '.png', fullPage: true });
  await p.close();
}
await b.close();
