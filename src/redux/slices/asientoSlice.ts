import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ---------- Tipos ----------

export interface AsientosState {
  ocupadosPorFuncion: Record<string, string[]>;
}

const initialState: AsientosState = {
  ocupadosPorFuncion: {},
};

const asientosSlice = createSlice({
  name: "asientos",
  initialState,
  reducers: {
    // Marca uno o varios asientos como ocupados para una función específica.
    marcarAsientosOcupados: (
      state,
      action: PayloadAction<{ funcionId: string; asientos: string[] }>
    ) => {
      const { funcionId, asientos } = action.payload;
      const actuales = state.ocupadosPorFuncion[funcionId] ?? [];
      // evita duplicados si el usuario confirma dos veces por error
      const combinados = Array.from(new Set([...actuales, ...asientos]));
      state.ocupadosPorFuncion[funcionId] = combinados;
    },

    // Por si necesitas liberar asientos (ej. cancelación de una reserva)
    liberarAsientos: (
      state,
      action: PayloadAction<{ funcionId: string; asientos: string[] }>
    ) => {
      const { funcionId, asientos } = action.payload;
      const actuales = state.ocupadosPorFuncion[funcionId] ?? [];
      state.ocupadosPorFuncion[funcionId] = actuales.filter(
        (id) => !asientos.includes(id)
      );
    },
  },
});

export const { marcarAsientosOcupados, liberarAsientos } = asientosSlice.actions;
export default asientosSlice.reducer;