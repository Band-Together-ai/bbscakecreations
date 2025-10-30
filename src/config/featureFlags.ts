// Feature flags for UI variations and experimental features
export const featureFlags = {
  UI_V2: import.meta.env.VITE_UI_V2 === 'true' || false,
} as const;

// Helper to check if a feature is enabled
export const isFeatureEnabled = (flag: keyof typeof featureFlags): boolean => {
  return featureFlags[flag];
};
