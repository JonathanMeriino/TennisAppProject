"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { tournaments } from "@/lib/api";

export default function ModalResultados({ isOpen, onClose, selectedMatch }) {
  // Estados encapsulados solo para este modal
  const [set1J1, setSet1J1] = useState(0);
  const [set1J2, setSet1J2] = useState(0);
  const [set2J1, setSet2J1] = useState(0);
  const [set2J2, setSet2J2] = useState(0);
  const [set3J1, setSet3J1] = useState(0);
  const [set3J2, setSet3J2] = useState(0);
  const [ganadorInscripcionId, setGanadorInscripcionId] = useState("");
  const [loadingGuardar, setLoadingGuardar] = useState(false);

  // Limpiar el formulario si cambia el partido seleccionado
  useEffect(() => {
    if (isOpen) {
      setSet1J1(0); setSet1J2(0);
      setSet2J1(0); setSet2J2(0);
      setSet3J1(0); setSet3J2(0);
      setGanadorInscripcionId("");
    }
  }, [isOpen, selectedMatch]);

  if (!isOpen || !selectedMatch) return null;

  const handleGuardarResultado = async (e) => {
    e.preventDefault();
    if (!ganadorInscripcionId) {
      toast.error("Por favor selecciona un ganador.");
      return;
    }

    const s1j1 = parseInt(set1J1) || 0;
    const s1j2 = parseInt(set1J2) || 0;
    const s2j1 = parseInt(set2J1) || 0;
    const s2j2 = parseInt(set2J2) || 0;
    const s3j1 = parseInt(set3J1) || 0;
    const s3j2 = parseInt(set3J2) || 0;

    let setsGanadosJ1 = 0;
    let setsGanadosJ2 = 0;

    if (s1j1 > s1j2) setsGanadosJ1++; else if (s1j2 > s1j1) setsGanadosJ2++;
    if (s2j1 > s2j2) setsGanadosJ1++; else if (s2j2 > s2j1) setsGanadosJ2++;
    if (s3j1 > s3j2) setsGanadosJ1++; else if (s3j2 > s3j1) setsGanadosJ2++;

    const idJ1 = typeof selectedMatch.jugador1 === 'object' ? (selectedMatch.jugador1.id_inscripcion || selectedMatch.jugador1.id) : selectedMatch.jugador1;
    const idJ2 = typeof selectedMatch.jugador2 === 'object' ? (selectedMatch.jugador2.id_inscripcion || selectedMatch.jugador2.id) : selectedMatch.jugador2;

    let ganadorCalculadoId = null;
    if (setsGanadosJ1 > setsGanadosJ2) {
      ganadorCalculadoId = idJ1.toString();
    } else if (setsGanadosJ2 > setsGanadosJ1) {
      ganadorCalculadoId = idJ2.toString();
    } else {
      toast.error("El marcador indica un empate en sets. Revisa los juegos.");
      return;
    }

    if (ganadorInscripcionId.toString() !== ganadorCalculadoId) {
      toast.error("Error: El ganador seleccionado no coincide con el jugador que ganó más sets según el marcador.");
      return;
    }

    setLoadingGuardar(true);
    try {
      await tournaments.reportResult(
        selectedMatch.id_partido || selectedMatch.id, 
        {
          set1_j1: s1j1, set1_j2: s1j2,
          set2_j1: s2j1, set2_j2: s2j2,
          set3_j1: s3j1, set3_j2: s3j2,
        }, 
        ganadorInscripcionId
      );

      toast.success("¡Resultado registrado con éxito!");
      onClose();
      window.location.reload(); 

    } catch (err) {
      toast.error(err.error || err.detail || "Error al registrar el resultado.");
    } finally {
      setLoadingGuardar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground">Registrar Marcador</h3>
          <p className="text-sm text-muted-foreground">
            Ingresa los juegos por set y selecciona al ganador del partido.
          </p>
        </div>

        <form onSubmit={handleGuardarResultado} className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-foreground items-center mb-2">
            <span className="col-span-1">Jugador</span>
            <span className="text-center">Set 1</span>
            <span className="text-center">Set 2</span>
            <span className="text-center">Set 3</span>
          </div>

          {/* Fila Jugador 1 */}
          <div className="grid grid-cols-4 gap-2 items-center">
            <span className="col-span-1 text-sm font-medium text-foreground truncate">
              {selectedMatch.username_j1 || "Jugador 1"}
            </span>
            <input type="number" min="0" max="7" value={set1J1} onChange={(e) => setSet1J1(e.target.value)} className="input-field text-center py-1" />
            <input type="number" min="0" max="7" value={set2J1} onChange={(e) => setSet2J1(e.target.value)} className="input-field text-center py-1" />
            <input type="number" min="0" max="25" value={set3J1} onChange={(e) => setSet3J1(e.target.value)} className="input-field text-center py-1" />
          </div>

          {/* Fila Jugador 2 */}
          <div className="grid grid-cols-4 gap-2 items-center">
            <span className="col-span-1 text-sm font-medium text-foreground truncate">
              {selectedMatch.username_j2 || "Jugador 2"}
            </span>
            <input type="number" min="0" max="7" value={set1J2} onChange={(e) => setSet1J2(e.target.value)} className="input-field text-center py-1" />
            <input type="number" min="0" max="7" value={set2J2} onChange={(e) => setSet2J2(e.target.value)} className="input-field text-center py-1" />
            <input type="number" min="0" max="25" value={set3J2} onChange={(e) => setSet3J2(e.target.value)} className="input-field text-center py-1" />
          </div>

          {/* Selector de Ganador */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-foreground mb-1">Ganador del Partido</label>
            <select
              value={ganadorInscripcionId}
              onChange={(e) => setGanadorInscripcionId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="" disabled>-- Selecciona un ganador --</option>
              {selectedMatch.jugador1 && (
                <option value={typeof selectedMatch.jugador1 === 'object' ? (selectedMatch.jugador1.id_inscripcion || selectedMatch.jugador1.id) : selectedMatch.jugador1}>
                  {selectedMatch.username_j1}
                </option>
              )}
              {selectedMatch.jugador2 && (
                <option value={typeof selectedMatch.jugador2 === 'object' ? (selectedMatch.jugador2.id_inscripcion || selectedMatch.jugador2.id) : selectedMatch.jugador2}>
                  {selectedMatch.username_j2}
                </option>
              )}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loadingGuardar} className="btn-primary text-sm py-2 px-4">
              {loadingGuardar ? "Guardando..." : "Guardar Resultado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}