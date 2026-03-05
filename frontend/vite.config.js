import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mr Gutter Production Tracker',
        short_name: 'Mr Gutter',
        description: 'Track gutter installation jobs, profitability, and goals',
        theme_color: '#0066cc',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://res.cloudinary.com/dxzw1zwez/image/upload/w_192,h_192,c_fit/v1768790415/mr_gutter_blue_complete_vr9fak.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://res.cloudinary.com/dxzw1zwez/image/upload/w_512,h_512,c_fit/v1768790415/mr_gutter_blue_complete_vr9fak.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://res.cloudinary.com/dxzw1zwez/image/upload/w_512,h_512,c_fit/v1768790415/mr_gutter_blue_complete_vr9fak.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Add Job',
            short_name: 'Add Job',
            description: 'Add a new gutter job',
            url: '/jobs/new',
            icons: [{ src: 'https://res.cloudinary.com/dxzw1zwez/image/upload/w_96,h_96,c_fit/v1768790415/mr_gutter_blue_complete_vr9fak.png', sizes: '96x96' }]
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View production dashboard',
            url: '/',
            icons: [{ src: 'https://res.cloudinary.com/dxzw1zwez/image/upload/w_96,h_96,c_fit/v1768790415/mr_gutter_blue_complete_vr9fak.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mr-gutter-software\.micaiah-tasks\.workers\.dev\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  }
});
