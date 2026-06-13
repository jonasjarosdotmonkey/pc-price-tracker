import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-surface-700 mb-4">404</div>
        <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-200 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link href="/products" className="btn-secondary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
