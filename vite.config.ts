import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig, type Plugin } from "vite";

const digest = (bytes: Uint8Array | string) =>
  createHash("sha256").update(bytes).digest("hex");

function publicFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? publicFiles(path) : [path];
  });
}

/** Keep the explicitly configured runtime, and remove only its byte-identical copy. */
function archiveAssets(): Plugin {
  return {
    name: "dead-air-verified-assets",
    apply: "build",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const runtimePath =
          "public/runtime/onnx-1.22.0/ort-wasm-simd-threaded.jsep.wasm";
        const runtimeDigest = digest(readFileSync(runtimePath));
        for (const [name, output] of Object.entries(bundle)) {
          if (
            name.startsWith("assets/") &&
            name.endsWith(".wasm") &&
            output.type === "asset" &&
            digest(output.source) === runtimeDigest
          ) {
            delete bundle[name];
          }
        }

        // An explicit player action uses this manifest to prepare a complete offline copy.
        // The public model files are reconstructed and integrity-checked by prebuild.
        const content = new Map<string, Uint8Array | string>();
        for (const [name, output] of Object.entries(bundle)) {
          if (name.endsWith(".map")) continue;
          content.set(
            name,
            output.type === "chunk" ? output.code : output.source,
          );
        }
        for (const path of [
          ...publicFiles("public/fonts"),
          ...publicFiles("public/models/minilm-751bff3"),
          ...publicFiles("public/runtime/onnx-1.22.0"),
          "public/favicon.svg",
        ]) {
          if (!path.endsWith(".map")) {
            content.set(
              relative("public", path).replaceAll("\\", "/"),
              readFileSync(path),
            );
          }
        }
        const hash = createHash("sha256");
        for (const [name, bytes] of [...content].sort(([a], [b]) =>
          a.localeCompare(b),
        )) {
          hash.update(name).update("\0").update(bytes).update("\0");
        }
        this.emitFile({
          type: "asset",
          fileName: "offline-assets.json",
          source: JSON.stringify(
            {
              version: hash.digest("hex").slice(0, 16),
              assets: [...content.keys()].sort(),
            },
            null,
            2,
          ),
        });
      },
    },
  };
}

export default defineConfig({
  base: process.env.DEPLOY_BASE || "/",
  plugins: [archiveAssets()],
});
