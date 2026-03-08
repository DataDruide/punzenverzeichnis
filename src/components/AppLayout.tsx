import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import DatenschutzDialog from './DatenschutzDialog';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      {/* (J) Datenschutz-Bestätigung beim Login */}
      <DatenschutzDialog />
    </div>
  );
};

export default AppLayout;
