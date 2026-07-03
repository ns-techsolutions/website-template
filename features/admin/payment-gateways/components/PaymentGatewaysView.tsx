"use client"

import { CreditCardIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { usePaymentGateways } from "../hooks/queries"
import { useSetGatewayEnabled } from "../hooks/mutations"

export function PaymentGatewaysView() {
  const { data: gateways = [] } = usePaymentGateways()
  const setEnabled = useSetGatewayEnabled()

  return (
    <>
      <PageHeader
        title="Payment Gateways"
        description="Control which payment gateways salons can use. Salons configure their own credentials for an enabled gateway."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {gateways.map((g) => (
          <Card key={g.provider} className="flex-row items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCardIcon className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {g.label}
                  </h3>
                  <Badge variant={g.enabled ? "success" : "secondary"}>
                    {g.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{g.provider}</p>
              </div>
            </div>
            <Switch
              checked={g.enabled}
              disabled={g.provider === "none" || setEnabled.isPending}
              onCheckedChange={(enabled) =>
                setEnabled.mutate({ provider: g.provider, enabled })
              }
            />
          </Card>
        ))}
        {gateways.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No payment gateways registered.
          </p>
        )}
      </div>
    </>
  )
}
