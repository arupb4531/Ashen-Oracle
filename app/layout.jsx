import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const cinzel = Cinzel({ subsets: ["latin"], variable: '--font-serif' });

export const metadata = {
  title: "Ashen Oracle",
  description: "An immersive dark-fantasy AI assistant inspired by Soulslike games.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable}`}>
        {children}
      </body>
    </html>
  );
}
