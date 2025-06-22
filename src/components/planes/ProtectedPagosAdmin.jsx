import { useSearchParams } from "react-router-dom";

function ProtectedPagosAdmin() {
  const [params] = useSearchParams();
  const clave = params.get("clave");

  if (clave !== "1234") {
    return <p>Acceso denegado</p>;
  }

  return <PagosAdmin />;
}
