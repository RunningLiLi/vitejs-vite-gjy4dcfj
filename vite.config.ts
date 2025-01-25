import { defineConfig, build } from "vite";
import vue from "@vitejs/plugin-vue";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import { parse } from "@babel/parser";
import swc2Babel from "swc-to-babel";
import { walk } from "estree-walker";
import { ancestor, full, recursive } from "acorn-walk";
import { ResolvedConfig } from "vite";
import { execSync } from "child_process";
import path from "path";
import crypto from "crypto";

let config: ResolvedConfig = {} as ResolvedConfig;
const targetExt = new Set<string>(["ts","js","jsx","tsx","vue"]);
export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    vue(),
    {
      name: "demo",
      enforce: "pre",
      configResolved(resolvedConfig) {
        // 存储最终解析的配置
        config = resolvedConfig
      },
      generateBundle(options, chunk) {
        const cacheEffect = new Map();
        const entry = '/Users/ziplili/Desktop/vitejs-vite-gjy4dcfj/src/main.js'
        const exportEffect = getExportEffect.call(this, entry,cacheEffect);
        console.log(exportEffect);
      },
    },
  ],
});

function getFileContentAtCommit(filePath, commitHash) {
  try {
    // 构建 Git 命令
    const command = `git show ${commitHash}:${filePath}`;
    // 同步执行 Git 命令
    const output = execSync(command);
    // 将输出转换为字符串并返回
    return output.toString();
  } catch (error) {
    console.error(`获取文件内容时出错: ${error.message}`);
    return null;
  }
}
function constructImportStatement(importedId: string, importName: string) {
  if(importName === "default"){
    return `import defaultName from '${importedId}';defaultName();`
  }
  return `import { ${importName} } from '${importedId}';${importName}();`
}
async function getTreeShakingCode(code: string, exportName: string) {
  const virtualSourceModuleId = 'virtual:source';
  const virtualImporterModuleId = "virtual:importer";
  const virtualModules = {
    [virtualSourceModuleId]: code,
    [virtualImporterModuleId]: constructImportStatement(virtualSourceModuleId, exportName)
  }
  let treeShakingCode = "";
  await build({
    root: '/Users/ziplili/Desktop/vitejs-vite-gjy4dcfj/pulgin',
    build: {
      minify: false,
      write: true,
      modulePreload: {
        polyfill: false
      },
    },
    plugins: [
      {
        name: "find-export-dependency",
        enforce: "pre",
        resolveId(id, importer) {
          if (id in virtualModules) {
            return id;
          }
          if (importer === virtualSourceModuleId) {
            return { id, external: true };
          }
          return null;
        },
        load(id) {
          if (id in virtualModules) {
            return virtualModules[id];
          }
          return null;
        },
        renderChunk(code) {
          treeShakingCode = code;
        }
      }],
  });
  return treeShakingCode;
}

function getExportEffect(importId: string,cacheEffect:Map<string,Set<string>>) {
  if (cacheEffect.has(importId)) {
    return cacheEffect.get(importId);
  }

  const ext=importId.split(".").pop() || "";
  if(importId.includes("node_modules") || !targetExt.has(ext)){
    const exportEffect = new Set<string>();
    cacheEffect.set(importId, exportEffect)
    return exportEffect;
  }

  const relativePath = importId;
  const currentInfo = this.getModuleInfo(
    relativePath
  );
  // 检查import是否有变动
  currentInfo.importedIds?.forEach((importedId) => {
    getExportEffect.call(this, importedId, cacheEffect);
  });

  const preCode = getFileContentAtCommit(path.relative(process.cwd(), relativePath), "HEAD");
  // 被变动影响的导出
  const exportEffect: Set<string> = new Set();
  currentInfo.exports?.forEach(async (exportName) => {
    const curTreeShakingCodePromise = getTreeShakingCode(currentInfo.code || "", exportName)
    const preTreeShakingCodePromise = getTreeShakingCode(this.parse(preCode) || "", exportName)
    await Promise.all([curTreeShakingCodePromise, preTreeShakingCodePromise]).then(([cur, pre]) => {
      const curHash = crypto.createHash('md5').update(cur).digest('hex');
      const preHash = crypto.createHash('md5').update(pre).digest('hex');
      if (curHash !== preHash) {
        exportEffect.add(exportName)
      }
    })
  })
  cacheEffect.set(importId, exportEffect)
  return exportEffect;
}