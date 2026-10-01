export const previewAsset = (path: string) =>
  `${import.meta.env.BASE_URL}aura-preview/${path.replace(/^\//, "")}`;
