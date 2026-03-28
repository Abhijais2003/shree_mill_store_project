import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Camera, ClipboardList, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Inventory' },
  { to: '/scan', icon: Camera, label: 'Scan Bill' },
  { to: '/activity', icon: ClipboardList, label: 'Activity' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Shree Mill Store</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-blue-700"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar — desktop */}
        <nav className="hidden md:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] bg-white border-r px-3 py-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile nav overlay */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)}>
            <nav
              className="w-64 bg-white h-full shadow-xl pt-4 px-3"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon size={22} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-pb">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center py-2 px-3 text-xs ${
                  isActive ? 'text-blue-800' : 'text-gray-500'
                }`}
              >
                <item.icon size={20} />
                <span className="mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
