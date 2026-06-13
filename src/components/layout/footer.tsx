import Link from "next/link";
import { Cpu, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-700 bg-surface-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <Cpu className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-200">
                PC<span className="text-brand-400">Price</span>Tracker
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Track prices across major retailers and never pay too much for PC components again.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 mb-3 text-sm">Products</h3>
            <ul className="space-y-2">
              {["CPUs", "GPUs", "Motherboards", "Memory", "SSDs", "Cases"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/products?category=${item === "Memory" ? "RAM" : item === "SSDs" ? "SSD" : item === "Cases" ? "CASE" : item.slice(0, -1).toUpperCase()}`}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 mb-3 text-sm">Features</h3>
            <ul className="space-y-2">
              {[
                { label: "Price Alerts", href: "/alerts" },
                { label: "Build Planner", href: "/builds" },
                { label: "Favorites", href: "/favorites" },
                { label: "All Products", href: "/products" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 mb-3 text-sm">Retailers</h3>
            <ul className="space-y-2">
              {["Amazon", "Newegg", "Best Buy", "B&H Photo", "Micro Center", "Walmart"].map((r) => (
                <li key={r}>
                  <span className="text-sm text-gray-500">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} PC Price Tracker. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Prices are for informational purposes. Always verify before purchasing.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
