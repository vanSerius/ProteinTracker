import { Route, Routes } from 'react-router-dom';
import { AppProvider } from './AppContext';
import BottomNav from './components/BottomNav';
import Today from './screens/Today';
import Add from './screens/Add';
import Meals from './screens/Meals';
import History from './screens/History';
import Profile from './screens/Profile';

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950">
        <main className="flex-1 pb-24 safe-top">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/add" element={<Add />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}
