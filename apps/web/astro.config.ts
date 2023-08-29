import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sirv from 'sirv';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/': {
      status: 302,
      destination: '/en',
    },
  },
  experimental: {
    assets: true,
    viewTransitions: true,
  },
  integrations: [
    tailwind(),
    {
      name: 'pagefind',
      hooks: {
        'astro:server:setup': ({ server }) => {
          const serve = sirv(
            path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist'),
            {
              dev: true,
              etag: true,
            }
          );
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/_pagefind/')) {
              serve(req, res, next);
            } else {
              next();
            }
          });
        },
      },
    },
  ],
});
