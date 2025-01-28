import MainNavbar from "@/components/main/Navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      {children}
    </div>
  );
}
