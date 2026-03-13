import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JusticeRoute | AI Investigation Assistant",
  description: "Advanced investigation roadmap generation for law enforcement officers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-black"></div>
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white glow-primary">
                J
              </div>
              <span className="text-xl font-bold gradient-text">JusticeRoute</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400 font-medium">
              <a href="/" className="hover:text-indigo-400 transition-colors">Strategic Dashboard</a>
              <a href="/roadmap" className="hover:text-indigo-400 transition-colors underline decoration-indigo-500/30 underline-offset-8">Roadmap Library</a>
              <a href="#" className="hover:text-white transition-colors opacity-40 cursor-not-allowed">Admin Settings</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
