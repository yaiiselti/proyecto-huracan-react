import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { BookingService, type Booking } from '../../services/bookingService';

import '../../styles/views/Reports.css';

const DollarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const TrendUpIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const TrendDownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const StarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const CreditCardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const WalletIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>;

const BarChartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>;
const MoneyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="2" x2="12" y2="6"/></svg>;
const CogIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const GlobeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const BankIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="21" width="18" height="2"/><rect x="4" y="9" width="4" height="10"/><rect x="10" y="9" width="4" height="10"/><rect x="16" y="9" width="4" height="10"/><polygon points="12 2 2 7 22 7 12 2"/></svg>;
const CashNoteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>;

const Reports = () => {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [period, setPeriod] = useState<'mes' | 'año' | 'historico'>('mes');

  useEffect(() => {
    setAllBookings(BookingService.getBookings());
  }, []);

  // ==========================================
  // LÓGICA DE NEGOCIO Y FILTROS (ALTA EFICIENCIA)
  // ==========================================
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return allBookings.filter(b => {
      if (period === 'historico') return true;
      
      const [dayStr, monthStr, yearStr] = b.fecha.split(/[-/]/);
      if (!dayStr || !monthStr || !yearStr) return false;

      const bMonth = parseInt(monthStr, 10);
      const bYear = parseInt(yearStr, 10);

      if (period === 'mes') return bMonth === currentMonth && bYear === currentYear;
      if (period === 'año') return bYear === currentYear;
      return true;
    });
  }, [allBookings, period]);

  const metrics = useMemo(() => {
    const activas = filteredData.filter(b => b.status !== 'cancelada');
    const canceladas = filteredData.filter(b => b.status === 'cancelada');
    const completadas = filteredData.filter(b => b.status === 'completada');
    const pendientes = filteredData.filter(b => b.status === 'pendiente');
    
    const totalGeneral = filteredData.length;
    const efectividad = totalGeneral === 0 ? 0 : Math.round((activas.length / totalGeneral) * 100);

    // Calcular horas más populares
    const hoursCount: Record<string, number> = {};
    activas.forEach(b => {
      hoursCount[b.hora] = (hoursCount[b.hora] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(hoursCount), 1); // Evitar división por 0

    const popularHours = Object.keys(hoursCount)
      .map(hora => ({ 
        hora, 
        count: hoursCount[hora],
        percentage: Math.round((hoursCount[hora] / maxCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
      
    // Calcular días de la semana más populares
    const daysCount: Record<string, number> = {};
    activas.forEach(b => {
      const parts = b.fecha.split(/[-/]/);
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const dayName = dateObj.toLocaleDateString('es-CL', { weekday: 'long' });
        const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        daysCount[formattedDay] = (daysCount[formattedDay] || 0) + 1;
      }
    });
    
    const popularDays = Object.keys(daysCount).map(day => ({ day, count: daysCount[day] })).sort((a, b) => b.count - a.count);
    const topDay = popularDays.length > 0 && popularDays[0].count > 0 ? popularDays[0].day : 'Sin Datos';

    // Calcular ingresos agrupados para el gráfico
    const revenueMap: Record<string, number> = {};
    activas.forEach(b => {
      const parts = b.fecha.split(/[-/]/);
      if (parts.length === 3) {
        // Si es mes, agrupamos por día. Si es año/histórico agrupamos por mes.
        const key = period === 'mes' ? `${parts[0]}/${parts[1]}` : `${parts[1]}/${parts[2]}`;
        revenueMap[key] = (revenueMap[key] || 0) + 25000;
      }
    });

    const chartData = Object.keys(revenueMap).map(label => ({
      label,
      value: revenueMap[label]
    })).sort((a, b) => {
      // Ordenamiento simple para mantener cronología básica
      const [a1, a2] = a.label.split(/[-/]/).map(Number);
      const [b1, b2] = b.label.split(/[-/]/).map(Number);
      return a2 === b2 ? a1 - b1 : a2 - b2;
    }).slice(-12); // Máximo 12 barras para no saturar

    const maxRevenue = Math.max(...chartData.map(d => d.value), 1);

    // Cálculos Específicos de Métodos de Pago
    let recaudadoPagado = 0;
    let porCobrarPendiente = 0;
    let mWebpay = 0, mTransfer = 0, mCash = 0;

    activas.forEach(b => {
      if (b.estadoPago === 'pagado') recaudadoPagado += 25000;
      else porCobrarPendiente += 25000; // Pendiente o sin especificar

      if (b.metodoPago === 'webpay') mWebpay++;
      else if (b.metodoPago === 'transferencia') mTransfer++;
      else if (b.metodoPago === 'efectivo') mCash++;
    });

    return {
      totalIngresos: activas.length * 25000,
      recaudadoPagado,
      porCobrarPendiente,
      totalReservas: activas.length,
      canceladas: canceladas.length,
      completadas: completadas.length,
      pendientes: pendientes.length,
      tasaEfectividad: efectividad,
      popularHours,
      chartData,
      maxRevenue,
      pagos: { webpay: mWebpay, transfer: mTransfer, cash: mCash },
      topDay
    };
  }, [filteredData, period]);

  return (
    <div className="admin-layout-root">
      <Sidebar />
      
      <main className="admin-main-panel fade-in">
        <header className="reports-header-elite">
          <div>
            <h1>Informes <span className="text-yellow">Gerenciales</span></h1>
            <p>Análisis financiero y de rendimiento del club.</p>
          </div>
          
          <div className="reports-filters-container">
            {/* Filtros de Tiempo */}
            <div className="period-filters">
              <button onClick={() => setPeriod('mes')} className={`btn-filter-period ${period === 'mes' ? 'active' : ''}`}>Mes</button>
              <button onClick={() => setPeriod('año')} className={`btn-filter-period ${period === 'año' ? 'active' : ''}`}>Año</button>
              <button onClick={() => setPeriod('historico')} className={`btn-filter-period ${period === 'historico' ? 'active' : ''}`}>Global</button>
            </div>
          </div>
        </header>

        <h2 className="report-section-title"><BarChartIcon /> Resumen Ejecutivo</h2>
        
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue"><DollarIcon /></div>
            <div className="stat-info">
              <h3>Total Proyectado</h3>
              <p className="stat-number">${metrics.totalIngresos.toLocaleString('es-CL')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green"><WalletIcon /></div>
            <div className="stat-info">
              <h3>Recaudación Real</h3>
              <p className="stat-number text-green">${metrics.recaudadoPagado.toLocaleString('es-CL')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red"><CreditCardIcon /></div>
            <div className="stat-info">
              <h3>Por Cobrar</h3>
              <p className="stat-number text-red">${metrics.porCobrarPendiente.toLocaleString('es-CL')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-blue"><TrendUpIcon /></div>
            <div className="stat-info">
              <h3>Tasa Conversión</h3>
              <p className="stat-number">{metrics.tasaEfectividad}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red"><TrendDownIcon /></div>
            <div className="stat-info">
              <h3>Canceladas</h3>
              <p className="stat-number">{metrics.canceladas}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-yellow-light"><StarIcon /></div>
            <div className="stat-info">
              <h3>Día Fuerte</h3>
              <p className="stat-number">{metrics.topDay}</p>
            </div>
          </div>
        </section>

        <h2 className="report-section-title"><MoneyIcon /> Análisis Financiero</h2>
          
        <div className="reports-grid-2">
          
          {/* 1. GRÁFICO DE BARRAS DE INGRESOS */}
          <section className="report-card-elite report-scroll-x">
            <h3 className="report-card-title">Evolución de Ingresos</h3>
            <div className="chart-container">
              {metrics.chartData.length > 0 ? metrics.chartData.map((data, idx) => (
                <div key={idx} className="chart-bar-wrapper">
                  {/* Tooltip nativo usando title */}
                  <div title={`$${data.value.toLocaleString()}`} className="chart-bar" style={{ height: `${(data.value / metrics.maxRevenue) * 100}%` }}></div>
                  <span className="chart-label">{data.label}</span>
                </div>
              )) : (
                <div className="chart-empty">
                  No hay ingresos registrados en este periodo.
                </div>
              )}
            </div>
          </section>

          {/* 2. MÉTODOS DE PAGO */}
          <section className="report-card-elite">
             <h3 className="report-card-title">Distribución por Método de Pago</h3>
             <div className="pay-bars-container">
                <div className="pay-bar-row">
                   <div className="pay-label">
                     <span className="pay-label-name"><GlobeIcon /> Webpay (Tarjetas)</span> 
                     <strong>{metrics.pagos.webpay} res.</strong>
                   </div>
                   <div className="pay-track"><div className="pay-fill fill-webpay" style={{ width: `${metrics.totalReservas ? (metrics.pagos.webpay / metrics.totalReservas) * 100 : 0}%`}}></div></div>
                </div>
                <div className="pay-bar-row">
                   <div className="pay-label">
                     <span className="pay-label-name"><BankIcon /> Transferencia Bancaria</span> 
                     <strong>{metrics.pagos.transfer} res.</strong>
                   </div>
                   <div className="pay-track"><div className="pay-fill fill-transfer" style={{ width: `${metrics.totalReservas ? (metrics.pagos.transfer / metrics.totalReservas) * 100 : 0}%`}}></div></div>
                </div>
                <div className="pay-bar-row">
                   <div className="pay-label">
                     <span className="pay-label-name"><CashNoteIcon /> Efectivo (Caja)</span> 
                     <strong>{metrics.pagos.cash} res.</strong>
                   </div>
                   <div className="pay-track"><div className="pay-fill fill-cash" style={{ width: `${metrics.totalReservas ? (metrics.pagos.cash / metrics.totalReservas) * 100 : 0}%`}}></div></div>
                </div>
                <p className="pay-disclaimer">
                  * Las reservas con método no especificado no llenan barra.
                </p>
             </div>
          </section>
        </div>

        <h2 className="report-section-title"><CogIcon /> Análisis Operativo</h2>

        <div className="reports-grid-2">
          {/* 3. ESTADO DE LAS RESERVAS */}
          <section className="report-card-elite">
            <h3 className="report-card-title">Tasa de Concreción (Status)</h3>
            {metrics.totalReservas + metrics.canceladas > 0 ? (
              <>
                <div className="progress-container">
                  <div title="Completadas" className="progress-segment completadas" style={{ width: `${(metrics.completadas / (metrics.totalReservas + metrics.canceladas)) * 100}%` }}></div>
                  <div title="Pendientes" className="progress-segment pendientes" style={{ width: `${(metrics.pendientes / (metrics.totalReservas + metrics.canceladas)) * 100}%` }}></div>
                  <div title="Canceladas" className="progress-segment canceladas" style={{ width: `${(metrics.canceladas / (metrics.totalReservas + metrics.canceladas)) * 100}%` }}></div>
                </div>
                <div className="status-legend-container">
                  <div className="status-legend-item"><span className="text-green">● Completadas</span> <span>{metrics.completadas}</span></div>
                  <div className="status-legend-item"><span className="text-blue">● Pendientes</span> <span>{metrics.pendientes}</span></div>
                  <div className="status-legend-item"><span className="text-red">● Canceladas</span> <span>{metrics.canceladas}</span></div>
                </div>
              </>
            ) : (
              <p className="empty-message">Sin datos para mostrar.</p>
            )}
          </section>

          {/* 4. HORAS PUNTA */}
          <section className="report-card-elite">
            <h3 className="report-card-title">Horas Punta (Alta Demanda)</h3>
            
            <div className="popular-hours-container">
              {metrics.popularHours.length > 0 ? metrics.popularHours.map((item, index) => (
                <div key={index}>
                  <div className="popular-hour-label">
                    <span>{item.hora}</span>
                    <span>{item.count} reservas</span>
                  </div>
                  <div className="popular-hour-track">
                    <div className="popular-hour-fill" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              )) : (
                <p className="empty-message">No hay datos suficientes en este periodo.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Reports;