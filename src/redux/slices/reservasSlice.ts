import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reserva, ReservaFormData, EstadoReserva } from "../../types/reserva";

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
    agregarReserva: {
      reducer: (state, action: PayloadAction<Reserva>) => {
        state.lista.push(action.payload);
      },
      prepare: (datos: ReservaFormData & { id: string }): { payload: Reserva } => ({
        
        payload: {
          ...datos,
          estado: 'completa',
          validado: false,
        },
      }),
    },

    eliminarReserva: (state, action: PayloadAction<{ id: string }>) => {
      state.lista = state.lista.filter((r) => r.id !== action.payload.id);
    },

    cancelarReserva: (state, action: PayloadAction<{ id: string }>) => {
      const reserva = state.lista.find((r) => r.id === action.payload.id);
      if (reserva) reserva.estado = 'cancelada';
    },

    marcarBoletoValidado: (state, action: PayloadAction<{ id: string }>) => {
      const reserva = state.lista.find((r) => r.id === action.payload.id);
      if (reserva) reserva.validado = true;
    },
  },
});

export const {
  agregarReserva,
  eliminarReserva,
  cancelarReserva,
  marcarBoletoValidado,
} = reservasSlice.actions;
export default reservasSlice.reducer;