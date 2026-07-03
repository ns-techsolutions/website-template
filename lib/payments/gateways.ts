import { controlDb } from "@/lib/db/control";

// Reads the platform-wide payment-gateway registry (control plane). The master
// admin toggles `enabled`; salons may only select an enabled provider.

export interface GatewayOption {
  provider: string;
  label: string;
}

export async function listEnabledGateways(): Promise<GatewayOption[]> {
  const rows = await controlDb.paymentGateway.findMany({
    where: { enabled: true },
    orderBy: { provider: "asc" },
    select: { provider: true, label: true },
  });
  return rows;
}

export async function isGatewayEnabled(provider: string): Promise<boolean> {
  if (provider === "none") return true; // pay-at-salon is always available
  const row = await controlDb.paymentGateway.findUnique({
    where: { provider },
    select: { enabled: true },
  });
  return row?.enabled ?? false;
}
