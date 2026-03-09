// Override the admin layout for print-auth — render standalone with no nav
export default function PrintAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
