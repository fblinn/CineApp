export type EstadoReserva = 'completa' | 'pendiente' | 'cancelada';

export interface Reserva {
  id: string;
  peliculaId: string;
  sala: string;
  fecha: string; // fecha de la funcion
  hora: string;
  asientos: string[];
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  monto: number;
  estado: EstadoReserva;
  validado: boolean;
}

export type ReservaFormData = Omit<Reserva, 'id' | 'estado' | 'validado'>;