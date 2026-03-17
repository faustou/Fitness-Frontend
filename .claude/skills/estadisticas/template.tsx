// template.tsx
// Template base para un nuevo gráfico de estadísticas
// Reemplazá NOMBRE_GRAFICO y los tipos según corresponda

import { useState, useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useAuth } from '../../context/AuthContext'
// Importar la función de api que corresponda, por ejemplo:
// import { getHistorialEjercicio } from '../../services/api'

interface NOMBRE_DATOPunto {
  // agente define los campos del punto de datos
  fecha: string
  // ...
}

interface Props {
  // agente define las props necesarias
}

export const NOMBRE_GRAFICO = ({ /* props */ }: Props) => {
  const { perfil } = useAuth()
  const [datos, setDatos] = useState<NOMBRE_DATOPunto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      if (!perfil?.id) return
      try {
        setCargando(true)
        // agente completa el fetch y transformación de datos
        setDatos(/* datos transformados */)
      } catch (err) {
        setError('No se pudo cargar la estadística')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [perfil?.id])

  if (cargando) return <div className="stats-loading">Cargando...</div>
  if (error) return <div className="stats-error">{error}</div>
  if (datos.length === 0) return <div className="stats-empty">Sin datos suficientes</div>

  return (
    <div className="grafico-container">
      <h4 className="grafico-titulo">/* agente completa el título */</h4>
      <ResponsiveContainer width="100%" height={200}>
        {/* agente completa el chart con sus ejes, líneas/barras, tooltip */}
      </ResponsiveContainer>
    </div>
  )
}
