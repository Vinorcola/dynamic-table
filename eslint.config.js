import config from "@vinorcola/lint"
import { defineConfig } from "eslint/config"

export default defineConfig([
    {
        extends: [config],
        files: ["src/**/*.{js,jsx,ts,tsx}", "eslint.config.js"],
    },
])
