import "./globals.css";

export const metadata = {
  title: "Be My Valentine 💘",
  description: "A fun valentine proposal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
