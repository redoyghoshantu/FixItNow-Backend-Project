
// import {defineConfig} from 'tsup';

// export default defineConfig({
//     entry:['src/server.ts'],
//     format: ["esm"],
//     target:["esnext"],
//     platform: "node",
//     outDir:"dist",
//     bundle:true,
//     banner: {
//         js:`
        
//         import {createRequire} from 'module';
//         const require = createRequire(import.meta.url);
        
//         `
        
//     }

// })

import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    server: "src/server.ts",
    app: "src/app.ts",
  },
  format: ["esm"],
  target: "esnext",
  platform: "node",
  outDir: "dist",
  bundle: true,
  sourcemap: true,
});