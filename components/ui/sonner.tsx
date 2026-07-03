"use client";

import { Toaster as SonnerToaster } from "sonner";

function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      richColors
      position="top-right"
      closeButton
      {...props}
    />
  );
}

export { Toaster };
