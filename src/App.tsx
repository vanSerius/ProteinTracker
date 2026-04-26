import { Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import BottomNav from './components/BottomNav';
import Today from './screens/Today';
import Add from './screens/Add';
import Meals from './screens/Meals';
import History from './screens/History';
import Profile from './screens/Profile';
import Welcome from './screens/Welcome';

function Shell() {
  const { userId, users, loading, error, setUserId } = useApp();

  if (!userId) {
    return <Welcome users={users} loading={loading} error={error} onPick={setUserId} />;
  }

  return (
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
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
