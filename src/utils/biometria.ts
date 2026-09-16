import * as LocalAuthentication from 'expo-local-authentication';

export interface ResultadoAutenticacion {
  exito: boolean;
  mensaje?: string;
}

export type TipoBiometria = 'huella' | 'faceid';

// Revisa qué modalidades biométricas tiene enroladas el dispositivo
export async function obtenerTiposBiometricosDisponibles(): Promise<TipoBiometria[]> {
  const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const disponibles: TipoBiometria[] = [];

  if (tipos.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    disponibles.push('huella');
  }
  if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    disponibles.push('faceid');
  }

  return disponibles;
}

// Pide autenticación biométrica (huella o Face ID, lo que el dispositivo
// tenga configurado el sistema operativo decide cuál usar, no nosotros).
export async function autenticarPersonal(
  tipoPreferido?: TipoBiometria
): Promise<ResultadoAutenticacion> {
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

  // Si se pidió un tipo específico, confirma que esté enrolado antes de lanzar el prompt
  if (tipoPreferido) {
    const disponibles = await obtenerTiposBiometricosDisponibles();
    if (!disponibles.includes(tipoPreferido)) {
      return {
        exito: false,
        mensaje:
          tipoPreferido === 'faceid'
            ? 'Este dispositivo no tiene Face ID configurado.'
            : 'Este dispositivo no tiene huella configurada.',
      };
    }
  }

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage:
      tipoPreferido === 'faceid'
        ? 'Verifica tu identidad con Face ID para entrar a la Zona de Personal'
        : tipoPreferido === 'huella'
        ? 'Verifica tu identidad con tu huella para entrar a la Zona de Personal'
        : 'Verifica tu identidad para entrar a la Zona de Personal',
    cancelLabel: 'Cancelar',
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