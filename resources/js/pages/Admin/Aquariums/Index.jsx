import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

// ARK UI - Importaciones corregidas para evitar el error 'undefined'
import { Dialog } from '@ark-ui/react/dialog';
import { Switch } from '@ark-ui/react/switch';
import { Field } from '@ark-ui/react/field';

// Hugeicons (Instancia de componentes limpios)
import {
    FishFoodIcon,
    DropletIcon,
    CpuIcon,
    Cancel01Icon,
    Settings01Icon,
    ViewIcon
} from 'hugeicons-react';

/**
 * AQUARIUM CARD
 * Muestra el resumen de un acuario con indicadores de salud y acciones rápidas.
 */
const AquariumCard = ({ aquarium }) => {
    const isActive = aquarium.is_active;

    return (
        <article className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 overflow-hidden">
            {/* Barra de estado visual dinámica */}
            <div className={`h-1.5 w-full transition-colors duration-500 ${isActive ? 'bg-cyan-500' : 'bg-slate-300'}`} />

            <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-cyan-600 transition-colors truncate">
                            {aquarium.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            REF: {String(aquarium.id).padStart(4, '0')}
                        </span>
                    </div>
                    <StatusBadge active={isActive} />
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] leading-relaxed">
                    {aquarium.description || 'Sin especificaciones técnicas registradas.'}
                </p>

                {/* Grid de Metadatos */}
                <div className="flex gap-3 py-1">
                    <MetadataChip
                        icon={<DropletIcon size={16} />}
                        label="Volumen"
                        value={`${aquarium.volume_liters}L`}
                        colorClass="text-cyan-500"
                    />
                    <MetadataChip
                        icon={<CpuIcon size={16} />}
                        label="Sensores"
                        value={aquarium.devices_count}
                        colorClass="text-indigo-500"
                    />
                </div>

                {/* Especies Badge */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <FishFoodIcon size={18} className="text-cyan-600" />
                    <span className="truncate">
                        <span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Bio:</span>
                        {aquarium.species || 'Comunidad mixta'}
                    </span>
                </div>

                {/* Acciones de Producción */}
                <div className="flex gap-2 pt-2">
                    <Link
                        href={route('admin.aquariums.show', aquarium.id)}
                        className="flex-[2] flex justify-center items-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-cyan-600 transition-all shadow-lg shadow-slate-100 active:scale-95"
                    >
                        <ViewIcon size={18} /> Monitorear
                    </Link>
                    <Link
                        href={route('admin.aquariums.edit', aquarium.id)}
                        className="flex-1 flex justify-center items-center py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                        title="Configuración"
                    >
                        <Settings01Icon size={18} />
                    </Link>
                </div>
            </div>
        </article>
    );
};

/**
 * COMPONENTES DE SOPORTE (UI ATOMS)
 */
const StatusBadge = ({ active }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
        ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        {active ? 'Online' : 'Offline'}
    </div>
);

const MetadataChip = ({ icon, label, value, colorClass }) => (
    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className={colorClass}>{icon}</div>
        <div className="overflow-hidden">
            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">{label}</p>
            <p className="text-sm font-black text-slate-700 leading-none">{value}</p>
        </div>
    </div>
);

/**
 * MODAL DE CREACIÓN
 * Implementa ARK UI Dialog para accesibilidad y lógica de formulario Inertia.
 */
const CreateAquariumModal = ({ isOpen, onClose }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        volume_liters: '',
        species: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.aquariums.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
            <Dialog.Backdrop className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 transition-opacity" />
            <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Dialog.Content className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white outline-none">
                    {/* Header del Modal */}
                    <header className="px-8 py-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex justify-between items-center">
                        <div>
                            <Dialog.Title className="text-2xl font-black tracking-tight">Nuevo Acuario</Dialog.Title>
                            <Dialog.Description className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">
                                AquaSense Control System
                            </Dialog.Description>
                        </div>
                        <Dialog.CloseTrigger className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Cancel01Icon size={24} />
                        </Dialog.CloseTrigger>
                    </header>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <FormField label="Identificador del Tanque" value={data.name} error={errors.name}
                                           onChange={v => setData('name', v)} placeholder="Ej. Arrecife Tropical 01" />
                            </div>
                            <FormField type="number" label="Capacidad (L)" value={data.volume_liters} error={errors.volume_liters}
                                       onChange={v => setData('volume_liters', v)} placeholder="0" />
                            <FormField label="Especies" value={data.species} error={errors.species}
                                       onChange={v => setData('species', v)} placeholder="Peces, Corales..." />
                        </div>

                        <FormField multiline label="Notas Técnicas / Descripción" value={data.description} error={errors.description}
                                   onChange={v => setData('description', v)} />

                        {/* Switch de Estado con ARK UI */}
                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-colors">
                            <div className="space-y-0.5">
                                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Inicializar Monitoreo</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Activar telemetría tras crear</p>
                            </div>
                            <Switch.Root checked={data.is_active} onCheckedChange={(e) => setData('is_active', e.checked)}
                                         className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 data-[state=checked]:bg-cyan-500 bg-slate-300">
                                <Switch.Thumb className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
                            </Switch.Root>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Dialog.CloseTrigger asChild>
                                <button type="button" className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                                    Descartar
                                </button>
                            </Dialog.CloseTrigger>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-[2] py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Sincronizando...' : 'Confirmar Registro'}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

const FormField = ({ label, value, onChange, error, type = 'text', placeholder, multiline = false }) => (
    <Field.Root className="space-y-2" invalid={!!error}>
        <Field.Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {label}
        </Field.Label>
        {multiline ? (
            <Field.Textarea
                rows={3}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none resize-none h-24"
            />
        ) : (
            <Field.Input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none"
            />
        )}
        <Field.ErrorText className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">
            {error}
        </Field.ErrorText>
    </Field.Root>
);

/**
 * PÁGINA INDEX
 */
export default function Index({ aquariums }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <DashboardLayout title="Acuarios">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                            Mis <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-blue-700">Acuarios</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg">
                            Gestión integral de ecosistemas inteligentes AquaSense.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                    >
                        <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
                        Nuevo Acuario
                    </button>
                </header>

                {aquariums.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {aquariums.map(aquarium => (
                            <AquariumCard key={aquarium.id} aquarium={aquarium} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <div className="p-8 bg-slate-50 rounded-full inline-block mb-6 text-slate-300">
                            <FishFoodIcon size={64} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Ecosistema Vacío</h3>
                        <p className="text-slate-400 font-medium mb-8">No hemos detectado tanques vinculados a tu cuenta.</p>
                        <button onClick={() => setShowModal(true)} className="text-cyan-600 font-black text-xs uppercase tracking-[0.2em] hover:text-cyan-700 underline underline-offset-8">
                            Registrar Primer Tanque
                        </button>
                    </div>
                )}

                <CreateAquariumModal isOpen={showModal} onClose={() => setShowModal(false)} />
            </div>
        </DashboardLayout>
    );
}
