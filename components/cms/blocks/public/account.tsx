import { AccountView as PublicAccountView } from "@/features/account/components/AccountView"

export function AccountBlock() {
  return (
    <section className="font-sans min-h-screen flex flex-col">
      <div className="flex-1 bg-white">
        <PublicAccountView />
      </div>
    </section>
  )
}
