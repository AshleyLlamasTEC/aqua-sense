import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import DashboardLayout from '../../layouts/DashboardLayout';
import Section from '../../components/ui/dashboard/Section';
import Panel from '../../components/ui/dashboard/Panel';
import Widget from '../../components/ui/dashboard/Widget';
import Button from '../../components/ui/Button';

// Iconos mejorados
const WaterIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const TempIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const PhIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const TdsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 10H9L8 4z" /></svg>;
const LiveDot = () => <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>;

// Componente EnvironmentalChart
const EnvironmentalChart = () => {
  const svgRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const intervalRef = useRef(null);

  // Generar datos mock en tiempo real
  const generateData = useCallback(() => {
    const now = Date.now();
    const newPoint = {
      time: now,
      ph: 7.2 + (Math.random() - 0.5) * 0.3,
      temperature: 24 + (Math.random() - 0.5) * 1.5,
      tds: 300 + (Math.random() - 0.5) * 30
    };
    setChartData(prev => {
      const newData = [...prev, newPoint];
      return newData.slice(-30);
    });
  }, []);

  // Iniciar simulación
  useEffect(() => {
    generateData();
    intervalRef.current = setInterval(generateData, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [generateData]);

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.parentElement.clientWidth;
    const height = 380;
    const margin = { top: 40, right: 70, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const xScale = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.time))
      .range([0, innerWidth]);

    const yScalePh = d3.scaleLinear()
      .domain([6.8, 7.6])
      .range([innerHeight, 0]);

    const yScaleTemp = d3.scaleLinear()
      .domain([21, 27])
      .range([innerHeight, 0]);

    const yScaleTds = d3.scaleLinear()
      .domain([250, 350])
      .range([innerHeight, 0]);

    // Definir colores
    const colors = {
      ph: "#10B981",
      temperature: "#F59E0B",
      tds: "#3B82F6"
    };

    // Agregar glow filter
    const defs = svg.select("defs");
    if (defs.empty()) {
      const filterDef = svg.append("defs");
      ["ph", "temp", "tds"].forEach(id => {
        const glow = filterDef.append("filter").attr("id", `glow-${id}`);
        glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
        const merge = glow.append("feMerge");
        merge.append("feMergeNode").attr("in", "coloredBlur");
        merge.append("feMergeNode").attr("in", "SourceGraphic");
      });
    }

    // Líneas
    const linePh = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScalePh(d.ph))
      .curve(d3.curveMonotoneX);

    const lineTemp = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScaleTemp(d.temperature))
      .curve(d3.curveMonotoneX);

    const lineTds = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScaleTds(d.tds))
      .curve(d3.curveMonotoneX);

    // Áreas
    const areaPh = d3.area()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScalePh(d.ph))
      .curve(d3.curveMonotoneX);

    const areaTemp = d3.area()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScaleTemp(d.temperature))
      .curve(d3.curveMonotoneX);

    const areaTds = d3.area()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScaleTds(d.tds))
      .curve(d3.curveMonotoneX);

    // Agregar áreas con opacidad
    g.append("path")
      .datum(chartData)
      .attr("fill", `${colors.ph}20`)
      .attr("d", areaPh);

    g.append("path")
      .datum(chartData)
      .attr("fill", `${colors.temperature}20`)
      .attr("d", areaTemp);

    g.append("path")
      .datum(chartData)
      .attr("fill", `${colors.tds}20`)
      .attr("d", areaTds);

    // Agregar líneas con glow
    const pathPh = g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", colors.ph)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .attr("filter", "url(#glow-ph)")
      .attr("d", linePh);

    const pathTemp = g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", colors.temperature)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .attr("filter", "url(#glow-temp)")
      .attr("d", lineTemp);

    const pathTds = g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", colors.tds)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .attr("filter", "url(#glow-tds)")
      .attr("d", lineTds);

    // Animación de líneas
    [pathPh, pathTemp, pathTds].forEach(path => {
      const pathLength = path.node().getTotalLength();
      path.attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    });

    // Ejes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .style("font-size", "11px")
      .style("color", "#9CA3AF");

    // Eje Y izquierdo (pH)
    const yAxisPh = d3.axisLeft(yScalePh).ticks(5).tickFormat(d => d.toFixed(1));
    g.append("g")
      .call(yAxisPh)
      .style("font-size", "11px")
      .style("color", colors.ph);

    // Eje Y derecho (Temperatura)
    const yAxisTemp = d3.axisRight(yScaleTemp).ticks(5).tickFormat(d => `${d.toFixed(0)}°C`);
    g.append("g")
      .attr("transform", `translate(${innerWidth},0)`)
      .call(yAxisTemp)
      .style("font-size", "11px")
      .style("color", colors.temperature);

    // Eje Y derecho adicional (TDS)
    const yAxisTds = d3.axisRight(yScaleTds).ticks(5).tickFormat(d => `${d.toFixed(0)} ppm`);
    g.append("g")
      .attr("transform", `translate(${innerWidth - 50},0)`)
      .call(yAxisTds)
      .style("font-size", "10px")
      .style("color", colors.tds);

    // Grid
    g.append("g")
      .call(d3.axisLeft(yScalePh).ticks(6).tickSize(-innerWidth).tickFormat(""))
      .style("stroke", "#E5E7EB")
      .style("stroke-dasharray", "4,4")
      .style("opacity", 0.3);

    // Tooltip interactivo
    const bisect = d3.bisector(d => d.time).left;
    const focusLine = g.append("line")
      .attr("stroke", "#9CA3AF")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    const tooltipDiv = d3.select("body").append("div")
      .attr("class", "chart-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "white")
      .style("padding", "10px 14px")
      .style("border-radius", "10px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("backdrop-filter", "blur(8px)");

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "transparent")
      .on("mousemove", function(event) {
        const mouseX = d3.pointer(event)[0];
        const x0 = xScale.invert(mouseX);
        const i = bisect(chartData, x0, 1);
        if (i >= 0 && i < chartData.length) {
          const d0 = chartData[i - 1];
          const d1 = chartData[i];
          const d = x0 - d0?.time > d1?.time - x0 ? d1 : d0;
          if (d) {
            focusLine
              .attr("x1", xScale(d.time))
              .attr("x2", xScale(d.time))
              .attr("y1", 0)
              .attr("y2", innerHeight)
              .style("opacity", 0.5);

            tooltipDiv
              .style("opacity", 1)
              .style("left", `${event.pageX + 15}px`)
              .style("top", `${event.pageY - 40}px`)
              .html(`
                <strong>${new Date(d.time).toLocaleTimeString()}</strong><br/>
                <span style="color: #10B981">pH:</span> ${d.ph.toFixed(2)}<br/>
                <span style="color: #F59E0B">Temp:</span> ${d.temperature.toFixed(1)}°C<br/>
                <span style="color: #3B82F6">TDS:</span> ${d.tds.toFixed(0)} ppm
              `);
          }
        }
      })
      .on("mouseout", function() {
        focusLine.style("opacity", 0);
        tooltipDiv.style("opacity", 0);
      });

    return () => {
      tooltipDiv.remove();
    };
  }, [chartData]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-4 z-10 flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
        <LiveDot />
        <span className="text-xs font-semibold text-green-600">Live Data</span>
      </div>
      <svg ref={svgRef} className="w-full" style={{ height: "380px" }}></svg>
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">pH (6.8-7.6)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">Temperatura (21-27°C)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">TDS (250-350 ppm)</span>
        </div>
      </div>
    </div>
  );
};

// Componente principal de la página
const Home = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="Dashboard Acuaponía">
      {/* Sección de Bienvenida */}
      <Section
        title="Bienvenido de vuelta, Usuario"
        description={`Última actualización: ${lastUpdate.toLocaleTimeString()}`}
        actions={
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <LiveDot />
              <span className="text-sm text-green-600 font-medium">Sistema Activo</span>
            </div>
            <Button variant="primary">Actualizar Datos</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Widget
            title="Acuarios Activos"
            icon={<WaterIcon />}
            value="3"
            trend="+1"
            trendUp={true}
            accentColor="cyan"
          />
          <Widget
            title="Temperatura Promedio"
            icon={<TempIcon />}
            value="24.5 °C"
            trend="-0.3 °C"
            trendUp={false}
            accentColor="orange"
          />
          <Widget
            title="pH Promedio"
            icon={<PhIcon />}
            value="7.2"
            trend="+0.1"
            trendUp={true}
            accentColor="green"
          />
        </div>
      </Section>

      {/* Environmental Trends Chart - Main Visual Focus */}
      <Section title="Tendencias Ambientales" description="Monitoreo en tiempo real de parámetros clave">
        <Panel title="Evolución de Parámetros" className="shadow-xl">
          <EnvironmentalChart />
        </Panel>
      </Section>

      {/* Sección de Monitoreo en Vivo */}
      <Section title="Monitoreo en Vivo">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Acuario Principal" className="hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-gray-700 font-medium">Temperatura:</span>
                <span className="font-bold text-orange-600 text-lg">25.1 °C</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-gray-700 font-medium">pH:</span>
                <span className="font-bold text-green-600 text-lg">7.4</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-gray-700 font-medium">Oxígeno Disuelto:</span>
                <span className="font-bold text-blue-600 text-lg">6.2 mg/L</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-gray-700 font-medium">TDS:</span>
                <span className="font-bold text-blue-600 text-lg">312 ppm</span>
              </div>
            </div>
          </Panel>

          <Panel title="Acuario Secundario" className="hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium">Temperatura:</span>
                <span className="font-bold text-orange-600 text-lg">23.8 °C</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium">pH:</span>
                <span className="font-bold text-green-600 text-lg">7.0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium">Oxígeno Disuelto:</span>
                <span className="font-bold text-blue-600 text-lg">5.9 mg/L</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium">TDS:</span>
                <span className="font-bold text-blue-600 text-lg">298 ppm</span>
              </div>
            </div>
          </Panel>
        </div>
      </Section>

      {/* Sección de Estadísticas Rápidas */}
      <Section title="Estadísticas del Sistema">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <p className="text-2xl font-bold text-cyan-600">98.5%</p>
            <p className="text-xs text-gray-500 mt-1">Tiempo Activo</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <p className="text-2xl font-bold text-emerald-600">1,234</p>
            <p className="text-xs text-gray-500 mt-1">Lecturas Totales</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <p className="text-2xl font-bold text-orange-600">7</p>
            <p className="text-xs text-gray-500 mt-1">Alertas (Último mes)</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <p className="text-2xl font-bold text-blue-600">24/7</p>
            <p className="text-xs text-gray-500 mt-1">Monitoreo Continuo</p>
          </div>
        </div>
      </Section>
    </DashboardLayout>
  );
};

export default Home;
