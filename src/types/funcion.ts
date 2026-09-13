export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:MM"
}

export type FuncionFormData = Omit<Funcion, 'id'>;