import config from "@vinorcola/lint"
import { defineConfig, globalIgnores } from "eslint/config"
import reactHooksConfigurablePlugin from "eslint-plugin-react-hooks-configurable"

export default defineConfig([
    globalIgnores(["lib/*"]),
    {
        extends: [config],
        files: ["src/**/*.{js,jsx,ts,tsx}", "eslint.config.js"],
        plugins: {
            "react-hooks-configurable": reactHooksConfigurablePlugin,
        },
        rules: {
            "react-hooks/exhaustive-deps": "off",
            "react-hooks-configurable/exhaustive-deps": [
                "warn",
                {
                    additionalStableHooks: {
                        useWatchedState: [false, true],
                    },
                },
            ],
        },
    },
])
