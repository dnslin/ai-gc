const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  platform: 'node',
  format: 'cjs',
  sourcemap: true,
  target: ['node18'],
  tsconfig: 'tsconfig.json'
};

async function build() {
  if (isWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(options);
  }
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
