export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Используем глобальный сайдбар и хедер из корневого layout
  return <>{children}</>
}
