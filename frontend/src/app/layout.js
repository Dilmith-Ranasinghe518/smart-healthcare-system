import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export const metadata = {
  title: "Smart Healthcare System",
  description: "Advanced healthcare management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="/stream-styles.css" rel="stylesheet" />
      </head>
      <body className="hero-gradient">
        <ThemeProvider>
          <AuthProvider>
            <main className="main-content">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
