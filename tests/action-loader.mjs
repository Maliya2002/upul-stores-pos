// Use the real actions and PostgreSQL; replace only the HTTP session and cache boundary.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "@/lib/auth")
      return { url: "test:auth", shortCircuit: true };
    if (specifier === "next/cache")
      return { url: "test:cache", shortCircuit: true };
    let path;
    if (specifier.startsWith("@/")) path = resolve("src", specifier.slice(2));
    else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith("file:") &&
      !context.parentURL.includes("node_modules")
    )
      path = fileURLToPath(new URL(specifier, context.parentURL));
    if (path && !extname(path) && existsSync(path + ".ts"))
      return { url: pathToFileURL(path + ".ts").href, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === "test:auth")
      return {
        format: "module",
        source:
          "export async function auth() { return process.env.TEST_STAFF_ID ? {user:{id:process.env.TEST_STAFF_ID}} : null; }",
        shortCircuit: true,
      };
    if (url === "test:cache")
      return {
        format: "module",
        source: "export function revalidatePath() {}",
        shortCircuit: true,
      };
    if (
      url.startsWith("file:") &&
      url.endsWith(".ts") &&
      !url.includes("node_modules")
    ) {
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
        shortCircuit: true,
      };
    }
    return next(url, context);
  },
});
