import type { TsToolkitConfig } from "@makerx/ts-toolkit";

const config: TsToolkitConfig = {
  packageConfig: {
    srcDir: 'src',
    outDir: 'dist',
    moduleType: 'commonjs',
    main: 'index.ts',
  }
}
export default config
