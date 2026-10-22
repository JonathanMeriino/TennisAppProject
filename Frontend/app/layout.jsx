import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Tennis IPN App",
  description:
    "Plataforma para organizar y administrar torneos de tenis",
  icons: {
    icon: "/tennis_ball.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Renderiza las vistas de la aplicación */}
        {children}
        
        {/* Componente global de notificaciones flotantes */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}