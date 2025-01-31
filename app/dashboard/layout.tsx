'use client'

import { Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
})

const menuItems = [{ name: 'HOME', path: '/dashboard' }]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream-light flex">
      <div className="p-12 space-y-6">
        <Link
          href="/dashboard"
          className={`${playfairDisplay.className} text-navy-light text-4xl font-bold block`}
        >
          flux
        </Link>

        <nav className="w-48 bg-coral-light px-2 py-4 rounded-xl">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  block w-full text-left px-2 py-1 transition-colors
                  ${
                    pathname === item.path
                      ? 'bg-white text-coral rounded-2xl'
                      : 'text-white hover:bg-white/10 rounded-2xl'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <main className="flex-1 p-12">{children}</main>
    </div>
  )
}
