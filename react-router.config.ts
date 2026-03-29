import type { Config } from "@react-router/dev/config"

export default {
  ssr: false,
  basename: process.env.APP_BASE || "/",
} satisfies Config
