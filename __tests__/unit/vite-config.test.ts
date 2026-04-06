// @vitest-environment node

import fs from "node:fs";

import viteConfig from "../../vite.config";

function flattenPluginNames(plugins: unknown[]): string[] {
  return plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) {
      return flattenPluginNames(plugin);
    }

    if (plugin && typeof plugin === "object" && "name" in plugin) {
      const name = plugin.name;
      return typeof name === "string" ? [name] : [];
    }

    return [];
  });
}

describe("vite config", () => {
  test("uses the TanStack Start plugin", () => {
    const plugins = viteConfig.plugins ?? [];
    const pluginNames = flattenPluginNames(plugins);

    expect(pluginNames).toContain("tanstack-react-start:config");
  });

  test("uses the Nitro plugin required for Vercel SSR output", () => {
    const plugins = viteConfig.plugins ?? [];
    const pluginNames = flattenPluginNames(plugins);

    expect(pluginNames.some((name) => name.startsWith("nitro:"))).toBe(true);
  });
});

describe("vercel config", () => {
  test("overrides the framework preset to TanStack Start", () => {
<<<<<<< Updated upstream
    const vercelConfig = JSON.parse(
      fs.readFileSync("./vercel.json", "utf8")
    ) as {
=======
    const vercelConfig = JSON.parse(fs.readFileSync("./vercel.json", "utf8")) as {
>>>>>>> Stashed changes
      framework?: string | null;
    };

    expect(vercelConfig.framework).toBe("tanstack-start");
  });
});
