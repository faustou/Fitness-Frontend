import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { getHistorialSemanal, crearEntrenamientosMuestra, getMesesDisponibles, getMesActual, getNombreMes } from '../../services/api';
import './styles/historial-semanal.css';

function HistorialSemanal({ alumnoId }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [creandoMuestra, setCreandoMuestra] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('volumen');

  // Estado para selector de mes
  const [mesSeleccionado, setMesSeleccionado] = useState(getMesActual());
  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  useEffect(() => {
    cargarMesesDisponibles();
  }, [alumnoId]);

  useEffect(() => {
    cargarDatos();
  }, [alumnoId, mesSeleccionado]);

  const cargarMesesDisponibles = async () => {
    try {
      const meses = await getMesesDisponibles(alumnoId);
      setMesesDisponibles(meses);
    } catch (err) {
      console.error('Error cargando meses:', err);
    }
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resultado = await getHistorialSemanal(alumnoId, mesSeleccionado);
      setDatos(resultado);

      const ejercicios = Object.keys(resultado.ejercicios || {});
      if (ejercicios.length > 0) {
        setEjercicioSeleccionado(ejercicios[0]);
      }
    } catch (err) {
      console.error('Error cargando historial semanal:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearMuestra = async () => {
    try {
      setCreandoMuestra(true);
      await crearEntrenamientosMuestra(alumnoId);
      await cargarDatos();
    } catch (err) {
      console.error('Error creando muestra:', err);
      alert('Error al crear datos de muestra');
    } finally {
      setCreandoMuestra(false);
    }
  };

  // Preparar datos para gráficos
  const semanas = (datos?.semanas || []).map(s => `Semana ${s.semana}`);
  const volumenes = (datos?.semanas || []).map(s => Math.round(s.volumenTotal));
  const entrenamientos = (datos?.semanas || []).map(s => s.entrenamientos);
  const duraciones = (datos?.semanas || []).map(s => Math.round(s.duracionTotal / 60));

  // Datos para gráfico de ejercicio específico
  const datosEjercicio = ejercicioSeleccionado
    ? (datos?.ejercicios?.[ejercicioSeleccionado] || []).reduce((acc, item) => {
        const existing = acc.find(x => x.semana === item.semana);
        if (existing) {
          if (item.pesoMax > existing.pesoMax) existing.pesoMax = item.pesoMax;
          if ((item.e1rm || 0) > (existing.e1rm || 0)) existing.e1rm = item.e1rm;
          existing.volumen += item.volumen;
        } else {
          acc.push({
            semana: item.semana,
            pesoMax: item.pesoMax,
            volumen: item.volumen,
            e1rm: item.e1rm || 0,
          });
        }
        return acc;
      }, []).sort((a, b) => a.semana - b.semana)
    : [];

  const ejercicioSemanas = datosEjercicio.map(d => `Semana ${d.semana}`);
  const ejercicioVolumenes = datosEjercicio.map(d => Math.round(d.volumen));
  const ejercicioE1RMs = datosEjercicio.map(d => Math.round((d.e1rm || 0) * 10) / 10);

  // Calcular comparativas
  const calcularCambio = (actual, anterior) => {
    if (!anterior || anterior === 0) return null;
    return ((actual - anterior) / anterior * 100).toFixed(1);
  };

  const semanaActual = datos?.semanas?.[datos.semanas.length - 1];
  const semanaAnterior = datos?.semanas?.[datos.semanas.length - 2];
  const cambioVolumen = semanaActual && semanaAnterior
    ? calcularCambio(semanaActual.volumenTotal, semanaAnterior.volumenTotal)
    : null;

  // Configuración base de ApexCharts
  const baseOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    theme: {
      mode: 'dark',
    },
    grid: {
      borderColor: 'rgba(7, 204, 239, 0.1)',
      strokeDashArray: 4,
    },
    xaxis: {
      labels: {
        style: {
          colors: '#5a7a8a',
          fontSize: '11px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#5a7a8a',
          fontSize: '11px',
        },
      },
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
      x: {
        show: true,
      },
    },
    legend: {
      labels: {
        colors: '#7a9aaa',
      },
      fontSize: '12px',
      markers: {
        width: 10,
        height: 10,
        radius: 3,
      },
    },
  };

  // Gráfico de Volumen (Barras con gradiente)
  const volumenOptions = {
    ...baseOptions,
    chart: {
      ...baseOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        distributed: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#0099cc'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100],
      },
    },
    colors: ['#07ccef'],
    xaxis: {
      ...baseOptions.xaxis,
      categories: semanas,
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString(),
      style: {
        fontSize: '10px',
        fontWeight: 600,
        colors: ['#07181f'],
      },
      offsetY: -2,
    },
  };

  const volumenSeries = [{
    name: 'Volumen (kg)',
    data: volumenes,
  }];

  // Gráfico de Entrenamientos (Area + Line)
  const entrenamientosOptions = {
    ...baseOptions,
    chart: {
      ...baseOptions.chart,
      type: 'line',
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],
    },
    fill: {
      type: ['gradient', 'gradient'],
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.2,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: ['#07ccef', '#22c55e'],
    xaxis: {
      ...baseOptions.xaxis,
      categories: semanas,
    },
    yaxis: [
      {
        title: {
          text: 'Entrenamientos',
          style: { color: '#07ccef', fontSize: '11px' },
        },
        labels: {
          style: { colors: '#07ccef', fontSize: '11px' },
        },
      },
      {
        opposite: true,
        title: {
          text: 'Duración (min)',
          style: { color: '#22c55e', fontSize: '11px' },
        },
        labels: {
          style: { colors: '#22c55e', fontSize: '11px' },
        },
      },
    ],
    markers: {
      size: 6,
      strokeWidth: 2,
      hover: { size: 8 },
    },
    dataLabels: {
      enabled: false,
    },
  };

  const entrenamientosSeries = [
    { name: 'Entrenamientos', data: entrenamientos },
    { name: 'Duración (min)', data: duraciones },
  ];

  // Gráfico de Ejercicio específico (Area con gradiente)
  const ejercicioOptions = {
    ...baseOptions,
    chart: {
      ...baseOptions.chart,
      type: 'area',
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: ['#07ccef', '#f59e0b'],
    xaxis: {
      ...baseOptions.xaxis,
      categories: ejercicioSemanas,
    },
    yaxis: [
      {
        title: {
          text: 'e1RM (kg)',
          style: { color: '#07ccef', fontSize: '11px' },
        },
        labels: {
          style: { colors: '#07ccef', fontSize: '11px' },
          formatter: (val) => `${val} kg`,
        },
      },
      {
        opposite: true,
        title: {
          text: 'Volumen (kg)',
          style: { color: '#f59e0b', fontSize: '11px' },
        },
        labels: {
          style: { colors: '#f59e0b', fontSize: '11px' },
        },
      },
    ],
    markers: {
      size: 6,
      strokeWidth: 2,
      hover: { size: 8 },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      ...baseOptions.tooltip,
      y: {
        formatter: (val, { seriesIndex }) =>
          seriesIndex === 0 ? `${val} kg (e1RM)` : `${val} kg`,
      },
    },
  };

  const ejercicioSeries = [
    { name: 'e1RM estimado (kg)', data: ejercicioE1RMs },
    { name: 'Volumen (kg)', data: ejercicioVolumenes },
  ];

  if (cargando) {
    return (
      <div className="historial-semanal-loading">
        <div className="loading-spinner"></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (!datos || datos.semanas.length === 0) {
    return (
      <div className="historial-semanal-vacio">
        <div className="vacio-icon">📊</div>
        <h3>Sin datos de entrenamiento</h3>
        <p>Este alumno aún no tiene entrenamientos registrados.</p>
        <motion.button
          className="btn-crear-muestra"
          onClick={handleCrearMuestra}
          disabled={creandoMuestra}
          whileTap={{ scale: 0.98 }}
        >
          {creandoMuestra ? 'Creando...' : 'Crear datos de muestra (4 semanas)'}
        </motion.button>
      </div>
    );
  }

  const ejerciciosDisponibles = Object.keys(datos.ejercicios || {});

  return (
    <div className="historial-semanal">
      {/* Selector de mes */}
      {mesesDisponibles.length > 0 && (
        <div className="hs-mes-selector">
          <span className="hs-mes-label">Progreso de:</span>
          <div className="hs-mes-tabs">
            {mesesDisponibles.map(mes => (
              <button
                key={mes}
                className={`hs-mes-tab ${mes === mesSeleccionado ? 'activo' : ''} ${mes === getMesActual() ? 'actual' : ''}`}
                onClick={() => setMesSeleccionado(mes)}
              >
                {getNombreMes(mes)}
                {mes === getMesActual() && <span className="hs-mes-badge">Actual</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header con tabs */}
      <div className="hs-header">
        <div className="hs-tabs">
          <button
            className={`hs-tab ${vistaActiva === 'volumen' ? 'activa' : ''}`}
            onClick={() => setVistaActiva('volumen')}
          >
            Volumen
          </button>
          <button
            className={`hs-tab ${vistaActiva === 'entrenamientos' ? 'activa' : ''}`}
            onClick={() => setVistaActiva('entrenamientos')}
          >
            Entrenamientos
          </button>
          <button
            className={`hs-tab ${vistaActiva === 'ejercicio' ? 'activa' : ''}`}
            onClick={() => setVistaActiva('ejercicio')}
          >
            Por Ejercicio
          </button>
        </div>
      </div>

      {/* Resumen de comparativa */}
      <div className="hs-comparativa">
        <motion.div
          className="comparativa-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="comp-label">Volumen Total</span>
          <span className="comp-valor">{Math.round(semanaActual?.volumenTotal || 0).toLocaleString()} kg</span>
          {cambioVolumen && (
            <span className={`comp-cambio ${parseFloat(cambioVolumen) >= 0 ? 'positivo' : 'negativo'}`}>
              {parseFloat(cambioVolumen) >= 0 ? '↑' : '↓'} {Math.abs(cambioVolumen)}%
            </span>
          )}
        </motion.div>
        <motion.div
          className="comparativa-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="comp-label">Entrenamientos</span>
          <span className="comp-valor">{semanaActual?.entrenamientos || 0}</span>
          <span className="comp-sub">esta semana</span>
        </motion.div>
        <motion.div
          className="comparativa-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="comp-label">Duración Prom.</span>
          <span className="comp-valor">
            {semanaActual?.entrenamientos
              ? Math.round(semanaActual.duracionTotal / semanaActual.entrenamientos / 60)
              : 0} min
          </span>
        </motion.div>
      </div>

      {/* Gráfico principal */}
      <motion.div
        className="hs-grafico-container"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {vistaActiva === 'volumen' && (
          <>
            <h4 className="hs-grafico-titulo">Volumen Total por Semana</h4>
            <Chart
              options={volumenOptions}
              series={volumenSeries}
              type="bar"
              height={280}
            />
          </>
        )}

        {vistaActiva === 'entrenamientos' && (
          <>
            <h4 className="hs-grafico-titulo">Entrenamientos y Duración</h4>
            <Chart
              options={entrenamientosOptions}
              series={entrenamientosSeries}
              type="line"
              height={280}
            />
          </>
        )}

        {vistaActiva === 'ejercicio' && (
          <>
            <div className="hs-ejercicio-selector">
              <label>Ejercicio:</label>
              <select
                value={ejercicioSeleccionado || ''}
                onChange={(e) => setEjercicioSeleccionado(e.target.value)}
              >
                {ejerciciosDisponibles.map(ej => (
                  <option key={ej} value={ej}>{ej}</option>
                ))}
              </select>
            </div>
            <h4 className="hs-grafico-titulo">Progreso: {ejercicioSeleccionado}</h4>
            {datosEjercicio.length > 0 ? (
              <Chart
                options={ejercicioOptions}
                series={ejercicioSeries}
                type="area"
                height={280}
              />
            ) : (
              <div className="hs-sin-datos-ejercicio">
                <p>No hay datos para este ejercicio</p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Tabla de semanas */}
      <motion.div
        className="hs-tabla-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="hs-tabla-titulo">Resumen por Semana</h4>
        <div className="hs-tabla">
          <div className="hs-tabla-header">
            <span>Semana</span>
            <span>Entrenam.</span>
            <span>Volumen</span>
            <span>Duración</span>
          </div>
          {datos.semanas.map((semana, idx) => {
            const semanaAnteriorData = datos.semanas[idx - 1];
            const cambio = semanaAnteriorData
              ? calcularCambio(semana.volumenTotal, semanaAnteriorData.volumenTotal)
              : null;

            return (
              <motion.div
                key={semana.semana}
                className="hs-tabla-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <span className="semana-num">S{semana.semana}</span>
                <span>{semana.entrenamientos}</span>
                <span className="volumen-cell">
                  {Math.round(semana.volumenTotal).toLocaleString()} kg
                  {cambio && (
                    <span className={`cambio-badge ${parseFloat(cambio) >= 0 ? 'up' : 'down'}`}>
                      {parseFloat(cambio) >= 0 ? '+' : ''}{cambio}%
                    </span>
                  )}
                </span>
                <span>{Math.round(semana.duracionTotal / 60)} min</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default HistorialSemanal;
