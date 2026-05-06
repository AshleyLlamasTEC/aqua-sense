import { useState, useMemo } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

// 📦 ARK UI – componentes accesibles
import { Switch } from '@ark-ui/react/switch';
import { Field } from '@ark-ui/react/field';

// 🌊 Iconos gratuitos de Hugeicons (https://hugeicons.com/icons)
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Tick02Icon,
  Settings02Icon,
  CpuIcon,
  Configuration01Icon,
  Alert01Icon,
  TestTube02Icon,
  WaterPoloIcon,
  TestTube01Icon,
  WindTurbineIcon,
} from 'hugeicons-react';

// ------------------------------------------------------------
// 🔧 Mapeo de iconos según tipo de sensor (para tarjetas)
// ------------------------------------------------------------
const sensorIconMap = {
  temperature: TestTube02Icon,
  water_level: WaterPoloIcon,
  ph: TestTube01Icon,
  turbidity: WindTurbineIcon,
};
const DefaultSensorIcon = CpuIcon;

/* =============================================================
   🧩 StepsIndicator
   Stepper de 4 pasos con glow en el paso actual y checks.
   ============================================================= */
const StepsIndicator = ({ currentStep }) => {
  const steps = [
    { label: 'Identidad', icon: Settings02Icon },
    { label: 'Sensores', icon: CpuIcon },
    { label: 'Calibración', icon: Configuration01Icon },
    { label: 'Alertas', icon: Alert01Icon },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-10">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const Icon = step.icon;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="relative flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-cyan-600 text-white'
                    : isCurrent
                    ? 'bg-cyan-50 text-cyan-700 border-2 border-cyan-400 shadow-lg shadow-cyan-200/50'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
              >
                {isCompleted ? <Tick02Icon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-cyan-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${
                  index < currentStep ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* =============================================================
   🏷️ ReadonlyField
   Campo de solo lectura.
   ============================================================= */
const ReadonlyField = ({ label, value }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 font-medium text-sm">
      {value || '—'}
    </div>
  </div>
);

/* =============================================================
   📝 FormField (con spread de ...props para step="any")
   ============================================================= */
const FormField = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  multiline = false,
  ...props
}) => (
  <Field.Root invalid={!!error}>
    <Field.Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </Field.Label>
    {multiline ? (
      <Field.Textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200
                   focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10
                   transition-all outline-none resize-none"
        {...props}
      />
    ) : (
        <Field.Input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-5 py-4 text-sm font-semibold rounded-2xl border-none outline-none transition-all
                ${
                error
                    ? `bg-rose-50 ring-2  ring-rose-400/5 text-rose-70 placeholder:text-rose-300`
                    : `bg-slate-50 text-slate-700 focus:ring-2 focus:ring-cyan-500/50`
                }
            `}
            {...props}
        />
    )}
    <Field.ErrorText className="text-red-500 text-xs mt-1 italic">
      {error}
    </Field.ErrorText>
  </Field.Root>
);

/* =============================================================
   🧩 SensorCard
   Tarjeta individual para un sensor, usada en ambos modos.
   ============================================================= */
const SensorCard = ({ sensor, data, index, onUpdateSensor }) => {
  const SensorIcon = sensorIconMap[sensor.sensor_type?.slug] || DefaultSensorIcon;
  const sampleInterval = data.sensors[index]?.sample_interval_s ?? sensor.sample_interval_s;
  const isActive = data.sensors[index]?.is_active ?? sensor.is_active;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-cyan-200 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
          <SensorIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">
            {sensor.sensor_type?.name || `Sensor ${index + 1}`}
          </p>
          <p className="text-xs text-gray-500">
            Unidad: {sensor.sensor_type?.unit || 'N/A'}
            {sensor.gpio_pin && (
              <span className="ml-2 text-gray-400">
                | GPIO: {sensor.gpio_pin}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Intervalo (s)
          </label>
          <input
            type="number"
            value={sampleInterval}
            onChange={(e) => {
              const updated = [...data.sensors];
              updated[index] = {
                ...updated[index],
                sample_interval_s: e.target.value,
              };
              onUpdateSensor(updated);
            }}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400">Activo</span>
          <Switch.Root
            checked={isActive}
            onCheckedChange={({ checked }) => {
              const updated = [...data.sensors];
              updated[index] = { ...updated[index], is_active: checked };
              onUpdateSensor(updated);
            }}
            className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-300 data-[state=checked]:bg-cyan-500 transition-colors duration-300"
          >
            <Switch.Thumb className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 translate-x-1 data-[state=checked]:translate-x-6" />
          </Switch.Root>
        </div>
      </div>
    </div>
  );
};

/* =============================================================
   🧪 CalibrationTimeline
   Línea de tiempo vertical de calibraciones.
   ============================================================= */
const CalibrationTimeline = ({ calibrations }) => {
  if (calibrations.length === 0) {
    return <p className="text-gray-400 text-sm italic">Sin calibraciones previas.</p>;
  }

  return (
    <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-100">
      {calibrations.map((cal, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-8 top-1 w-5 h-5 rounded-full border-2 border-cyan-200 bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs font-semibold text-gray-700">{cal.sensor_name}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
              <span>{new Date(cal.created_at).toLocaleDateString()}</span>
              <span className="font-mono">Offset: {cal.offset}</span>
              <span className="font-mono">Factor: {cal.factor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* =============================================================
   🚨 AlertRuleCard
   Tarjeta de regla de alerta con chips visuales.
   ============================================================= */
const AlertRuleCard = ({ rule, data, index, onUpdateAlert }) => {
  const min = data.alerts[index]?.min_value ?? rule.min_value;
  const max = data.alerts[index]?.max_value ?? rule.max_value;
  const cooldown = data.alerts[index]?.cooldown_min ?? rule.cooldown_min;
  const isActive = data.alerts[index]?.is_active ?? rule.is_active;

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">{rule.sensor_name}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400">Activo</span>
          <Switch.Root
            checked={isActive}
            onCheckedChange={({ checked }) => {
              const updated = [...data.alerts];
              updated[index] = { ...updated[index], is_active: checked };
              onUpdateAlert(updated);
            }}
            className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-300 data-[state=checked]:bg-cyan-500 transition-colors duration-300"
          >
            <Switch.Thumb className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 translate-x-1 data-[state=checked]:translate-x-6" />
          </Switch.Root>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 mb-1">
            MIN
          </span>
          <input
            type="number"
            step="any"
            value={min}
            onChange={(e) => {
              const updated = [...data.alerts];
              updated[index] = { ...updated[index], min_value: e.target.value };
              onUpdateAlert(updated);
            }}
            placeholder="Mín"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-400 text-sm"
          />
        </div>
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-600 mb-1">
            MAX
          </span>
          <input
            type="number"
            step="any"
            value={max}
            onChange={(e) => {
              const updated = [...data.alerts];
              updated[index] = { ...updated[index], max_value: e.target.value };
              onUpdateAlert(updated);
            }}
            placeholder="Máx"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-400 text-sm"
          />
        </div>
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 mb-1">
            COOLDOWN
          </span>
          <input
            type="number"
            step="any"
            value={cooldown}
            onChange={(e) => {
              const updated = [...data.alerts];
              updated[index] = { ...updated[index], cooldown_min: e.target.value };
              onUpdateAlert(updated);
            }}
            placeholder="Cooldown min"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-amber-400 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

/* =============================================================
   📄 Edit – Página de edición de dispositivo con onboarding
   ============================================================= */
export default function Edit({ device, onboarding = false }) {
  // ------------------------------------------------------------
  // 1. Estado del stepper (solo activo si onboarding == true)
  // ------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(0);

  // ------------------------------------------------------------
  // 2. Normalización de datos derivados desde device.sensors
  // ------------------------------------------------------------
  const allCalibrations = useMemo(
    () =>
      device.sensors.flatMap((sensor) =>
        (sensor.calibrations || []).map((cal) => ({
          ...cal,
          sensor_id: sensor.id,
          sensor_name: sensor.sensor_type?.name || 'Sensor',
        }))
      ),
    [device.sensors]
  );

  const allAlertRules = useMemo(
    () =>
      device.sensors.flatMap((sensor) =>
        (sensor.alert_rules || []).map((rule) => ({
          ...rule,
          sensor_id: sensor.id,
          sensor_name: sensor.sensor_type?.name || 'Sensor',
        }))
      ),
    [device.sensors]
  );

  // ------------------------------------------------------------
  // 3. Formulario único con todos los datos editables
  // ------------------------------------------------------------
  const { data, setData, patch, processing, errors } = useForm({
    name: device.name || '',
    sensors: device.sensors.map((s) => ({
      id: s.id,
      sample_interval_s: s.sample_interval_s,
      is_active: s.is_active,
    })),
    new_calibration: {
      offset: '',
      factor: '',
    },
    alerts: allAlertRules.map((a) => ({
      id: a.id,
      min_value: a.min_value,
      max_value: a.max_value,
      cooldown_min: a.cooldown_min,
      is_active: a.is_active,
    })),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    patch(route('admin.devices.update', device.id), {
      preserveScroll: true,
      onSuccess: () => {
        if (onboarding) {
          router.visit(route('admin.aquariums.show', device.aquarium_id));
        }
      },
    });
  };

  const goToNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const goToPrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const skipStep = () => goToNextStep();

  // ------------------------------------------------------------
  // Funciones para actualizar arrays de sensores y alertas
  // ------------------------------------------------------------
  const updateSensors = (updatedSensors) => setData('sensors', updatedSensors);
  const updateAlerts = (updatedAlerts) => setData('alerts', updatedAlerts);

  // ------------------------------------------------------------
  // MODO ONBOARDING
  // ------------------------------------------------------------
  if (onboarding) {
    return (
      <DashboardLayout title="Configuración inicial del dispositivo">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 🎉 Premium header onboarding */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
              <CpuIcon className="w-4 h-4" />
              AquaSense Setup
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900">
              Configura tu nodo IoT
            </h1>
            <p className="text-gray-500 mt-2 font-medium max-w-lg mx-auto">
              Completa estos pasos para dejar tu dispositivo operativo y monitorizando tu acuario.
            </p>
          </div>

          <StepsIndicator currentStep={currentStep} />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ==================== STEP 1 – IDENTIDAD ==================== */}
            {currentStep === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings02Icon className="w-5 h-5 text-cyan-600" />
                  Identidad
                </h2>
                <FormField
                  label="Nombre del dispositivo"
                  value={data.name}
                  onChange={(v) => setData('name', v)}
                  error={errors.name}
                  placeholder="Nodo Gambario"
                />
                <div className="grid grid-cols-2 gap-4">
                  <ReadonlyField label="MAC Address" value={device.mac_address} />
                  <ReadonlyField label="IP Address" value={device.ip_address} />
                  <ReadonlyField label="Firmware" value={device.firmware_version} />
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={skipStep} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                    Omitir
                  </button>
                  <button type="button" onClick={goToNextStep} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-200">
                    Siguiente <ArrowRight02Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================== STEP 2 – SENSORES ==================== */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CpuIcon className="w-5 h-5 text-cyan-600" />
                  Sensores
                </h2>
                {device.sensors.length === 0 ? (
                  <p className="text-gray-500 italic">Este dispositivo no tiene sensores asociados.</p>
                ) : (
                  <div className="space-y-4">
                    {device.sensors.map((sensor, idx) => (
                      <SensorCard
                        key={sensor.id}
                        sensor={sensor}
                        data={data}
                        index={idx}
                        onUpdateSensor={updateSensors}
                      />
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <button type="button" onClick={goToPrevStep} className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                    <ArrowLeft02Icon className="w-4 h-4" /> Anterior
                  </button>
                  <div className="flex gap-4">
                    <button type="button" onClick={skipStep} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">Omitir</button>
                    <button type="button" onClick={goToNextStep} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-200">
                      Siguiente <ArrowRight02Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 3 – CALIBRACIÓN ==================== */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Configuration01Icon className="w-5 h-5 text-cyan-600" />
                  Calibración
                </h2>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Historial de calibraciones</h3>
                  <CalibrationTimeline calibrations={allCalibrations} />
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Registrar nueva calibración</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      type="number"
                      step="any"
                      label="Offset"
                      value={data.new_calibration.offset}
                      onChange={(v) => setData('new_calibration', { ...data.new_calibration, offset: v })}
                      error={errors['new_calibration.offset']}
                      placeholder="0.0"
                    />
                    <FormField
                      type="number"
                      step="any"
                      label="Factor"
                      value={data.new_calibration.factor}
                      onChange={(v) => setData('new_calibration', { ...data.new_calibration, factor: v })}
                      error={errors['new_calibration.factor']}
                      placeholder="1.0"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={goToPrevStep} className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                    <ArrowLeft02Icon className="w-4 h-4" /> Anterior
                  </button>
                  <div className="flex gap-4">
                    <button type="button" onClick={skipStep} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">Omitir</button>
                    <button type="button" onClick={goToNextStep} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-200">
                      Siguiente <ArrowRight02Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 4 – ALERTAS ==================== */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Alert01Icon className="w-5 h-5 text-cyan-600" />
                  Alertas
                </h2>
                {allAlertRules.length === 0 ? (
                  <p className="text-gray-500 italic">No hay reglas de alerta definidas para este dispositivo.</p>
                ) : (
                  <div className="space-y-4">
                    {allAlertRules.map((rule, idx) => (
                      <AlertRuleCard
                        key={rule.id}
                        rule={rule}
                        data={data}
                        index={idx}
                        onUpdateAlert={updateAlerts}
                      />
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <button type="button" onClick={goToPrevStep} className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                    <ArrowLeft02Icon className="w-4 h-4" /> Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-200 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {processing ? 'Guardando...' : 'Finalizar configuración'}
                    <Tick02Icon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </DashboardLayout>
    );
  }

  // ------------------------------------------------------------
  // MODO NORMAL (edición sin onboarding)
  // ------------------------------------------------------------
  return (
    <DashboardLayout title={`Editar dispositivo: ${device.name}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={route('admin.devices.index')}
            className="p-2 bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft02Icon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{device.name}</h1>
            <p className="text-gray-500 text-sm">{device.mac_address}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección identidad */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Identidad</h2>
            <FormField
              label="Nombre del dispositivo"
              value={data.name}
              onChange={(v) => setData('name', v)}
              error={errors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <ReadonlyField label="MAC Address" value={device.mac_address} />
              <ReadonlyField label="IP Address" value={device.ip_address} />
              <ReadonlyField label="Firmware" value={device.firmware_version} />
            </div>
          </div>

          {/* Sección sensores */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Sensores</h2>
            {device.sensors.length === 0 ? (
              <p className="text-gray-500 italic">Este dispositivo no tiene sensores asociados.</p>
            ) : (
              <div className="space-y-4">
                {device.sensors.map((sensor, idx) => (
                  <SensorCard
                    key={sensor.id}
                    sensor={sensor}
                    data={data}
                    index={idx}
                    onUpdateSensor={updateSensors}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sección calibración */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Calibración</h2>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Historial</h3>
              <CalibrationTimeline calibrations={allCalibrations} />
            </div>
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Nueva calibración</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  type="number"
                  step="any"
                  label="Offset"
                  value={data.new_calibration.offset}
                  onChange={(v) => setData('new_calibration', { ...data.new_calibration, offset: v })}
                  error={errors['new_calibration.offset']}
                />
                <FormField
                  type="number"
                  step="any"
                  label="Factor"
                  value={data.new_calibration.factor}
                  onChange={(v) => setData('new_calibration', { ...data.new_calibration, factor: v })}
                  error={errors['new_calibration.factor']}
                />
              </div>
            </div>
          </div>

          {/* Sección alertas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Alertas</h2>
            {allAlertRules.length === 0 ? (
              <p className="text-gray-500 italic">No hay reglas de alerta definidas.</p>
            ) : (
              <div className="space-y-4">
                {allAlertRules.map((rule, idx) => (
                  <AlertRuleCard
                    key={rule.id}
                    rule={rule}
                    data={data}
                    index={idx}
                    onUpdateAlert={updateAlerts}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-200 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {processing ? 'Guardando...' : 'Guardar cambios'}
              <Tick02Icon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
