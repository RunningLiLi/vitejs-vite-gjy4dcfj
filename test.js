import { execSync } from "child_process";
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

console.log(getFileContentAtCommit("src/components/a.ts", "HEAD"));
