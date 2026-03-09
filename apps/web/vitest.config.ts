/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "happy-dom",
        globals: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            thresholds: {
                statements: 85,
                branches: 80,
                functions: 80,
                lines: 85,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
            "@packages/contracts": path.resolve(__dirname, "../../packages/contracts"),
            "@packages/ui": path.resolve(__dirname, "../../packages/ui"),
        },
    },
});
