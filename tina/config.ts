import { defineConfig } from "tinacms";

export default defineConfig({
  branch: process.env.TINA_BRANCH || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "images", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "project",
        label: "Projects",
        path: "content/projects",
        format: "mdx",
        ui: {
          filename: {
            readonly: false,
            slugify: (v) => (v?.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          },
        },
        fields: [
          { name: "title", label: "Title", type: "string", required: true, isTitle: true },
          { name: "category", label: "Category", type: "string", options: ["Editorial", "Commercial", "Personal"] },
          { name: "client", label: "Client", type: "string" },
          { name: "date", label: "Date", type: "string", description: "e.g. July 2025, Ongoing" },
          { name: "location", label: "Location", type: "string", description: "e.g. Jacksonville, Florida" },
          { name: "coordinates", label: "Coordinates", type: "string", description: "e.g. 30.3322° N, 81.6557° W" },
          { name: "number", label: "Project Number", type: "number" },
          { name: "featured", label: "Show on Homepage", type: "boolean" },
          { name: "featuredImage", label: "Featured Image (homepage hover)", type: "image" },
          {
            name: "gallery",
            label: "Gallery",
            type: "object",
            list: true,
            templates: [
              {
                name: "pair",
                label: "Pair (equal)",
                fields: [
                  { name: "left", label: "Left Image", type: "image", required: true },
                  { name: "right", label: "Right Image", type: "image", required: true },
                ],
              },
              {
                name: "pairWide",
                label: "Pair (wide left)",
                fields: [
                  { name: "left", label: "Left Image (larger)", type: "image", required: true },
                  { name: "right", label: "Right Image (smaller)", type: "image", required: true },
                ],
              },
              {
                name: "pairNarrow",
                label: "Pair (wide right)",
                fields: [
                  { name: "left", label: "Left Image (smaller)", type: "image", required: true },
                  { name: "right", label: "Right Image (larger)", type: "image", required: true },
                ],
              },
              {
                name: "trio",
                label: "Three Images",
                fields: [
                  { name: "img1", label: "Image 1", type: "image", required: true },
                  { name: "img2", label: "Image 2", type: "image", required: true },
                  { name: "img3", label: "Image 3", type: "image", required: true },
                ],
              },
              {
                name: "full",
                label: "Full Width",
                fields: [{ name: "image", label: "Image", type: "image", required: true }],
              },
              {
                name: "cinematic",
                label: "Cinematic (edge-to-edge)",
                fields: [{ name: "image", label: "Image", type: "image", required: true }],
              },
            ],
          },
          {
            name: "credits",
            label: "Credits",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.role ? `${item.role}: ${item.name}` : "New Credit" }) },
            fields: [
              { name: "role", label: "Role", type: "string", required: true },
              { name: "name", label: "Name", type: "string", required: true },
            ],
          },
        ],
      },
    ],
  },
});
