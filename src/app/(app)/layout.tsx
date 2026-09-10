import { AppShell } from "@/frontend/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
