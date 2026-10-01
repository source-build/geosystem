import { DEMO_CONFIG } from "@/config/demo";
import { useDemoGate } from "@/composables/useDemoGate";

type AuraAction = keyof typeof DEMO_CONFIG.aura.actions;

export function useAuraPreviewGate() {
  const { requireFullEdition: requireDemoEdition } = useDemoGate("aura");

  const requireFullEdition = (
    capability: string,
    action: AuraAction = "generate",
    description?: string,
  ) => requireDemoEdition(capability, action, description);

  return { requireFullEdition };
}
