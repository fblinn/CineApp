import * as LocalAuthentication from 'expo-local-authentication';

export interface ResultadoAutenticacion {
  exito: boolean;
  mensaje?: string;
}

// Pide autenticación biométrica (huella o Face ID, lo que el dispositivo
// tenga configurado — el sistema operativo decide cuál usar, no nosotros).
// Se usa como "llave" para entrar a la Zona de Personal (Módulo B del doc).
export async function autenticarPersonal(): Promise<ResultadoAutenticacion> {
  const tieneHardware = await LocalAuthentication.hasHardwareAsync();
  if (!tieneHardware) {
    return {
      exito: false,
      mensaje: 'Este dispositivo no tiene sensor biométrico (huella o Face ID).',
    };
  }

  const tieneBiometriaRegistrada = await LocalAuthentication.isEnrolledAsync();
  if (!tieneBiometriaRegistrada) {
    return {
      exito: false,
      mensaje:
        'No hay huella ni Face ID configurados en este dispositivo. Ve a Ajustes del teléfono y configura uno para poder entrar a la Zona de Personal.',
    };
  }

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Verifica tu identidad para entrar a la Zona de Personal',
    cancelLabel: 'Cancelar',
    // No permite caer al PIN/patrón del teléfono como alternativa: exige
    // específicamente huella o Face ID, que es lo que pide el doc.
    disableDeviceFallback: true,
  });

  if (resultado.success) {
    return { exito: true };
  }

  return {
    exito: false,
    mensaje: 'No se pudo verificar tu identidad. Intenta de nuevo.',
  };
}
