import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, FileText } from 'lucide-react';
import { COLORS } from './UI';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/visitas', icon: Calendar, label: 'Visitas' },
  { path: '/presupuestos', icon: FileText, label: 'Presupuestos' },
];

export default function Layout({ children, showNav = true }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Content */}
      <main className={`flex-1 overflow-y-auto hide-scrollbar ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="flex justify-around py-2">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center py-1 px-4"
                >
                  <item.icon 
                    size={24} 
                    color={isActive ? COLORS.primary : COLORS.textLight}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span 
                    className="text-xs mt-1 font-medium"
                    style={{ color: isActive ? COLORS.primary : COLORS.textLight }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
