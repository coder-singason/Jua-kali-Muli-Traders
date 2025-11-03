import Link from "next/link";
import { Package, ShoppingBag, User, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              KicksZone
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium shoes for every step of your journey.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-muted-foreground hover:text-foreground transition-colors">
                  Featured
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@kickszone.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +254 700 000 000
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KicksZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

