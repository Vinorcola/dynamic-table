import config from "@vinorcola/lint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
    globalIgnores(["lib/*"]),
    {
        extends: [config],
        files: ["src/**/*.{js,jsx,ts,tsx}", "eslint.config.js"],
    },
])
