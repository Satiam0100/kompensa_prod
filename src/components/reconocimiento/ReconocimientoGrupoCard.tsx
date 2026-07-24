"use client";

import { useState } from "react";
import { formatDeteccionDateTime } from "@/lib/reconocimiento/format";
import type { ReconocimientoGrupo } from "@/lib/reconocimiento/types";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { listCardClass } from "@/components/ui/card-classes";

interface ReconocimientoGrupoCardProps {
  grupo: ReconocimientoGrupo;
}

export function ReconocimientoGrupoCard({
  grupo,
}: ReconocimientoGrupoCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className={listCardClass()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left space-y-2"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-body-md font-medium text-on-surface truncate">
              {grupo.spot_name || "Sin nombre de spot"}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              <MaterialIcon
                name="radio"
                className="text-sm mr-1 text-outline-variant align-middle"
              />
              {grupo.channel_name}
              {grupo.city ? (
                <span>
                  {" "}
                  · {grupo.city}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary text-label-sm font-bold tabular-nums">
              {grupo.count}
            </span>
            <MaterialIcon
              name="expand_more"
              className={`text-on-surface-variant transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-label-sm text-on-surface-variant">
          <div>
            <dt className="inline text-outline-variant">spot_id · </dt>
            <dd className="inline font-label-mono text-on-surface break-all">
              {grupo.spot_id}
            </dd>
          </div>
          <div>
            <dt className="inline text-outline-variant">channel_id · </dt>
            <dd className="inline font-label-mono text-on-surface">
              {grupo.channel_id || "—"}
            </dd>
          </div>
          {grupo.duration_seg != null && (
            <div>
              <dt className="inline text-outline-variant">Duración media · </dt>
              <dd className="inline text-on-surface">
                {grupo.duration_seg}s
              </dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="inline text-outline-variant">Periodo detecciones · </dt>
            <dd className="inline text-on-surface">
              {formatDeteccionDateTime(grupo.primera_deteccion)}
              {" – "}
              {formatDeteccionDateTime(grupo.ultima_deteccion)}
            </dd>
          </div>
        </dl>
      </button>

      {open && (
        <div className="pt-3 mt-1 border-t border-outline-variant/40">
          <p className="text-label-sm text-on-surface-variant mb-2 px-0.5">
            {grupo.detecciones.length} pases (UTC)
          </p>
          <div className="max-h-64 overflow-y-auto custom-scrollbar rounded-lg border border-outline-variant/50">
            <table className="w-full text-label-sm">
              <thead className="sticky top-0 bg-surface-container-high text-on-surface-variant">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Fecha / hora</th>
                  <th className="text-right font-medium px-3 py-2">Duración</th>
                </tr>
              </thead>
              <tbody>
                {grupo.detecciones.map((d, i) => (
                  <tr
                    key={`${d.datetime_utc}-${i}`}
                    className="border-t border-outline-variant/30 text-on-surface"
                  >
                    <td className="px-3 py-1.5 tabular-nums">
                      {formatDeteccionDateTime(d.datetime_utc)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {Number.isFinite(d.duration_seg) ? `${d.duration_seg}s` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}
