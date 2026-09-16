import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors, radius, spacing, typography } from '@/theme';
import { useAppDispatch } from '@/redux/hooks';
import { agregarReserva } from '@/redux/slices/reservasSlice';
import { marcarAsientosOcupados } from '@/redux/slices/asientoSlice';
import 'react-native-get-random-values';

// ---------- Tipos ----------

type Props = NativeStackScreenProps<RootStackParamList, 'FormularioVenta'>;

interface FormState {
  nombreCliente: string;
  email: string;
  telefono: string;
}

type CampoTexto = keyof FormState;

type Errores = Partial<Record<CampoTexto, string>>;

const VALOR_INICIAL: FormState = {
  nombreCliente: '',
  email: '',
  telefono: '',
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Ajusta el mínimo de dígitos según el formato que uses (ej. El Salvador: 8 dígitos)
const REGEX_TELEFONO = /^\d{8,}$/;

// ---------- Validación ----------

function validarCampo(campo: CampoTexto, valores: FormState): string | undefined {
  switch (campo) {
    case 'nombreCliente':
      return valores.nombreCliente.trim()
        ? undefined
        : 'El nombre es obligatorio.';

    case 'email': {
      const valor = valores.email.trim();
      if (!valor) return 'El correo es obligatorio.';
      if (!REGEX_EMAIL.test(valor)) return 'Ingresa un correo válido.';
      return undefined;
    }

    case 'telefono': {
      const valor = valores.telefono.trim();
      if (!valor) return 'El teléfono es obligatorio.';
      if (!REGEX_TELEFONO.test(valor)) return 'Ingresa un teléfono válido.';
      return undefined;
    }

    default:
      return undefined;
  }
}

const CAMPOS: { campo: CampoTexto; etiqueta: string; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad' }[] = [
  { campo: 'nombreCliente', etiqueta: 'Nombre completo', placeholder: 'Ej. Ana Martínez' },
  { campo: 'email', etiqueta: 'Correo electrónico', placeholder: 'ana@correo.com', keyboardType: 'email-address' },
  { campo: 'telefono', etiqueta: 'Teléfono', placeholder: '7123 4567', keyboardType: 'phone-pad' },
];

// ---------- Componente / Pantalla ----------

export default function FormularioVenta({ navigation, route }: Props) {
  const { funcionId, pelicula, asientos, total } = route.params;
  const dispatch = useAppDispatch();

  const [valores, setValores] = useState<FormState>(VALOR_INICIAL);
  const [errores, setErrores] = useState<Errores>({});

  function actualizarCampo(campo: CampoTexto, valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validarFormulario(): boolean {
    const nuevosErrores: Errores = {};
    for (const { campo } of CAMPOS) {
      const error = validarCampo(campo, valores);
      if (error) nuevosErrores[campo] = error;
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function confirmarVenta() {
    if (!validarFormulario()) return;

    const idBoleto = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    dispatch(
      agregarReserva({
        id: idBoleto,
        peliculaId: pelicula.id,
        sala: pelicula.salaAsignada,
        fecha: route.params.fecha,
        hora: route.params.hora,
        asientos,
        clienteNombre: valores.nombreCliente,
        clienteEmail: valores.email,
        clienteTelefono: valores.telefono,
        monto: total,
      })
    );

    dispatch(marcarAsientosOcupados({ funcionId, asientos }));
    navigation.replace('GeneradorQR', { reservaId: idBoleto });
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Datos del cliente</Text>

        <View style={styles.resumen}>
          <Text style={styles.resumenPelicula}>{pelicula.nombre}</Text>
          <Text style={styles.resumenLinea}>{pelicula.salaAsignada}</Text>
          <Text style={styles.resumenLinea}>
            Asientos: {asientos.join(', ')}
          </Text>
          <Text style={styles.resumenTotal}>Total: ${total.toFixed(2)}</Text>
        </View>

        {CAMPOS.map(({ campo, etiqueta, placeholder, keyboardType }) => (
          <View key={campo} style={styles.campo}>
            <Text style={styles.etiqueta}>{etiqueta}</Text>
            <TextInput
              style={[styles.input, errores[campo] && styles.inputError]}
              placeholder={placeholder}
              placeholderTextColor={colors.textDim}
              value={valores[campo]}
              onChangeText={(texto) => actualizarCampo(campo, texto)}
              keyboardType={keyboardType ?? 'default'}
              autoCapitalize={campo === 'email' ? 'none' : 'words'}
            />
            {errores[campo] && (
              <Text style={styles.errorTexto}>{errores[campo]}</Text>
            )}
          </View>
        ))}

        <View style={styles.acciones}>
          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.botonSecundarioTexto}>Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonPrimario}
            onPress={confirmarVenta}
          >
            <Text style={styles.botonPrimarioTexto}>Confirmar venta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.bgPanel,
  },
  scrollContenido: {
    padding: spacing.lg,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  resumen: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resumenPelicula: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  resumenLinea: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 2,
  },
  resumenTotal: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  campo: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  inputError: {
    borderColor: colors.red,
  },
  errorTexto: {
    color: colors.red,
    fontSize: typography.tiny,
    marginTop: 4,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  botonSecundario: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  botonSecundarioTexto: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: '600',
  },
  botonPrimario: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.red,
  },
  botonPrimarioTexto: {
    color: '#fff',
    fontSize: typography.small,
    fontWeight: '700',
  },
});
