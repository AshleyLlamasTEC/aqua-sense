import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import * as d3 from "d3";
import { Html5Qrcode } from "html5-qrcode";

// 📦 ARK UI
import { Dialog } from "@ark-ui/react/dialog";
import { Field } from "@ark-ui/react/field";
import { Select, createListCollection } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";

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
    ArtificialIntelligence08Icon,
    Maximize01Icon,
} from "hugeicons-react";

/* =============================================================
   🏷️ UI COMPONENTS (Atoms)
   ============================================================= */

const StatusBadge = ({ active }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-colors
    ${active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}`}
    >
        <span
            className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
        />
        {active ? "Online" : "Offline"}
    </span>
);

const MetricCard = ({
    icon: Icon,
    label,
    value,
    unit,
    colorClass = "text-cyan-500",
}) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
        <div className="flex items-start justify-between">
            <div className="space-y-3">
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 ${colorClass} group-hover:scale-110 transition-transform`}
                >
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        {label}
                    </p>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                        {value !== null ? (
                            <>
                                {value}
                                <span className="text-sm font-bold text-slate-400 ml-1 tracking-normal">
                                    {unit}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm text-slate-300 italic font-medium tracking-normal">
                                Sin datos
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* =============================================================
   🎨 CONSTANTS FOR TELEMETRY CHART
   ============================================================= */

const SENSOR_COLORS = {
    temperature: "#f97316",
    ph: "#06b6d4",
    tds: "#6366f1",
    dissolved_oxygen: "#3b82f6",
};

const SENSOR_LABELS = {
    temperature: "Temperatura",
    ph: "pH",
    tds: "TDS",
    dissolved_oxygen: "Oxígeno Disuelto",
};

const TIME_RANGES = [
    { label: "Últimas 24 horas", value: 24 },
    { label: "Últimos 7 días", value: 168 },
    { label: "Últimos 30 días", value: 720 },
];

/* =============================================================
   📈 CHART DRAWING LOGIC (Pure D3)
   ============================================================= */

/**
 * Dibuja una gráfica D3 en un contenedor HTML usando series agrupadas.
 * No devuelve nada, muta el DOM del contenedor.
 */
function drawChart(
    container,
    series,
    width,
    height,
    margin = { top: 20, right: 30, bottom: 40, left: 60 },
) {
    // Limpiar contenedor
    d3.select(container).selectAll("*").remove();

    // Preparar todos los puntos
    const allData = Object.values(series).flat();
    if (allData.length === 0) return;

    // Crear SVG con viewBox para escalado automático
    const svg = d3
        .select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("overflow", "visible");

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const xDomain = d3.extent(allData, (d) => d.timestamp);
    const yDomain = d3.extent(allData, (d) => d.value);

    const x = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

    const y = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

    // Ejes
    const xAxis = d3
        .axisBottom(x)
        .ticks(width > 600 ? 8 : 5)
        .tickFormat(d3.timeFormat("%H:%M\n%m/%d"));

    const yAxis = d3.axisLeft(y).ticks(5);

    g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .call((g) => g.select(".domain").attr("stroke", "#cbd5e1")) // slate-300
        .call((g) => g.selectAll(".tick line").attr("stroke", "#e2e8f0"));

    g.append("g")
        .call(yAxis)
        .call((g) => g.select(".domain").attr("stroke", "#cbd5e1"))
        .call((g) => g.selectAll(".tick line").attr("stroke", "#e2e8f0"));

    // Grid horizontal suave
    g.append("g")
        .attr("class", "grid")
        .call(
            d3
                .axisLeft(y)
                .ticks(5)
                .tickSize(-innerWidth)
                .tickFormat(() => ""),
        )
        .call((g) =>
            g
                .selectAll(".tick line")
                .attr("stroke", "#e2e8f0")
                .attr("stroke-opacity", 0.7),
        )
        .call((g) => g.select(".domain").remove());

    // Líneas
    Object.entries(series).forEach(([slug, points]) => {
        const lineGen = d3
            .line()
            .x((d) => x(d.timestamp))
            .y((d) => y(d.value))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", SENSOR_COLORS[slug] || "#94a3b8")
            .attr("stroke-width", 2)
            .attr("d", lineGen);
    });

    // --- Tooltip ---
    const tooltip = d3
        .select(container)
        .append("div")
        .attr("class", "chart-tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "rgba(255,255,255,0.95)")
        .style("padding", "6px 12px")
        .style("border-radius", "12px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("color", "#1e293b")
        .style("opacity", 0)
        .style("transition", "opacity 0.1s");

    // Bisectriz y overlay interactivo
    const bisect = d3.bisector((d) => d.timestamp).left;

    const overlay = svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all");

    overlay
        .on("mousemove", function (event) {
            const [mx, my] = d3.pointer(event, this);
            const x0 = x.invert(mx - margin.left);

            // Encontrar punto más cercano entre todos los datos
            let closest = null;
            let minDist = Infinity;
            allData.forEach((d) => {
                const dist = Math.abs(d.timestamp - x0);
                if (dist < minDist) {
                    minDist = dist;
                    closest = d;
                }
            });

            if (closest) {
                const label = SENSOR_LABELS[closest.sensor] || closest.sensor;
                tooltip
                    .style("opacity", 1)
                    .html(
                        `
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SENSOR_COLORS[closest.sensor] || "#94a3b8"};"></span>
                        <span>${label}</span>
                    </div>
                    <div style="font-size:13px;font-weight:800;">${closest.value.toFixed(2)}</div>
                    <div style="font-size:9px;color:#64748b;">${d3.timeFormat("%d/%m %H:%M")(closest.timestamp)}</div>
                `,
                    )
                    .style(
                        "left",
                        `${Math.min(mx + 15, container.offsetWidth - 120)}px`,
                    )
                    .style("top", `${Math.max(my - 50, 10)}px`);
            }
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));
}

/* =============================================================
   📊 CHART VIEW COMPONENT (Reutilizable)
   ============================================================= */

const ChartView = ({
    series,
    width = 800,
    height = 300,
    margin,
    className = "",
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !series) return;
        drawChart(containerRef.current, series, width, height, margin);
        // cleanup: se limpia al inicio del siguiente dibujo
    }, [series, width, height, margin]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full ${className}`}
            style={{ minHeight: height }}
        />
    );
};

/* =============================================================
   🎛️ FILTERS COMPONENT (Ark UI Selects)
   ============================================================= */

const TelemetryFilters = ({
    devices,
    deviceFilter,
    onDeviceChange,
    selectedParameters,
    onParametersChange,
    timeRange,
    onTimeRangeChange,
    availableSlugs,
}) => {
    // Colecciones para Ark UI Select
    const deviceCollection = useMemo(
        () =>
            createListCollection({
                items: [
                    { label: "Todos los dispositivos", value: "all" },
                    ...devices.map((d) => ({
                        label: d.name,
                        value: d.id.toString(),
                    })),
                ],
            }),
        [devices],
    );

    const parameterCollection = useMemo(
        () =>
            createListCollection({
                items: availableSlugs.map((slug) => ({
                    label: SENSOR_LABELS[slug] || slug,
                    value: slug,
                })),
            }),
        [availableSlugs],
    );

    const timeCollection = useMemo(
        () =>
            createListCollection({
                items: TIME_RANGES.map((r) => ({
                    label: r.label,
                    value: r.value.toString(),
                })),
            }),
        [],
    );

    return (
        <div className="flex flex-wrap items-end gap-4 mb-6">
            {/* Dispositivo */}
            <Select.Root
                collection={deviceCollection}
                value={[deviceFilter]}
                onValueChange={(e) => onDeviceChange(e.value[0] || "all")}
            >
                <Select.Label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Dispositivo
                </Select.Label>
                <Select.Control>
                    <Select.Trigger className="inline-flex items-center justify-between gap-2 min-w-[180px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition">
                        <Select.ValueText />
                    </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                    <Select.Content className="bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50">
                        <Select.ItemGroup>
                            {deviceCollection.items.map((item) => (
                                <Select.Item
                                    key={item.value}
                                    item={item}
                                    className="cursor-pointer px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 data-[state=checked]:bg-cyan-50 data-[state=checked]:text-cyan-700 transition"
                                >
                                    <Select.ItemText>
                                        {item.label}
                                    </Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.ItemGroup>
                    </Select.Content>
                </Select.Positioner>
            </Select.Root>

            {/* Parámetros (múltiple) */}
            <Select.Root
                collection={parameterCollection}
                multiple
                value={selectedParameters}
                onValueChange={(e) => onParametersChange(e.value)}
            >
                <Select.Label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Sensores
                </Select.Label>
                <Select.Control>
                    <Select.Trigger className="inline-flex items-center justify-between gap-2 min-w-[180px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition">
                        <Select.ValueText placeholder="Todos los sensores" />
                    </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                    <Select.Content className="bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50">
                        <Select.ItemGroup>
                            {parameterCollection.items.map((item) => (
                                <Select.Item
                                    key={item.value}
                                    item={item}
                                    className="cursor-pointer px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 data-[state=checked]:bg-cyan-50 data-[state=checked]:text-cyan-700 transition"
                                >
                                    <Select.ItemText>
                                        {item.label}
                                    </Select.ItemText>
                                    <Select.ItemIndicator>
                                        ✓
                                    </Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.ItemGroup>
                    </Select.Content>
                </Select.Positioner>
            </Select.Root>

            {/* Tiempo */}
            <Select.Root
                collection={timeCollection}
                value={[timeRange.toString()]}
                onValueChange={(e) => onTimeRangeChange(Number(e.value[0]))}
            >
                <Select.Label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Rango
                </Select.Label>
                <Select.Control>
                    <Select.Trigger className="inline-flex items-center justify-between gap-2 min-w-[180px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition">
                        <Select.ValueText />
                    </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                    <Select.Content className="bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50">
                        <Select.ItemGroup>
                            {timeCollection.items.map((item) => (
                                <Select.Item
                                    key={item.value}
                                    item={item}
                                    className="cursor-pointer px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 data-[state=checked]:bg-cyan-50 data-[state=checked]:text-cyan-700 transition"
                                >
                                    <Select.ItemText>
                                        {item.label}
                                    </Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.ItemGroup>
                    </Select.Content>
                </Select.Positioner>
            </Select.Root>
        </div>
    );
};

/* =============================================================
   🖥️ TELEMETRY CHART (Completo y funcional)
   ============================================================= */
const TelemetryChart = ({ data, devices, title }) => {
    const [deviceFilter, setDeviceFilter] = useState("all");
    const [selectedParameters, setSelectedParameters] = useState([]);
    const [timeRange, setTimeRange] = useState(24);
    const [expanded, setExpanded] = useState(false); // Controla la vista ampliada

    const availableSlugs = useMemo(
        () => [...new Set(data.map((d) => d.sensor))].filter(Boolean),
        [data],
    );

    const processedSeries = useMemo(() => {
        if (!data.length) return {};

        const now = Date.now();
        const since = new Date(now - timeRange * 3600 * 1000);

        let filtered =
            deviceFilter === "all"
                ? data
                : data.filter((d) => d.device_id.toString() === deviceFilter);

        filtered = filtered.filter((d) => d.timestamp >= since);

        const slugsToShow =
            selectedParameters.length > 0
                ? selectedParameters
                : [...new Set(filtered.map((d) => d.sensor))];

        filtered = filtered.filter((d) => slugsToShow.includes(d.sensor));

        const grouped = {};
        slugsToShow.forEach((slug) => {
            const series = filtered
                .filter((d) => d.sensor === slug)
                .sort((a, b) => a.timestamp - b.timestamp);
            if (series.length) grouped[slug] = series;
        });

        return grouped;
    }, [data, deviceFilter, selectedParameters, timeRange]);

    const inlineWidth = 800;
    const inlineHeight = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    const legendEntries = Object.keys(processedSeries);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            {/* Header con botón Ampliar */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500" /> {title}
                </h3>
                <button
                    onClick={() => setExpanded(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-white hover:border-cyan-300 hover:text-cyan-700 transition-all"
                >
                    <Maximize01Icon size={16} />
                    <span className="uppercase tracking-wider">Ampliar</span>
                </button>
            </div>

            {/* Filtros */}
            <TelemetryFilters
                devices={devices}
                deviceFilter={deviceFilter}
                onDeviceChange={setDeviceFilter}
                selectedParameters={selectedParameters}
                onParametersChange={setSelectedParameters}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                availableSlugs={availableSlugs}
            />

            {/* Gráfica inline */}
            <div className="w-full h-64">
                {Object.keys(processedSeries).length > 0 ? (
                    <ChartView
                        series={processedSeries}
                        width={inlineWidth}
                        height={inlineHeight}
                        margin={margin}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                            Sin telemetría para los filtros actuales
                        </p>
                    </div>
                )}
            </div>

            {/* Leyenda */}
            {legendEntries.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold">
                    {legendEntries.map((slug) => (
                        <div key={slug} className="flex items-center gap-2">
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: SENSOR_COLORS[slug] }}
                            />
                            {SENSOR_LABELS[slug] || slug}
                        </div>
                    ))}
                </div>
            )}

            {/* Overlay de pantalla completa (sin Dialog) */}
            {expanded && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    onClick={() => setExpanded(false)} // Cierra al hacer clic en el fondo
                >
                    <div
                        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-white"
                        onClick={(e) => e.stopPropagation()} // Evita cierre al hacer clic dentro
                    >
                        {/* Barra superior del overlay */}
                        <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-slate-100 rounded-t-[2.5rem]">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                {title} - Vista ampliada
                            </h2>
                            <button
                                onClick={() => setExpanded(false)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition"
                            >
                                <Cancel01Icon
                                    size={24}
                                    className="text-slate-500"
                                />
                            </button>
                        </div>

                        {/* Contenido con la gráfica */}
                        <div className="flex-1 p-8 overflow-hidden">
                            {Object.keys(processedSeries).length > 0 ? (
                                <ChartView
                                    series={processedSeries}
                                    width={1200}
                                    height={500}
                                    margin={{ ...margin, bottom: 50 }}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-lg">
                                        Sin datos para los filtros actuales
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Leyenda en overlay */}
                        {legendEntries.length > 0 && (
                            <div className="px-8 pb-6 flex flex-wrap gap-4 text-xs font-semibold justify-center">
                                {legendEntries.map((slug) => (
                                    <div
                                        key={slug}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className="inline-block w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    SENSOR_COLORS[slug],
                                            }}
                                        />
                                        {SENSOR_LABELS[slug] || slug}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
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
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]">
                    {device.name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    FW: v{device.firmware_version} • MAC: {device.mac_address}
                </p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-tighter mt-0.5">
                    IP: {device.ip_address} • Visto:{" "}
                    {device.last_seen_at || "Desconectado"}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <StatusBadge active={device.status === "online"} />
            <Link
                href={route("admin.devices.edit", device.id)}
                className="p-2 text-slate-300 hover:text-cyan-600 transition-colors"
            >
                <Settings02Icon size={18} />
            </Link>
        </div>
    </div>
);

/* =============================================================
   🪄 ADD DEVICE MODAL (Claiming Flow + QR) (Sin cambios)
   ============================================================= */

const AddDeviceModal = ({ isOpen, onClose, aquariumId }) => {
    const [activeTab, setActiveTab] = useState("qr");
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const scannerId = "qr-reader-region";

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            aquarium_id: aquariumId,
            device_identifier: "",
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
                    setData("device_identifier", decodedText);
                    stopScanner();
                },
                () => {},
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
        post(route("admin.devices.claim"), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 transition-opacity" />
            <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Dialog.Content className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white outline-none">
                    <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
                        <div>
                            <Dialog.Title className="text-xl font-black uppercase tracking-tighter">
                                Vincular Nodo
                            </Dialog.Title>
                            <Dialog.Description className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                AquaSense Smart Pairing
                            </Dialog.Description>
                        </div>
                        <Dialog.CloseTrigger className="p-2 hover:bg-white/10 rounded-full transition-colors outline-none">
                            <Cancel01Icon size={24} />
                        </Dialog.CloseTrigger>
                    </div>

                    <div className="flex p-1 bg-slate-50 mx-8 mt-6 rounded-2xl border border-slate-100">
                        <button
                            onClick={() => {
                                setActiveTab("qr");
                                clearErrors();
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "qr" ? "bg-white shadow-sm text-cyan-600" : "text-slate-400"}`}
                        >
                            <QrCode01Icon size={16} /> QR
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("manual");
                                stopScanner();
                                clearErrors();
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "manual" ? "bg-white shadow-sm text-cyan-600" : "text-slate-400"}`}
                        >
                            <KeyboardIcon size={16} /> Manual
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {activeTab === "qr" ? (
                            <div className="space-y-4">
                                <div className="relative aspect-square w-full bg-slate-900 rounded-[2rem] overflow-hidden">
                                    <div
                                        id={scannerId}
                                        className="w-full h-full"
                                    />
                                    {!isScanning && !data.device_identifier && (
                                        <button
                                            type="button"
                                            onClick={startScanner}
                                            className="absolute inset-0 flex flex-col items-center justify-center text-white"
                                        >
                                            <QrCode01Icon
                                                size={48}
                                                className="mb-4 text-slate-700"
                                            />
                                            <span className="px-6 py-3 bg-cyan-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                                Activar Cámara
                                            </span>
                                        </button>
                                    )}
                                    {data.device_identifier && (
                                        <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white p-6">
                                            <CheckmarkCircle02Icon
                                                size={48}
                                                className="mb-2"
                                            />
                                            <p className="text-lg font-mono font-bold tracking-tighter">
                                                {data.device_identifier}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData(
                                                        "device_identifier",
                                                        "",
                                                    );
                                                    startScanner();
                                                }}
                                                className="mt-4 text-[10px] font-bold uppercase underline"
                                            >
                                                Reintentar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Field.Root invalid={!!errors.device_identifier}>
                                <Field.Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Device ID
                                </Field.Label>
                                <Field.Input
                                    value={data.device_identifier}
                                    onChange={(e) =>
                                        setData(
                                            "device_identifier",
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="AQS-2026-XXXX"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-500/50 outline-none"
                                />
                            </Field.Root>
                        )}

                        {(processing || errors.device_identifier) && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <DashboardSpeed01Icon
                                    size={18}
                                    className={
                                        errors.device_identifier
                                            ? "text-rose-500"
                                            : "text-cyan-500"
                                    }
                                />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                    {processing
                                        ? "Buscando dispositivo..."
                                        : errors.device_identifier}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.device_identifier}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-600 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
                            >
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
   📄 MAIN PAGE (Show) - Estructura global sin cambios de layout
   ============================================================= */

export default function Show({ aquarium }) {
    const [showModal, setShowModal] = useState(false);

    const getSensorIcon = (slug) => {
        switch (slug) {
            case "temperature":
                return ThermometerIcon;
            case "ph":
                return DropletIcon;
            case "tds":
                return ArtificialIntelligence08Icon;
            case "dissolved_oxygen":
                return SunCloudFastWind02Icon;
            default:
                return DashboardSpeed01Icon;
        }
    };

    const getSensorColor = (slug) => {
        switch (slug) {
            case "temperature":
                return "text-orange-500";
            case "ph":
                return "text-cyan-500";
            case "tds":
                return "text-indigo-500";
            case "dissolved_oxygen":
                return "text-blue-500";
            default:
                return "text-slate-500";
        }
    };
    const getAverage = (readings) => {
        if (!readings?.length) return null;

        const sum = readings.reduce((acc, r) => acc + Number(r.value), 0);
        return (sum / readings.length).toFixed(2);
    };

    // Métricas actuales (último valor de cada sensor)
    const read = (slug) => {
        const sensors = aquarium.devices
            ?.flatMap((d) => d.sensors || [])
            .filter(
                (s) =>
                    s.is_active &&
                    s.sensor_type?.slug === slug &&
                    s.readings?.length,
            );

        if (!sensors.length) return null;

        const readings = sensors.flatMap((s) => s.readings);

        return {
            val: getAverage(readings.slice(-50)),
            unit: sensors[0].sensor_type.unit,
        };
    };

    const metrics = {
        temp: read("temperature"),
        ph: read("ph"),
        tds: read("tds"),
        oxygen: read("dissolved_oxygen"),
    };

    // Datos completos de telemetría (todos los sensores, todos los dispositivos)
    const allTelemetryData = useMemo(() => {
        const raw = [];
        aquarium.devices?.forEach((device) => {
            device.sensors?.forEach((sensor) => {
                sensor.readings?.forEach((reading) => {
                    raw.push({
                        device_id: device.id,
                        sensor: sensor.sensor_type?.slug,
                        value: Number(reading.value),
                        timestamp: new Date(reading.recorded_at),
                    });
                });
            });
        });
        return raw;
    }, [aquarium.devices]);

    // Lista de dispositivos para el filtro
    const devicesList = useMemo(
        () => aquarium.devices?.map((d) => ({ id: d.id, name: d.name })) || [],
        [aquarium.devices],
    );

    const uniqueSensors = useMemo(() => {
        const sensors = aquarium.devices
            ?.flatMap((d) => d.sensors || [])
            .filter((s) => s.is_active);

        return Object.values(
            sensors.reduce((acc, sensor) => {
                const slug = sensor.sensor_type?.slug;
                if (slug && !acc[slug]) acc[slug] = sensor;
                return acc;
            }, {}),
        );
    }, [aquarium.devices]);

    return (
        <DashboardLayout title={`AquaSense | ${aquarium.name}`}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header (sin cambios) */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <Link
                            href={route("admin.aquariums.index")}
                            className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-cyan-600 shadow-sm transition-all"
                        >
                            <ArrowLeft02Icon size={20} />
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">
                                {aquarium.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <StatusBadge active={aquarium.is_active} />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] border-l border-slate-200 pl-3">
                                    {aquarium.volume_liters}L •{" "}
                                    {aquarium.species}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href={route("admin.aquariums.edit", aquarium.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        <Settings02Icon size={16} /> Configuración
                    </Link>
                </header>

                {/* Cuerpo principal (grid sin cambios de estructura) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Tarjetas de métricas (sin cambios) */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {uniqueSensors.map((sensor) => {
                                const metric = read(sensor.sensor_type.slug);

                                if (!metric) return null;

                                return (
                                    <MetricCard
                                        key={sensor.sensor_type.slug}
                                        icon={getSensorIcon(
                                            sensor.sensor_type.slug,
                                        )}
                                        label={sensor.sensor_type.name}
                                        value={metric.val}
                                        unit={metric.unit}
                                        colorClass={getSensorColor(
                                            sensor.sensor_type.slug,
                                        )}
                                    />
                                );
                            })}
                        </section>

                        {/* TELEMETRY CHART MEJORADO (filtros, múltiples líneas, modal) */}
                        <TelemetryChart
                            title="Histórico de Telemetría"
                            data={allTelemetryData}
                            devices={devicesList}
                        />
                    </div>

                    {/* Sidebar de dispositivos (sin cambios) */}
                    <aside className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                <WaterPumpIcon
                                    size={18}
                                    className="text-indigo-500"
                                />{" "}
                                Nodos IoT
                            </h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700 transition-colors"
                            >
                                + Vincular
                            </button>
                        </div>

                        <div className="space-y-4">
                            {aquarium.devices?.length > 0 ? (
                                aquarium.devices.map((d) => (
                                    <DeviceCard key={d.id} device={d} />
                                ))
                            ) : (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                                    <WaterPumpIcon
                                        size={32}
                                        className="mx-auto text-slate-200 mb-3"
                                    />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        Sin hardware vinculado
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                <AddDeviceModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    aquariumId={aquarium.id}
                />
            </div>
        </DashboardLayout>
    );
}
