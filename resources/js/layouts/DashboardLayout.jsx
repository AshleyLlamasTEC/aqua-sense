// resources/js/layouts/DashboardLayout.jsx
import { useSidebarStore } from '../components/navigation/stores/useSidebarStore';
import { useIsMobile } from '../components/navigation/hooks/useMediaQuery';
import Sidebar from "@/Components/navigation/Sidebar";
import Navbar from "@/Components/navigation/Navbar";

export default function DashboardLayout({ children }) {
  const isMobile = useIsMobile();
  const { isCollapsed } = useSidebarStore(); // ← Ahora sí está definido

  // Función helper para clases condicionales
  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />

      <main className={cn(
        'transition-all duration-300',
        !isMobile && (isCollapsed ? 'ml-20' : 'ml-64')
      )}>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
