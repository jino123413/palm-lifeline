import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'palm-lifeline',
  web: {
    host: '0.0.0.0',
    port: 3001,
    commands: {
      dev: 'rsbuild dev --port 3001',
      build: 'rsbuild build',
    },
  },
  permissions: [
    {
      name: 'camera',
      access: 'access',
    },
  ],
  outdir: 'dist',
  brand: {
    displayName: '?먭툑 ?섎챸 誘몃━蹂닿린',
    icon: 'https://raw.githubusercontent.com/jino123413/app-logos/master/palm-lifeline.png',
    primaryColor: '#1F7A3E',
    bridgeColorMode: 'basic',
  },
  webViewProps: {
    type: 'partner',
  },
});

