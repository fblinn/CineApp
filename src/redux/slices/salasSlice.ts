import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sala } from '@/types/sala';
import { Funcion, FuncionFormData } from '@/types/funcion';
import type { RootState } from '@/redux/store';

interface SalasState {
  salas: Sala[];
  funciones: Funcion[];
}

const initialState: SalasState = {
  // Coincide con las salas usadas en peliculasMock.ts ("Sala 1".."Sala 5")
  salas: [
    { id: 'sala-1', nombre: 'Sala 1', capacidad: 80 },
    { id: 'sala-2', nombre: 'Sala 2', capacidad: 80 },
    { id: 'sala-3', nombre: 'Sala 3', capacidad: 60 },
    { id: 'sala-4', nombre: 'Sala 4', capacidad: 60 },
    { id: 'sala-5', nombre: 'Sala 5', capacidad: 50 },
  ],
  funciones: [],
};

const salasSlice = createSlice({
  name: 'salas',
  initialState,
  reducers: {
    agregarFuncion: {
      reducer: (state, action: PayloadAction<Funcion>) => {
        state.funciones.push(action.payload);
      },
      prepare: (data: FuncionFormData) => ({
        payload: { ...data, id: Date.now().toString() },
      }),
    },
    eliminarFuncion: (state, action: PayloadAction<string>) => {
      state.funciones = state.funciones.filter((f) => f.id !== action.payload);
    },
  },
});

export const { agregarFuncion, eliminarFuncion } = salasSlice.actions;
export default salasSlice.reducer;

// ---------- Selectores ----------

export const selectSalas = (state: RootState) => state.salas.salas;
export const selectFunciones = (state: RootState) => state.salas.funciones;

export const selectFuncionesPorPelicula =
  (peliculaId: string) =>
  (state: RootState): Funcion[] =>
    state.salas.funciones.filter((f) => f.peliculaId === peliculaId);

// Revisa si ya existe una función registrada en la misma sala, fecha y hora
// (validación obligatoria: "Registrar funciones con horario repetido en la misma sala")
export const selectHorarioOcupadoEnSala =
  (salaId: string, fecha: string, hora: string) =>
  (state: RootState): boolean =>
    state.salas.funciones.some(
      (f) => f.salaId === salaId && f.fecha === fecha && f.hora === hora
    );
