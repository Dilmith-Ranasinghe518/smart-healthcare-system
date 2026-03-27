import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
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
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'var(--toast-bg, #1e293b)',
                  color: 'var(--toast-color, #f8fafc)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  fontSize: '13px',
                  padding: '12px 16px',
                  maxWidth: '380px',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
              }}
            />
            <main className="main-content">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
