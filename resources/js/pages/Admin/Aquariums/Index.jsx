import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

// Iconos
const FishIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const TempIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const PhIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const TdsIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 10H9L8 4z" /></svg>;
const DeviceIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 7h14M5 17h14M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>;
const WaterIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 10H9L8 4z" /></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// Mock data
const mockAquariums = [
  {
    id: 1,
    name: "Amazon Reef",
    description: "Aquarium tropical con especies amazónicas",
    volume_liters: 250,
    species: "Angelfish, Neon Tetras, Corydoras",
    is_active: true,
    devices_count: 4,
    avg_temperature: 25.2,
    avg_ph: 7.1,
    avg_tds: 312,
    last_updated: "2024-01-15T10:30:00"
  },
  {
    id: 2,
    name: "Coral Garden",
    description: "Arrecife de coral con sistema de agua salada",
    volume_liters: 500,
    species: "Clownfish, Tang, Corals",
    is_active: true,
    devices_count: 6,
    avg_temperature: 26.5,
    avg_ph: 8.2,
    avg_tds: 285,
    last_updated: "2024-01-15T10:25:00"
  },
  {
    id: 3,
    name: "Shrimp Haven",
    description: "Criadero de camarones cherry",
    volume_liters: 80,
    species: "Cherry Shrimp, Moss Balls",
    is_active: false,
    devices_count: 2,
    avg_temperature: 23.8,
    avg_ph: 6.9,
    avg_tds: 198,
    last_updated: "2024-01-14T15:20:00"
  },
  {
    id: 4,
    name: "Discus Dream",
    description: "Acuario para discus de alta calidad",
    volume_liters: 350,
    species: "Discus, Cardinals, Rummy Nose",
    is_active: true,
    devices_count: 5,
    avg_temperature: 28.5,
    avg_ph: 6.5,
    avg_tds: 156,
    last_updated: "2024-01-15T09:15:00"
  },
  {
    id: 5,
    name: "Planted Paradise",
    description: "Acuario plantado de alta tecnología",
    volume_liters: 180,
    species: "Harlequin Rasboras, Otocinclus",
    is_active: true,
    devices_count: 4,
    avg_temperature: 24.5,
    avg_ph: 6.8,
    avg_tds: 245,
    last_updated: "2024-01-15T11:00:00"
  },
  {
    id: 6,
    name: "Betta Palace",
    description: "Hábitat para bettas con plantas naturales",
    volume_liters: 40,
    species: "Betta Splendens",
    is_active: true,
    devices_count: 2,
    avg_temperature: 26.0,
    avg_ph: 7.0,
    avg_tds: 178,
    last_updated: "2024-01-15T08:45:00"
  }
];

// Aquarium Card Component
const AquariumCard = ({ aquarium, onView, onEdit }) => {
  const getQualityColor = (value, type) => {
    if (type === 'ph') {
      if (value >= 6.5 && value <= 7.5) return 'text-green-600';
      if (value >= 6.0 && value <= 8.0) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'temperature') {
      if (value >= 24 && value <= 28) return 'text-green-600';
      if (value >= 22 && value <= 30) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'tds') {
      if (value <= 300) return 'text-green-600';
      if (value <= 400) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <FishIcon />
              <span>{aquarium.name}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">ID: {aquarium.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            {aquarium.is_active ? (
              <span className="relative inline-flex">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                <span className="ml-2 text-xs font-medium text-green-600">Activo</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-xs font-medium text-gray-500">Inactivo</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{aquarium.description}</p>

        {/* Basic Info */}
        <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-1">
            <WaterIcon className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">{aquarium.volume_liters} L</span>
          </div>
          <div className="flex items-center space-x-1">
            <DeviceIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{aquarium.devices_count} sensores</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg">
            <TempIcon className="w-4 h-4 text-orange-500 mx-auto mb-1" />
            <p className={`text-sm font-bold ${getQualityColor(aquarium.avg_temperature, 'temperature')}`}>
              {aquarium.avg_temperature}°C
            </p>
            <p className="text-xs text-gray-500">Temp</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg">
            <PhIcon className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className={`text-sm font-bold ${getQualityColor(aquarium.avg_ph, 'ph')}`}>
              {aquarium.avg_ph}
            </p>
            <p className="text-xs text-gray-500">pH</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg">
            <TdsIcon className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className={`text-sm font-bold ${getQualityColor(aquarium.avg_tds, 'tds')}`}>
              {aquarium.avg_tds} ppm
            </p>
            <p className="text-xs text-gray-500">TDS</p>
          </div>
        </div>

        {/* Species */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <span className="font-medium">Especies: </span>
          {aquarium.species}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => onView(aquarium)}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Ver Detalles
          </button>
          <button
            onClick={() => onEdit(aquarium)}
            className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:border-cyan-600 hover:text-cyan-600 transition-all duration-300"
          >
            Editar
          </button>
        </div>

        {/* Last updated */}
        <p className="text-xs text-gray-400 text-center pt-2">
          Última actualización: {new Date(aquarium.last_updated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Create Aquarium Modal
const CreateAquariumModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    volume_liters: '',
    species: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.volume_liters || formData.volume_liters <= 0) newErrors.volume_liters = 'Volumen debe ser mayor a 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAquarium = {
      id: Date.now(),
      ...formData,
      volume_liters: parseFloat(formData.volume_liters),
      devices_count: 0,
      avg_temperature: 25.0,
      avg_ph: 7.0,
      avg_tds: 250,
      last_updated: new Date().toISOString()
    };
    onSave(newAquarium);
    onClose();
    setFormData({ name: '', description: '', volume_liters: '', species: '', is_active: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Acuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Acuario *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all`}
              placeholder="Ej: Amazon Reef"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all resize-none"
              placeholder="Describe tu acuario..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Volumen (litros) *
            </label>
            <input
              type="number"
              name="volume_liters"
              value={formData.volume_liters}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.volume_liters ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all`}
              placeholder="250"
            />
            {errors.volume_liters && <p className="text-xs text-red-500 mt-1">{errors.volume_liters}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Especies
            </label>
            <input
              type="text"
              name="species"
              value={formData.species}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
              placeholder="Ej: Angelfish, Tetras"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Activo</label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-cyan-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Page Component
const AquariumsIndex = () => {
  const [aquariums, setAquariums] = useState(mockAquariums);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (aquarium) => {
    console.log('View aquarium:', aquarium);
  };

  const handleEdit = (aquarium) => {
    console.log('Edit aquarium:', aquarium);
  };

  const handleSave = (newAquarium) => {
    setAquariums(prev => [newAquarium, ...prev]);
  };

  return (
    <DashboardLayout title="Aquariums">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Acuarios</h1>
            <p className="text-gray-600 mt-1">Gestiona y monitorea todos tus acuarios desde un solo lugar</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            + Agregar Acuario
          </button>
        </div>
      </div>

      {/* Aquariums Grid */}
      {aquariums.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <FishIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay acuarios aún</h3>
          <p className="text-gray-500 mb-6">Comienza creando tu primer acuario</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Crear mi primer acuario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {aquariums.map(aquarium => (
            <AquariumCard
              key={aquarium.id}
              aquarium={aquarium}
              onView={handleView}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateAquariumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AquariumsIndex;
