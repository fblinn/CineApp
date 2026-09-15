import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ---------- Tipos ----------

export interface Reserva {
  id: string;
  funcionId: string;
  peliculaId: string;
  asientos: string[];
  total: number;
  cliente: {
    nombreCliente: string;
    email: string;
    telefono: string;
  };
  fecha: string; 
}

export interface ReservasState {
  lista: Reserva[];
}

const initialState: ReservasState = {
  lista: [],
};

const reservasSlice = createSlice({
  name: "reservas",
  initialState,
  reducers: {
    // Omitimos "id" y "fecha" porque los genera el propio reducer.
    agregarReserva: {
      reducer: (state, action: PayloadAction<Reserva>) => {
        state.lista.push(action.payload);
      },
      prepare: (datos: Omit<Reserva, "id" | "fecha">) => ({
        payload: {
          ...datos,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fecha: new Date().toISOString(),
        },
      }),
    },

    eliminarReserva: (state, action: PayloadAction<{ id: string }>) => {
      state.lista = state.lista.filter((r) => r.id !== action.payload.id);
    },
  },
});

export const { agregarReserva, eliminarReserva } = reservasSlice.actions;
export default reservasSlice.reducer;