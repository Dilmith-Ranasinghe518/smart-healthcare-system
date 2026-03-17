import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Smart Healthcare System",
  description: "Advanced healthcare management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="hero-gradient">
        <AuthProvider>
          <main className="main-content">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
