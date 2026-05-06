import { useState, useRef, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import * as d3 from 'd3';
import { Html5Qrcode } from "html5-qrcode";

// 📦 ARK UI
import { Dialog } from '@ark-ui/react/dialog';
import { Field } from '@ark-ui/react/field';

// 🌊 Hugeicons React (AquaSense Set)
import {
  DropletIcon,
  ThermometerIcon,
  SunCloudFastWind02Icon,
  WaterPumpIcon,
  ArrowLeft02Icon,
  Settings02Icon,
  Cancel01Icon,
  QrCode01Icon,
  KeyboardIcon,
  DashboardSpeed01Icon,
  CheckmarkCircle02Icon,
  ArtificialIntelligence08Icon
} from 'hugeicons-react';

/* =============================================================
   🏷️ UI COMPONENTS (Atoms)
   ============================================================= */

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-colors
    ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
    {active ? 'Online' : 'Offline'}
  </span>
);

const MetricCard = ({ icon: Icon, label, value, unit, colorClass = 'text-cyan-500' }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 ${colorClass} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <div className="text-3xl font-black text-slate-900 tracking-tighter">
            {value !== null ? (
              <>
                {value}
                <span className="text-sm font-bold text-slate-400 ml-1 tracking-normal">{unit}</span>
              </>
            ) : (
              <span className="text-sm text-slate-300 italic font-medium tracking-normal">Sin datos</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =============================================================
   📈 TELEMETRY CHART (D3 Container)
   ============================================================= */

const TelemetryChart = ({ data, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;
    d3.select(chartRef.current).selectAll("*").remove();
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0 0 800 300")
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Pipeline para lógica D3 futura inyectada aquí
  }, [data]);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500" /> {title}
      </h3>
      <div className="w-full h-64 flex items-center justify-center">
        {data?.length > 0 ? (
          <div ref={chartRef} className="w-full h-full" />
        ) : (
          <div className="text-center space-y-2">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin telemetría disponible</p>
            <p className="text-[10px] text-slate-300 uppercase tracking-tighter">Esperando paquetes de datos del nodo...</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* =============================================================
   🧱 DEVICE CARD (Domain Driven)
   ============================================================= */

const DeviceCard = ({ device }) => (
  <div className="group flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
        <WaterPumpIcon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]">{device.name}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          FW: v{device.firmware_version} • MAC: {device.mac_address}
        </p>
        <p className="text-[9px] font-medium text-slate-300 uppercase tracking-tighter mt-0.5">
          IP: {device.ip_address} • Visto: {device.last_seen_at || 'Desconectado'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <StatusBadge active={device.status === 'online'} />
      <Link href={route('admin.devices.edit', device.id)} className="p-2 text-slate-300 hover:text-cyan-600 transition-colors">
        <Settings02Icon size={18} />
      </Link>
    </div>
  </div>
);

/* =============================================================
   🪄 ADD DEVICE MODAL (Claiming Flow + QR)
   ============================================================= */

const AddDeviceModal = ({ isOpen, onClose, aquariumId }) => {
  const [activeTab, setActiveTab] = useState('qr');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const scannerId = "qr-reader-region";

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    aquarium_id: aquariumId,
    device_identifier: '',
  });

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      reset();
      clearErrors();
    }
  }, [isOpen]);

  const startScanner = async () => {
    setIsScanning(true);
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setData('device_identifier', decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err) {
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().then(() => setIsScanning(false));
    } else {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.devices.claim'), {
      onSuccess: () => { reset(); onClose(); }
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 transition-opacity" />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Content className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white outline-none">

          <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <Dialog.Title className="text-xl font-black uppercase tracking-tighter">Vincular Nodo</Dialog.Title>
              <Dialog.Description className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">AquaSense Smart Pairing</Dialog.Description>
            </div>
            <Dialog.CloseTrigger className="p-2 hover:bg-white/10 rounded-full transition-colors outline-none">
              <Cancel01Icon size={24} />
            </Dialog.CloseTrigger>
          </div>

          <div className="flex p-1 bg-slate-50 mx-8 mt-6 rounded-2xl border border-slate-100">
            <button onClick={() => { setActiveTab('qr'); clearErrors(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'qr' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-400'}`}>
              <QrCode01Icon size={16} /> QR
            </button>
            <button onClick={() => { setActiveTab('manual'); stopScanner(); clearErrors(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-400'}`}>
              <KeyboardIcon size={16} /> Manual
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {activeTab === 'qr' ? (
              <div className="space-y-4">
                <div className="relative aspect-square w-full bg-slate-900 rounded-[2rem] overflow-hidden">
                  <div id={scannerId} className="w-full h-full" />
                  {!isScanning && !data.device_identifier && (
                    <button type="button" onClick={startScanner} className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <QrCode01Icon size={48} className="mb-4 text-slate-700" />
                      <span className="px-6 py-3 bg-cyan-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Activar Cámara</span>
                    </button>
                  )}
                  {data.device_identifier && (
                    <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white p-6">
                      <CheckmarkCircle02Icon size={48} className="mb-2" />
                      <p className="text-lg font-mono font-bold tracking-tighter">{data.device_identifier}</p>
                      <button type="button" onClick={() => { setData('device_identifier', ''); startScanner(); }} className="mt-4 text-[10px] font-bold uppercase underline">Reintentar</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Field.Root invalid={!!errors.device_identifier}>
                <Field.Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Device ID</Field.Label>
                <Field.Input value={data.device_identifier} onChange={e => setData('device_identifier', e.target.value.toUpperCase())} placeholder="AQS-2026-XXXX" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-500/50 outline-none" />
              </Field.Root>
            )}

            {(processing || errors.device_identifier) && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <DashboardSpeed01Icon size={18} className={errors.device_identifier ? "text-rose-500" : "text-cyan-500"} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {processing ? "Buscando dispositivo..." : errors.device_identifier}
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
              <button type="submit" disabled={processing || !data.device_identifier} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-600 active:scale-95 transition-all disabled:opacity-50 shadow-xl">
                Vincular Ahora
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

/* =============================================================
   📄 MAIN PAGE (Show)
   ============================================================= */

export default function Show({ aquarium }) {
  const [showModal, setShowModal] = useState(false);

  // Selector de dominio: Busca la lectura más reciente para un slug específico
  const read = (slug) => {
    const sensor = aquarium.devices?.flatMap(d => d.sensors || [])
                   .find(s => s.sensor_type?.slug === slug);
    return sensor?.latest_reading ? { val: sensor.latest_reading.value, unit: sensor.sensor_type.unit } : null;
  };

  const metrics = {
    temp: read('temperature'),
    ph: read('ph'),
    tds: read('tds'),
    oxygen: read('dissolved_oxygen')
  };

  return (
    <DashboardLayout title={`AquaSense | ${aquarium.name}`}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link href={route('admin.aquariums.index')} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-cyan-600 shadow-sm transition-all">
              <ArrowLeft02Icon size={20} />
            </Link>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{aquarium.name}</h1>
              <div className="flex items-center gap-3">
                <StatusBadge active={aquarium.is_active} />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] border-l border-slate-200 pl-3">
                  {aquarium.volume_liters}L • {aquarium.species}
                </p>
              </div>
            </div>
          </div>
          <Link href={route('admin.aquariums.edit', aquarium.id)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Settings02Icon size={16} /> Configuración
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          <div className="lg:col-span-2 space-y-10">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard icon={ThermometerIcon} label="Temperatura" value={metrics.temp?.val} unit={metrics.temp?.unit} colorClass="text-orange-500" />
              <MetricCard icon={DropletIcon} label="Nivel de pH" value={metrics.ph?.val} unit={metrics.ph?.unit} colorClass="text-cyan-500" />
              <MetricCard icon={SunCloudFastWind02Icon} label="Oxígeno Disuelto" value={metrics.oxygen?.val} unit={metrics.oxygen?.unit} colorClass="text-blue-500" />
              <MetricCard icon={ArtificialIntelligence08Icon} label="TDS / Pureza" value={metrics.tds?.val} unit={metrics.tds?.unit} colorClass="text-indigo-500" />
            </section>

            <TelemetryChart title="Histórico de Telemetría" data={[]} />
          </div>

          <aside className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                <WaterPumpIcon size={18} className="text-indigo-500" /> Nodos IoT
              </h2>
              <button onClick={() => setShowModal(true)} className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700 transition-colors">
                + Vincular
              </button>
            </div>

            <div className="space-y-4">
              {aquarium.devices?.length > 0 ? (
                aquarium.devices.map(d => <DeviceCard key={d.id} device={d} />)
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                  <WaterPumpIcon size={32} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin hardware vinculado</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        <AddDeviceModal isOpen={showModal} onClose={() => setShowModal(false)} aquariumId={aquarium.id} />
      </div>
    </DashboardLayout>
  );
}
