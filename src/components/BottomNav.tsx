import { NavLink } from 'react-router-dom';
import { Home, Plus, ChefHat, BarChart2, User } from 'lucide-react';

const TABS = [
  { to: '/', icon: Home, label: 'Today' },
  { to: '/add', icon: Plus, label: 'Add' },
  { to: '/meals', icon: ChefHat, label: 'Meals' },
  { to: '/history', icon: BarChart2, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-bottom">
      <div className="max-w-md mx-auto flex justify-around">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 min-h-[56px] flex-1 ${
                  isActive ? 'text-brand-600 dark:text-brand-500' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon size={22} />
              <span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
