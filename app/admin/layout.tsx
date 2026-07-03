import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Reine · Admin",
  description: "Reine salon administration panel",
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${openSans.variable} admin-scope min-h-screen font-sans text-foreground antialiased`}
    >
      {children}
    </div>
  )
}
