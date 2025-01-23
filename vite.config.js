import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { default as traverse } from "@babel/traverse";
import swc2Babel from "swc-to-babel";

export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    vue(),
    {
      name: "test",
      enforce: "post",
      generateBundle(options, chunk) {
        const a = this.getModuleInfo(
          "/Users/ziplili/Desktop/vitejs-vite-gjy4dcfj/src/components/a.ts"
        );
        const babelAst = swc2Babel(a.ast);
        console.log(1);
      },
      buildEnd() {
        // console.log(arr);
      },
    },
  ],
});
