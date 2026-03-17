import DashboardLayout from '../../layouts/DashboardLayout';
import Section from '../../components/ui/dashboard/Section';
import Panel from '../../components/ui/dashboard/Panel';
import Widget from '../../components/ui/dashboard/Widget';
import Button from '../../components/ui/Button';

// Iconos Placeholder
const WaterIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const TempIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

// Componente principal de la página
const Home = () => {
  return (
    <DashboardLayout title="Inicio">
      {/* Sección de Bienvenida */}
      <Section
        title="Bienvenido de vuelta, Usuario"
        description="Aquí tienes un resumen del estado de tu sistema de acuaponía."
        actions={<Button variant="primary">Actualizar Datos</Button>}
      >
        <Panel title="Resumen Rápido">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Widget
              title="Acuarios Activos"
              icon={<WaterIcon />}
              value="3"
              trend="+1"
              trendUp={true}
            />
            <Widget
              title="Temperatura Promedio"
              icon={<TempIcon />}
              value="24.5 °C"
              trend="-0.3 °C"
              trendUp={false}
            />
            <Widget
              title="pH Promedio"
              icon={<WaterIcon />}
              value="7.2"
              trend="+0.1"
              trendUp={true}
            />
          </div>
        </Panel>
      </Section>

      {/* Sección de Monitoreo en Vivo */}
      <Section title="Monitoreo en Vivo">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Acuario Principal">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Temperatura:</span>
                <span className="font-medium text-gray-900 dark:text-white">25.1 °C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">pH:</span>
                <span className="font-medium text-gray-900 dark:text-white">7.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Oxígeno Disuelto:</span>
                <span className="font-medium text-gray-900 dark:text-white">6.2 mg/L</span>
              </div>
            </div>
          </Panel>

          <Panel title="Acuario Secundario">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Temperatura:</span>
                <span className="font-medium text-gray-900 dark:text-white">23.8 °C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">pH:</span>
                <span className="font-medium text-gray-900 dark:text-white">7.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Oxígeno Disuelto:</span>
                <span className="font-medium text-gray-900 dark:text-white">5.9 mg/L</span>
              </div>
            </div>
          </Panel>
        </div>
      </Section>
    </DashboardLayout>
  );
};

export default Home;
