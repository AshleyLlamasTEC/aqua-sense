import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import * as d3 from "d3";
import MainLayout from "@/Layouts/MainLayout";
import {
    PlayIcon,
    PauseIcon,
    ArrowTurnBackwardIcon,
    FishFoodIcon,
    DropboxIcon,
    ChartLineData01Icon,
    Alert01Icon,
    CheckmarkCircle01Icon,
    CancelCircleIcon,
} from "hugeicons-react";

const AquariumSimulationPro = () => {
    const speciesDB = {
        goldfish: {
            label: "Goldfish",
            wasteRate: 0.03,
            icon: FishFoodIcon,
            color: "#F59E0B",
            bgColor: "bg-orange-100",
            textColor: "text-orange-600",
        },
        guppy: {
            label: "Guppy",
            wasteRate: 0.015,
            icon: FishFoodIcon,
            color: "#10B981",
            bgColor: "bg-emerald-100",
            textColor: "text-emerald-600",
        },
        shrimp: {
            label: "Shrimp",
            wasteRate: 0.005,
            icon: DropboxIcon,
            color: "#EF4444",
            bgColor: "bg-red-100",
            textColor: "text-red-600",
        },
        betta: {
            label: "Betta",
            wasteRate: 0.02,
            icon: FishFoodIcon,
            color: "#8B5CF6",
            bgColor: "bg-purple-100",
            textColor: "text-purple-600",
        },
    };

    const [liters, setLiters] = useState(40);
    const [fish, setFish] = useState([
        { species: "guppy", count: 10 },
        { species: "shrimp", count: 15 },
    ]);
    const [nh3, setNh3] = useState(0.2);
    const [history, setHistory] = useState([]);
    const [isRunning, setIsRunning] = useState(true);
    const [selectedSpecies, setSelectedSpecies] = useState("guppy");
    const [newSpeciesCount, setNewSpeciesCount] = useState(5);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const svgRef = useRef(null);
    const intervalRef = useRef(null);
    const linePathRef = useRef(null);

    const totalWasteRate = useMemo(() => {
        return fish.reduce(
            (total, f) => total + f.count * speciesDB[f.species].wasteRate,
            0,
        );
    }, [fish]);

    const wasteBreakdown = useMemo(() => {
        return fish.map((f) => ({
            ...f,
            label: speciesDB[f.species].label,
            icon: speciesDB[f.species].icon,
            wasteRate: speciesDB[f.species].wasteRate,
            totalWaste: f.count * speciesDB[f.species].wasteRate,
            percentage:
                totalWasteRate > 0
                    ? ((f.count * speciesDB[f.species].wasteRate) /
                          totalWasteRate) *
                      100
                    : 0,
            color: speciesDB[f.species].color,
        }));
    }, [fish, totalWasteRate]);

    const dominantSpecies = useMemo(() => {
        if (wasteBreakdown.length === 0) return null;
        return wasteBreakdown.reduce(
            (max, item) => (item.percentage > max.percentage ? item : max),
            wasteBreakdown[0],
        );
    }, [wasteBreakdown]);

    const updateSimulation = useCallback(() => {
        setNh3((prevNh3) => {
            const waste = totalWasteRate;
            const bacteria = prevNh3 * 0.08;
            const dilution = liters * 0.0005;
            let newNh3 = prevNh3 + waste - bacteria - dilution;
            const noise = (Math.random() - 0.5) * prevNh3 * 0.05;
            newNh3 += noise;
            newNh3 = Math.max(0, Math.min(3.0, newNh3));
            return newNh3;
        });
    }, [totalWasteRate, liters]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(updateSimulation, 500);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, updateSimulation]);

    useEffect(() => {
        setHistory((prev) => {
            const newHistory = [...prev, { time: Date.now(), value: nh3 }];
            return newHistory.slice(-50);
        });
    }, [nh3]);

    const addSpecies = () => {
        const existingIndex = fish.findIndex(
            (f) => f.species === selectedSpecies,
        );
        if (existingIndex >= 0) {
            const updatedFish = [...fish];
            updatedFish[existingIndex].count += newSpeciesCount;
            setFish(updatedFish);
        } else {
            setFish([
                ...fish,
                { species: selectedSpecies, count: newSpeciesCount },
            ]);
        }
    };

    const removeSpecies = (index) => {
        setFish(fish.filter((_, i) => i !== index));
    };

    const updateSpeciesCount = (index, newCount) => {
        if (newCount === 0) {
            removeSpecies(index);
        } else {
            const updatedFish = [...fish];
            updatedFish[index].count = Math.max(0, newCount);
            setFish(updatedFish);
        }
    };

    const resetSimulation = () => {
        setLiters(40);
        setFish([
            { species: "guppy", count: 10 },
            { species: "shrimp", count: 15 },
        ]);
        setNh3(0.2);
        setHistory([]);
        setIsRunning(true);
    };

    const getNh3Status = () => {
        if (nh3 < 0.5)
            return {
                color: "green",
                label: "Safe",
                bg: "bg-green-500",
                text: "text-green-600",
                light: "bg-green-50",
                glow: "rgba(16, 185, 129, 0.4)",
                strongGlow: "rgba(16, 185, 129, 0.6)",
            };
        if (nh3 < 1)
            return {
                color: "yellow",
                label: "Warning",
                bg: "bg-yellow-500",
                text: "text-yellow-600",
                light: "bg-yellow-50",
                glow: "rgba(245, 158, 11, 0.4)",
                strongGlow: "rgba(245, 158, 11, 0.6)",
            };
        return {
            color: "red",
            label: "Dangerous",
            bg: "bg-red-500",
            text: "text-red-600",
            light: "bg-red-50",
            glow: "rgba(239, 68, 68, 0.4)",
            strongGlow: "rgba(239, 68, 68, 0.6)",
        };
    };

    const nh3Status = getNh3Status();

    const stability = useMemo(() => {
        if (history.length < 10)
            return {
                label: "Calculating...",
                icon: "⏳",
                color: "text-gray-600",
            };
        const trend =
            history[history.length - 1].value -
            history[history.length - 10].value;
        const volatility = Math.abs(trend) / (nh3 + 0.01);
        if (nh3 < 0.5 && volatility < 0.1)
            return {
                label: "Excellent",
                color: "text-green-600",
                message: "Ecosystem perfectly balanced",
            };
        if (nh3 < 0.8 && volatility < 0.2)
            return {
                label: "Good",
                color: "text-blue-600",
                message: "Stable conditions",
            };
        if (nh3 < 1.2)
            return {
                label: "Stable",
                color: "text-yellow-600",
                message: "Monitor closely",
            };
        return {
            label: "Critical",
            color: "text-red-600",
            message: "Immediate action required",
        };
    }, [history, nh3]);

    useEffect(() => {
        if (!svgRef.current || history.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.parentElement.clientWidth;
        const height = 400;
        const margin = { top: 25, right: 30, bottom: 45, left: 55 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        let g = svg.select("g");
        if (g.empty()) {
            svg.attr("width", width).attr("height", height);
            g = svg
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        } else {
            g.selectAll("*").remove();
        }

        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(history, (d) => d.time))
            .range([0, innerWidth]);

        const yMax = Math.max(1.5, d3.max(history, (d) => d.value) * 1.15);
        const yScale = d3
            .scaleLinear()
            .domain([0, yMax])
            .range([innerHeight, 0]);

        const lineColor =
            nh3 < 0.5 ? "#10B981" : nh3 < 1 ? "#F59E0B" : "#EF4444";

        const line = d3
            .line()
            .x((d) => xScale(d.time))
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);

        const area = d3
            .area()
            .x((d) => xScale(d.time))
            .y0(innerHeight)
            .y1((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);

        const defs = svg.select("defs");
        if (defs.empty()) {
            const filterDef = svg.append("defs");
            const glow = filterDef.append("filter").attr("id", "glow");
            glow.append("feGaussianBlur")
                .attr("stdDeviation", "4")
                .attr("result", "coloredBlur");
            const merge = glow.append("feMerge");
            merge.append("feMergeNode").attr("in", "coloredBlur");
            merge.append("feMergeNode").attr("in", "SourceGraphic");
        }

        g.append("path")
            .datum(history)
            .attr("fill", `${lineColor}20`)
            .attr("d", area);

        const path = g
            .append("path")
            .datum(history)
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 3.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("filter", "url(#glow)")
            .attr("d", line);

        const pathLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", pathLength)
            .attr("stroke-dashoffset", pathLength)
            .transition()
            .duration(500)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0);

        const xAxis = d3.axisBottom(xScale).tickFormat((d) =>
            new Date(d).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        );

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .style("font-size", "11px")
            .style("color", "#9CA3AF")
            .style("font-family", "system-ui");

        const yAxis = d3
            .axisLeft(yScale)
            .ticks(5)
            .tickFormat((d) => d.toFixed(2));

        g.append("g")
            .call(yAxis)
            .style("font-size", "11px")
            .style("color", "#9CA3AF")
            .style("font-family", "system-ui");

        g.append("g")
            .attr("class", "grid")
            .call(
                d3
                    .axisLeft(yScale)
                    .ticks(5)
                    .tickSize(-innerWidth)
                    .tickFormat(""),
            )
            .style("stroke", "#E5E7EB")
            .style("stroke-dasharray", "4,4")
            .style("opacity", 0.5);

        const thresholds = [0.5, 1.0];
        thresholds.forEach((threshold) => {
            if (threshold <= yMax) {
                g.append("line")
                    .attr("x1", 0)
                    .attr("x2", innerWidth)
                    .attr("y1", yScale(threshold))
                    .attr("y2", yScale(threshold))
                    .attr("stroke", threshold === 0.5 ? "#10B981" : "#F59E0B")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "6,3")
                    .attr("opacity", 0.5);

                g.append("text")
                    .attr("x", innerWidth - 5)
                    .attr("y", yScale(threshold) - 5)
                    .attr("text-anchor", "end")
                    .style("fill", threshold === 0.5 ? "#10B981" : "#F59E0B")
                    .style("font-size", "10px")
                    .style("font-weight", "500")
                    .text(`${threshold} ppm`);
            }
        });

        const bisect = d3.bisector((d) => d.time).left;
        const focusLine = g
            .append("line")
            .attr("stroke", lineColor)
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4,4")
            .style("opacity", 0);

        const focusCircle = g
            .append("circle")
            .attr("r", 7)
            .attr("fill", lineColor)
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .style("opacity", 0);

        const tooltipDiv = d3
            .select("body")
            .append("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.85)")
            .style("color", "white")
            .style("padding", "10px 14px")
            .style("border-radius", "10px")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("transition", "opacity 0.2s")
            .style("z-index", 1000)
            .style("backdrop-filter", "blur(8px)");

        g.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .style("fill", "transparent")
            .on("mousemove", function (event) {
                const mouseX = d3.pointer(event)[0];
                const x0 = xScale.invert(mouseX);
                const i = bisect(history, x0, 1);
                if (i >= 0 && i < history.length) {
                    const d0 = history[i - 1];
                    const d1 = history[i];
                    const d = x0 - d0?.time > d1?.time - x0 ? d1 : d0;
                    if (d) {
                        focusLine
                            .attr("x1", xScale(d.time))
                            .attr("x2", xScale(d.time))
                            .attr("y1", 0)
                            .attr("y2", innerHeight)
                            .style("opacity", 0.6);

                        focusCircle
                            .attr("cx", xScale(d.time))
                            .attr("cy", yScale(d.value))
                            .style("opacity", 1);

                        tooltipDiv
                            .style("opacity", 1)
                            .style("left", `${event.pageX + 15}px`)
                            .style("top", `${event.pageY - 40}px`)
                            .html(
                                `<strong>NH₃:</strong> ${d.value.toFixed(3)} ppm<br><strong>Time:</strong> ${new Date(d.time).toLocaleTimeString()}`,
                            );
                    }
                }
            })
            .on("mouseout", function () {
                focusLine.style("opacity", 0);
                focusCircle.style("opacity", 0);
                tooltipDiv.style("opacity", 0);
            });

        return () => {
            tooltipDiv.remove();
        };
    }, [history, nh3]);

    useEffect(() => {
        const canvas = document.getElementById("waterCanvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let width = window.innerWidth;
        let height = window.innerHeight;
        let time = 0;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const drawWater = () => {
            ctx.clearRect(0, 0, width, height);

            const distortion = Math.min(0.12, 0.04 + nh3 * 0.06);
            const opacity = Math.min(0.12, 0.04 + nh3 * 0.04);

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(0, height / 1.5);

                for (let x = 0; x < width; x += 30) {
                    const y =
                        height / 1.5 +
                        Math.sin(x * 0.008 + time + i * 2) *
                            (18 + distortion * 120) +
                        Math.cos(x * 0.015 + time * 0.5) *
                            (10 + distortion * 60);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.fillStyle = `rgba(6, 182, 212, ${opacity - i * 0.02})`;
                ctx.fill();
            }

            time += 0.02;
            requestAnimationFrame(drawWater);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        drawWater();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [nh3]);

    return (
        <MainLayout>
            <div className="bg-gradient-to-b from-cyan-950 to-gray-950 h-20"></div>
            <div className="relative pt-8 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-up">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 bg-clip-text text-transparent mb-4">
                        Aquarium Simulation Pro
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Simulación avanzada de dinámica de amoníaco (NH₃) con
                        múltiples especies
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Side Panel - Tertiary Level */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Glassmorphism Control Panel */}
                        <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-md p-6 border border-white/40 transition-all duration-300 hover:shadow-lg">
                            <h3 className="text-md font-semibold text-gray-700 mb-5 flex items-center space-x-2">
                                <span>Control de Simulación</span>
                            </h3>

                            <div className="space-y-5">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setIsRunning(!isRunning)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-md"
                                        style={{
                                            background: isRunning
                                                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                                : "linear-gradient(135deg, #10B981, #059669)",
                                            color: "white",
                                        }}
                                    >
                                        {isRunning ? (
                                            <PauseIcon className="w-4 h-4" />
                                        ) : (
                                            <PlayIcon className="w-4 h-4" />
                                        )}
                                        <span>
                                            {isRunning ? "Pausar" : "Reanudar"}
                                        </span>
                                    </button>

                                    <button
                                        onClick={resetSimulation}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-md"
                                    >
                                        <ArrowTurnBackwardIcon className="w-4 h-4" />
                                        <span>Reiniciar</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <label className="font-semibold text-gray-700 flex items-center space-x-2">
                                            <DropboxIcon className="w-4 h-4 text-cyan-600" />
                                            <span>Volumen de Agua</span>
                                        </label>
                                        <span className="text-cyan-600 font-bold">
                                            {liters} L
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="200"
                                        value={liters}
                                        onChange={(e) =>
                                            setLiters(Number(e.target.value))
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                                        style={{ accentColor: "#0891B2" }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>10L</span>
                                        <span>100L</span>
                                        <span>200L</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Species Manager */}
                        <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-md p-6 border border-white/40 transition-all duration-300 hover:shadow-lg">
                            <h3 className="text-md font-semibold text-gray-700 mb-5 flex items-center space-x-2">
                                <span>Gestión de Especies</span>
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <select
                                        value={selectedSpecies}
                                        onChange={(e) =>
                                            setSelectedSpecies(e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-sm"
                                    >
                                        {Object.entries(speciesDB).map(
                                            ([key, data]) => {
                                                const Icon = data.icon;
                                                return (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {data.label} (
                                                        {data.wasteRate}{" "}
                                                        ppm/pez)
                                                    </option>
                                                );
                                            },
                                        )}
                                    </select>

                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={newSpeciesCount}
                                        onChange={(e) =>
                                            setNewSpeciesCount(
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                        1,
                                                ),
                                            )
                                        }
                                        className="w-20 px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-center"
                                    />

                                    <button
                                        onClick={addSpecies}
                                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                                    >
                                        Añadir
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {wasteBreakdown.map((f, idx) => {
                                        const Icon = f.icon;
                                        const isDominant =
                                            dominantSpecies &&
                                            dominantSpecies.species ===
                                                f.species &&
                                            dominantSpecies.count === f.count;
                                        return (
                                            <div
                                                key={idx}
                                                className={`bg-white/70 backdrop-blur-sm rounded-xl p-3 border transition-all duration-200 hover:shadow-md ${
                                                    isDominant
                                                        ? "border-amber-300 shadow-md ring-1 ring-amber-200"
                                                        : "border-gray-100"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`p-1.5 rounded-lg ${speciesDB[f.species].bgColor}`}
                                                        >
                                                            <Icon
                                                                className={`w-4 h-4 ${speciesDB[f.species].textColor}`}
                                                            />
                                                        </div>
                                                        <span className="font-semibold text-gray-800">
                                                            {f.label}
                                                            {isDominant && (
                                                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                                    Dominante
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            removeSpecies(idx)
                                                        }
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <CancelCircleIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="50"
                                                        value={f.count}
                                                        onChange={(e) =>
                                                            updateSpeciesCount(
                                                                idx,
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all"
                                                        style={{
                                                            accentColor:
                                                                speciesDB[
                                                                    f.species
                                                                ].color,
                                                        }}
                                                    />
                                                    <span className="font-mono text-sm font-semibold text-gray-700 min-w-[40px]">
                                                        {f.count}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">
                                                        Producción:{" "}
                                                        {f.totalWaste.toFixed(
                                                            3,
                                                        )}{" "}
                                                        ppm/s
                                                    </span>
                                                    <span
                                                        className="text-xs font-semibold"
                                                        style={{
                                                            color: speciesDB[
                                                                f.species
                                                            ].color,
                                                        }}
                                                    >
                                                        {f.percentage.toFixed(
                                                            1,
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="h-1.5 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${f.percentage}%`,
                                                            backgroundColor:
                                                                speciesDB[
                                                                    f.species
                                                                ].color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {fish.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 bg-white/30 rounded-xl">
                                        <FishFoodIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            No hay especies agregadas
                                        </p>
                                        <p className="text-xs">
                                            Añade algunas especies arriba
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Waste Summary */}
                        <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-md p-6 border border-white/40 transition-all duration-300 hover:shadow-lg">
                            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                                <span className="text-cyan-600">📊</span>
                                <span>Resumen de Producción</span>
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600 text-sm">
                                        Producción total:
                                    </span>
                                    <span className="font-bold text-cyan-600 text-base">
                                        {totalWasteRate.toFixed(4)} ppm/s
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600 text-sm">
                                        Procesamiento bacteriano:
                                    </span>
                                    <span className="font-bold text-emerald-600 text-sm">
                                        {(nh3 * 0.08).toFixed(4)} ppm/s
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 text-sm">
                                        Efecto de dilución:
                                    </span>
                                    <span className="font-bold text-blue-600 text-sm">
                                        {(liters * 0.0005).toFixed(4)} ppm/s
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Primary & Secondary Levels */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero NH3 Panel - Primary Level */}
                        <div
                            className="relative rounded-2xl shadow-2xl p-10 transition-all duration-500 overflow-hidden"
                            style={{
                                background: `radial-gradient(ellipse at 50% 50%, ${nh3Status.strongGlow} 0%, rgba(255,255,255,0.98) 80%)`,
                                backdropFilter: "blur(10px)",
                                boxShadow: `0 25px 50px -12px ${nh3Status.glow}`,
                            }}
                        >
                            <div className="relative z-10 text-center space-y-8">
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                        Nivel Actual de Amoníaco
                                    </p>
                                    <div className="flex items-baseline justify-center space-x-4">
                                        <span
                                            className={`text-9xl font-black ${nh3Status.text} transition-all duration-300 animate-glow`}
                                            style={{
                                                textShadow: `0 0 40px ${nh3Status.glow}`,
                                                letterSpacing: "-0.02em",
                                            }}
                                        >
                                            {nh3.toFixed(3)}
                                        </span>
                                        <span className="text-3xl text-gray-500 font-light">
                                            ppm
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <div
                                        className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-full ${nh3Status.light} shadow-sm`}
                                    >
                                        <div
                                            className={`w-3 h-3 ${nh3Status.bg} rounded-full animate-pulse`}
                                        ></div>
                                        <span
                                            className={`text-sm font-bold ${nh3Status.text} uppercase tracking-wide`}
                                        >
                                            {nh3Status.label}
                                        </span>
                                    </div>

                                    <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm">
                                        <div>
                                            <p
                                                className={`text-sm font-bold ${stability.color}`}
                                            >
                                                {stability.label}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {stability.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {nh3 > 1 && (
                                    <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 animate-pulse">
                                        <p className="text-sm text-red-700 flex items-center justify-center space-x-2">
                                            <Alert01Icon className="w-4 h-4" />
                                            <span>
                                                ¡Alerta! Realiza un cambio de
                                                agua parcial inmediatamente
                                            </span>
                                        </p>
                                    </div>
                                )}
                                {nh3 < 0.3 && nh3 > 0 && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                                        <p className="text-sm text-green-700 flex items-center justify-center space-x-2">
                                            <CheckmarkCircle01Icon className="w-4 h-4" />
                                            <span>
                                                ✓ Excelentes condiciones del
                                                agua
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chart Panel - Secondary Level */}
                        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl p-6 border border-white/60 transition-all duration-300">
                            <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center space-x-2">
                                <ChartLineData01Icon className="w-5 h-5 text-cyan-600" />
                                <span>Tendencia Histórica de NH₃</span>
                            </h3>
                            <div className="bg-white rounded-xl p-4 shadow-inner">
                                <svg
                                    ref={svgRef}
                                    className="w-full"
                                    style={{ height: "400px" }}
                                ></svg>
                            </div>
                            <div className="mt-5 flex justify-center gap-8 text-xs text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                                    <span>Seguro (&lt;0.5 ppm)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                                    <span>Advertencia (0.5-1 ppm)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                                    <span>Peligroso (&gt;1 ppm)</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Footer */}
                        <div className="backdrop-blur-xl bg-gradient-to-r from-cyan-50/60 to-blue-50/60 rounded-2xl p-4 border border-cyan-100">
                            <div className="text-xs text-gray-600 text-center space-y-1">
                                <p className="font-semibold text-cyan-800">
                                    Modelo de Simulación
                                </p>
                                <p className="text-gray-500">
                                    NH₃ = NH₃ + (Σ especies × tasa_desecho) -
                                    (NH₃ × 0.08) - (litros × 0.0005) +
                                    ruido_aleatorio
                                </p>
                                <p className="text-gray-400 text-[11px]">
                                    Actualización cada 500ms • Historial:
                                    últimos 50 puntos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes glow {
                    0%,
                    100% {
                        filter: brightness(1);
                        transform: scale(1);
                    }
                    50% {
                        filter: brightness(1.08);
                        transform: scale(1.02);
                    }
                }

                .animate-fade-up {
                    animation: fade-up 0.6s ease-out;
                }

                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #0891b2;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #0e7490;
                }
            `}</style>
        </MainLayout>
    );
};

export default AquariumSimulationPro;
