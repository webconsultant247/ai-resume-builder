import MainNavbar from "@/components/main/Navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <MainNavbar />
      {children}
    </div>
  );
}
