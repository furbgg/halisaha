import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'
import { Navbar } from './Navbar'
import Footer from './Footer'
import { HappyHourBadge } from '../common/HappyHourBadge'
import { RouteSEO } from '../common/RouteSEO'

export default function Layout() {
  const { isDark } = useThemeStore()

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="relative flex min-h-screen flex-col bg-background-dark text-slate-100 font-display antialiased overflow-x-hidden">
      <RouteSEO />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <HappyHourBadge />
    </div>
  )
}
