export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:MM"
  formato: '2D' | '3D';
  idioma: 'Sub' | 'Dob';
}

export type FuncionFormData = Omit<Funcion, 'id'>;