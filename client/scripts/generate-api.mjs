import { readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { generateEndpoints } from "@rtk-query/codegen-openapi";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);
process.chdir(root);
const schemaUrl =
  process.env.OPENAPI_SCHEMA_URL ??
  `${(process.env.API_PROXY_TARGET ?? "http://localhost:8000").replace(/\/$/, "")}/api/v1/swagger-json`;
const outputDir = resolve(root, "src/store/api/generated");
const snapshotDir = resolve(root, "src/openapi");
const suffix = randomUUID();
const stagedApi = resolve(outputDir, `.api-${suffix}.ts`);
const stagedSchema = resolve(snapshotDir, `.openapi-${suffix}.json`);
const apiFile = resolve(outputDir, "api.ts");
const schemaFile = resolve(snapshotDir, "openapi.json");

async function generate() {
  const source = new URL(schemaUrl);
  console.log(
    `Reading OpenAPI schema from ${source.protocol === "file:" ? "local export" : source.origin}…`,
  );
  let schema;
  if (source.protocol === "file:") {
    schema = JSON.parse(await readFile(source, "utf8"));
  } else {
    const response = await fetch(schemaUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new Error(`Schema request failed with HTTP ${response.status}.`);
    schema = await response.json();
  }
  if (
    !schema ||
    typeof schema.openapi !== "string" ||
    !schema.openapi.startsWith("3.") ||
    !schema.paths ||
    typeof schema.paths !== "object" ||
    !Object.keys(schema.paths).length
  ) {
    throw new Error(
      "Expected an OpenAPI 3 document with API paths; received an invalid schema.",
    );
  }
  await mkdir(outputDir, { recursive: true });
  await mkdir(snapshotDir, { recursive: true });
  await writeFile(stagedSchema, JSON.stringify(schema, null, 2) + "\n");
  await generateEndpoints({
    schemaFile: stagedSchema,
    apiFile: "./src/store/api/base-api.ts",
    apiImport: "baseApi",
    outputFile: stagedApi,
    exportName: "generatedApi",
    hooks: { queries: true, lazyQueries: true, mutations: true },
  });
  const generated = await readFile(stagedApi, "utf8");
  if (!generated.includes("injectEndpoints"))
    throw new Error("Generation did not produce an RTK Query API.");
  // No working output is changed until both staging files are complete.
  const previousApi = await readFile(apiFile).catch(() => null);
  const previousSchema = await readFile(schemaFile).catch(() => null);
  try {
    await rename(stagedSchema, schemaFile);
    await rename(stagedApi, apiFile);
  } catch (error) {
    if (previousApi) await writeFile(apiFile, previousApi);
    else await rm(apiFile, { force: true });
    if (previousSchema) await writeFile(schemaFile, previousSchema);
    else await rm(schemaFile, { force: true });
    throw error;
  }
  console.log(
    `Generated types and hooks for ${Object.keys(schema.paths).length} API paths.`,
  );
}
try {
  await generate();
} catch (error) {
  console.error(
    `API generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
  console.error(
    "Start the backend or set OPENAPI_SCHEMA_URL. Existing generated files were preserved.",
  );
  process.exitCode = 1;
} finally {
  await rm(stagedApi, { force: true });
  await rm(stagedSchema, { force: true });
}
