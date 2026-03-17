// ejemplo.tsx
// Gráfico REAL del proyecto: evolución del e1RM de un ejercicio a lo largo del tiempo
// Usalo como referencia de estructura, estilo y cómo se consumen los datos

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getHistorialEjercicio, calcularMejorE1RM } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface PuntoGrafico {
  fecha: string
  e1rm: number
  pesoMax: number
}

interface Props {
  ejercicioId: string
  nombreEjercicio: string
}

export const GraficoEvolucionE1RM = ({ ejercicioId, nombreEjercicio }: Props) => {
  const { perfil } = useAuth()
  const [datos, setDatos] = useState<PuntoGrafico[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      if (!perfil?.id) return
      try {
        setCargando(true)
        const historial = await getHistorialEjercicio(perfil.id, ejercicioId)
        
        // Transformar historial en puntos del gráfico
        const puntos: PuntoGrafico[] = historial.map(entrada => ({
          fecha: new Date(entrada.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
          e1rm: calcularMejorE1RM(entrada.series),
          pesoMax: Math.max(...entrada.series.filter(s => s.completada).map(s => s.pesoReal ?? 0))
        }))
        
        setDatos(puntos)
      } catch (err) {
        setError('No se pudo cargar el historial')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [perfil?.id, ejercicioId])

  if (cargando) return <div className="stats-loading">Cargando estadísticas...</div>
  if (error) return <div className="stats-error">{error}</div>
  if (datos.length === 0) return <div className="stats-empty">Sin datos aún para {nombreEjercicio}</div>

  return (
    <div className="grafico-container">
      <h4 className="grafico-titulo">e1RM — {nombreEjercicio}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="kg" />
          <Tooltip formatter={(value) => [`${value} kg`, 'e1RM estimado']} />
          <Line
            type="monotone"
            dataKey="e1rm"
            stroke="#00d4aa"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
