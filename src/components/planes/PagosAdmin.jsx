import { useEffect, useState } from "react";

function PagosAdmin() {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/pagos?clave=1234`)
      .then((res) => res.json())
      .then((data) => {
        setPagos(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando pagos:", err);
        setLoading(false);
      });
  }, []);

  const pagosFiltrados = pagos.filter((pago) => {
    const valor = filtro.toLowerCase();
    return (
      pago.email.toLowerCase().includes(valor) ||
      pago.descripcion.toLowerCase().includes(valor) ||
      pago.dni.toString().includes(valor)
    );
  });

  const eliminarPago = async (id) => {
  const confirmacion = window.confirm("¿Estás seguro de eliminar este pago?");
  if (!confirmacion) return;

  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/pagos/${id}?clave=1234`, {
      method: "DELETE",
    });
    // Remover el pago del estado actual
    setPagos((prev) => prev.filter((p) => p.id !== id));
  } catch (err) {
    console.error("Error al eliminar pago:", err);
    alert("Ocurrió un error al eliminar el pago");
  }
};


  return (
    <section style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem", color: "white" }}>🧾 Pagos Recibidos</h2>

      <input
        type="text"
        placeholder="Buscar por email, plan o DNI..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {loading ? (
        <p>Cargando pagos...</p>
      ) : pagosFiltrados.length === 0 ? (
        <p style={{color: "white"}}>No se encontraron pagos con ese criterio.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead style={{ backgroundColor: "#f1f1f1" }}>
              <tr>
                <th style={th}>Fecha</th>
                <th style={th}>Descripción</th>
                <th style={th}>Email</th>
                <th style={th}>DNI</th>
                <th style={th}>Monto</th>
                <th style={th}>Cuotas</th>
                <th style={th}>Medio</th>
                <th style={th}>Estado</th>
                <th style={th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} style={{ borderBottom: "1px solid #ddd", color: "white" }}>
                  <td style={td}>{new Date(pago.fecha).toLocaleString("es-AR")}</td>
                  <td style={td}>{pago.descripcion}</td>
                  <td style={td}>{pago.email}</td>
                  <td style={td}>{pago.dni}</td>
                  <td style={td}>${pago.monto.toFixed(2)}</td>
                  <td style={td}>{pago.cuotas}</td>
                  <td style={td}>{pago.metodoPago}</td>
                  <td style={{ ...td, color: pago.estado === "approved" ? "green" : "red" }}>
                    {pago.estado}
                  </td>
                  <td style={td}>
                    <button
                        onClick={() => eliminarPago(pago.id)}
                        style={{
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        }}
                    >
                        Eliminar
                    </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const th = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold",
  backgroundColor: "#f5f5f5",
  borderBottom: "2px solid #ccc",
};

const td = {
  padding: "10px",
  textAlign: "left",
};

export default PagosAdmin;
