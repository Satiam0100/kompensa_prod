// Compartido: Flujo B/C y scripts de prueba (sin imports en n8n).
// Mantener alineado con src/lib/meta-campana.ts

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(dateStr) {
  if (!dateStr || !DATE_ONLY.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

function addDaysUtc(dateStr, days) {
  if (!isValidDateOnly(dateStr)) return dateStr;
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  const next = d.toISOString().split("T")[0];
  return isValidDateOnly(next) ? next : dateStr;
}

function isoWeekdayFromDateStr(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const js = d.getUTCDay();
  return js === 0 ? 7 : js;
}

function diasInclusivos(inicio, fin) {
  const start = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fin}T00:00:00Z`);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

function parseTramosCuotas(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const tramos = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const desde = String(item.desde ?? "");
    const hasta = String(item.hasta ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
      continue;
    }
    const dias = Array.isArray(item.dias_semana)
      ? item.dias_semana
          .map((d) => Number(d))
          .filter((d) => d >= 1 && d <= 7)
      : [];
    const cuñas = Number(item.cuñas_por_dia ?? item.cunias_por_dia);
    if (!Number.isFinite(cuñas) || cuñas < 0) continue;
    tramos.push({
      desde,
      hasta,
      dias_semana: dias,
      cuñas_por_dia: cuñas,
    });
  }
  return tramos.length > 0 ? tramos : null;
}

function cuniasContratadasDelDia(orden, dateStr) {
  if (dateStr < orden.periodo_inicio || dateStr > orden.periodo_fin) {
    return 0;
  }

  const tramos = parseTramosCuotas(orden.tramos_cuotas);
  if (tramos) {
    let sum = 0;
    for (const tramo of tramos) {
      if (dateStr >= tramo.desde && dateStr <= tramo.hasta) {
        const dow = isoWeekdayFromDateStr(dateStr);
        if (tramo.dias_semana.includes(dow)) {
          sum += tramo.cuñas_por_dia;
        }
      }
    }
    return sum;
  }

  return Number(orden.cuñas_diarias) || 0;
}

function metaAcumuladaHasta(orden, finDate) {
  if (
    !isValidDateOnly(orden.periodo_inicio) ||
    !isValidDateOnly(orden.periodo_fin) ||
    !finDate ||
    !isValidDateOnly(finDate) ||
    finDate < orden.periodo_inicio
  ) {
    return 0;
  }
  const finEfectivo =
    finDate > orden.periodo_fin ? orden.periodo_fin : finDate;

  let acum = 0;
  let d = orden.periodo_inicio;
  let guard = 0;
  while (d <= finEfectivo && guard < 4000) {
    acum += cuniasContratadasDelDia(orden, d);
    const next = addDaysUtc(d, 1);
    if (next <= d) break;
    d = next;
    guard += 1;
  }

  const cap = Number(orden.total_contratadas) || 0;
  if (cap <= 0) return acum;
  return Math.min(acum, cap);
}

function contratadasEnRango(orden, inicio, fin) {
  if (
    !isValidDateOnly(inicio) ||
    !isValidDateOnly(fin) ||
    fin < inicio
  ) {
    return 0;
  }
  let sum = 0;
  let d = inicio;
  let guard = 0;
  while (d <= fin && guard < 4000) {
    if (d >= orden.periodo_inicio && d <= orden.periodo_fin) {
      sum += cuniasContratadasDelDia(orden, d);
    }
    const next = addDaysUtc(d, 1);
    if (next <= d) break;
    d = next;
    guard += 1;
  }
  return sum;
}

function calcularEstadoSemanal(
  transmitidasSemana,
  contratadasSemana,
  cuotaSemanaAgotada,
) {
  if (contratadasSemana <= 0) {
    if (cuotaSemanaAgotada) {
      return {
        estado: transmitidasSemana > 0 ? "en_compensacion" : "cumple",
        estado_label:
          transmitidasSemana > 0
            ? "En compensación (cuota cumplida)"
            : "Cuota cumplida",
        porcentaje_cumplimiento: "—",
        cuota_semana_agotada: true,
      };
    }
    if (transmitidasSemana === 0) {
      return {
        estado: "cumple",
        estado_label: "Sin meta esta semana",
        porcentaje_cumplimiento: "—",
        cuota_semana_agotada: false,
      };
    }
    return {
      estado: "en_compensacion",
      estado_label: "En compensación",
      porcentaje_cumplimiento: "—",
      cuota_semana_agotada: false,
    };
  }

  let estado = "atrasado";
  if (transmitidasSemana >= contratadasSemana) {
    estado =
      transmitidasSemana > contratadasSemana
        ? "en_compensacion"
        : "cumple";
  }

  const estadoLabel =
    estado === "cumple"
      ? "Cumple"
      : estado === "atrasado"
        ? "Atrasado"
        : "En compensación";

  const porcentaje = (
    (transmitidasSemana / contratadasSemana) *
    100
  ).toFixed(1);

  return {
    estado,
    estado_label: estadoLabel,
    porcentaje_cumplimiento: porcentaje,
    cuota_semana_agotada: false,
  };
}

function totalContratadasCalculado(orden) {
  if (
    !isValidDateOnly(orden.periodo_inicio) ||
    !isValidDateOnly(orden.periodo_fin) ||
    orden.periodo_fin < orden.periodo_inicio
  ) {
    return 0;
  }
  return contratadasEnRango(
    orden,
    orden.periodo_inicio,
    orden.periodo_fin,
  );
}

module.exports = {
  addDaysUtc,
  isoWeekdayFromDateStr,
  diasInclusivos,
  parseTramosCuotas,
  cuniasContratadasDelDia,
  metaAcumuladaHasta,
  contratadasEnRango,
  totalContratadasCalculado,
  calcularEstadoSemanal,
};
