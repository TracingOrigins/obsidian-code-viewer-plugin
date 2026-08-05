// 文件扩展名 → 代码语言标识（用于 Markdown 代码块 fence 与高亮）
// 键为小写扩展名；值为 Obsidian/CodeMirror 认识的语言 id
export const EXT_TO_LANG: Record<string, string> = {
  py: "python",
  ps1: "powershell",
  psm1: "powershell",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  cs: "csharp",
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  h: "c",
  hpp: "cpp",
  sql: "sql",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  rs: "rust",
  go: "go",
  lua: "lua",
  gd: "gdscript",
  gdshader: "glsl",
  bat: "batch",
  cmd: "batch",
  rb: "ruby",
  php: "php",
  pl: "perl",
  r: "r",
  dart: "dart",
  kt: "kotlin",
  swift: "swift",
  vue: "html",
  svelte: "html",
  ini: "ini",
  conf: "ini",
  env: "bash",
  dockerfile: "dockerfile",
  makefile: "makefile",
  cmake: "cmake",
  xml: "xml",
  html: "html",
  css: "css",
  scss: "scss",
  less: "less",
  json: "json",
  json5: "json5",
  jsonc: "json",
  tf: "hcl",
  tfvars: "hcl",
  hcl: "hcl",
  proto: "protobuf",
  graphql: "graphql",
  gql: "graphql",
};

// 把扩展名转成语言标识；未知扩展名返回空串（调用方据此渲染无高亮代码块）
export function languageFor(ext: string): string {
  return EXT_TO_LANG[ext.toLowerCase()] ?? "";
}

// 解析设置里的扩展名字符串：去空白/去前导点/小写/去重，
// 并排除 md（避免与 Obsidian 原生 Markdown 视图冲突）
export function parseExtensions(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\s,]+/)) {
    const trimmed = part.trim().toLowerCase().replace(/^\./, "");
    if (!trimmed || trimmed === "md" || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
