import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base: '/', build: { rollupOptions: { input: { main: resolve('index.html'), room: resolve('room/index.html'), wintor: resolve('work/wintor/index.html'), amsterdam: resolve('work/amsterdam-in-motion/index.html'), marinemuseum: resolve('work/marinemuseum/index.html'), missing: resolve('404.html') } } } });
