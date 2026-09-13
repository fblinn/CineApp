import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { agregarPelicula, editarPelicula } from '@/redux/slices/peliculasSlice';
import { Pelicula, EstadoPelicula } from '@/types/pelicula';
import { colors, radius, spacing, typography } from '@/theme';

interface FormularioPeliculaScreenProps {
  visible: boolean;
  peliculaEditar: Pelicula | null;
  onClose: () => void;
}

interface FormState {
  codigo: string;
  nombre: string;
  genero: string;
  duracion: string;
  clasificacion: string;
  salaAsignada: string;
  precio: string;
  estado: EstadoPelicula;
  posterImage: string;
}

type CampoTexto = Exclude<keyof FormState, 'estado'>;
type Errores = Partial<Record<keyof FormState, string>>;

function estadoInicial(pelicula: Pelicula | null): FormState {
  if (!pelicula) {
    return {
      codigo: '',
      nombre: '',
      genero: '',
      duracion: '',
      clasificacion: '',
      salaAsignada: '',
      precio: '',
      estado: 'disponible',
       posterImage: '',
    };
  }
  return {
    codigo: pelicula.codigo,
    nombre: pelicula.nombre,
    genero: pelicula.genero,
    duracion: String(pelicula.duracion),
    clasificacion: pelicula.clasificacion,
    salaAsignada: pelicula.salaAsignada,
    precio: String(pelicula.precio),
    estado: pelicula.estado,
    posterImage: pelicula.posterImage ?? '',
  };
}

export default function FormularioPeliculaScreen({
  visible,
  peliculaEditar,
  onClose,
}: FormularioPeliculaScreenProps) {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);

  const [form, setForm] = useState<FormState>(estadoInicial(peliculaEditar));
  const [errores, setErrores] = useState<Errores>({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  // Se resetea el formulario cada vez que la modal se abre con una película distinta
  React.useEffect(() => {
    if (visible) {
      setForm(estadoInicial(peliculaEditar));
      setErrores({});
      setIntentoEnviar(false);
    }
  }, [visible, peliculaEditar]);

  const validarCampo = (campo: CampoTexto, valores: FormState): string | undefined => {
    switch (campo) {
      case 'nombre':
        return valores.nombre.trim() ? undefined : 'El nombre es obligatorio.';

      case 'codigo': {
        if (!valores.codigo.trim()) return 'El código es obligatorio.';
        const duplicado = peliculas.some(
          (p) =>
            p.codigo.trim().toLowerCase() === valores.codigo.trim().toLowerCase() &&
            p.id !== peliculaEditar?.id
        );
        return duplicado ? 'Ya existe una película con este código.' : undefined;
      }

      case 'precio': {
        if (valores.precio === '') return 'El precio es obligatorio.';
        const precioNum = Number(valores.precio);
        if (Number.isNaN(precioNum)) return 'Ingresa un precio válido.';
        if (precioNum < 0) return 'El precio no puede ser negativo.';
        if (precioNum === 0) return 'El precio debe ser mayor a 0.';
        return undefined;
      }

      case 'duracion': {
        if (valores.duracion === '') return 'La duración es obligatoria.';
        const duracionNum = Number(valores.duracion);
        if (Number.isNaN(duracionNum)) return 'Ingresa una duración válida.';
        if (duracionNum <= 0) return 'La duración debe ser mayor a 0.';
        return undefined;
      }

      case 'genero':
        return valores.genero.trim() ? undefined : 'El género es obligatorio.';

      case 'clasificacion':
        return valores.clasificacion.trim() ? undefined : 'La clasificación es obligatoria.';

      case 'salaAsignada':
        return valores.salaAsignada.trim() ? undefined : 'La sala asignada es obligatoria.';

      default:
        return undefined;
    }
  };

  const CAMPOS: CampoTexto[] = [
    'codigo',
    'nombre',
    'genero',
    'duracion',
    'clasificacion',
    'salaAsignada',
    'precio',
  ];

  const validarTodo = (valores: FormState): Errores => {
    const nuevosErrores: Errores = {};
    for (const campo of CAMPOS) {
      const mensaje = validarCampo(campo, valores);
      if (mensaje) nuevosErrores[campo] = mensaje;
    }
    return nuevosErrores;
  };

  const actualizar = (campo: CampoTexto, valor: string) => {
    const nuevoForm = { ...form, [campo]: valor };
    setForm(nuevoForm);
    if (intentoEnviar) {
      setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, nuevoForm) }));
    }
  };

  // Abre la galería del dispositivo y guarda la URI local de la imagen elegida
  const elegirImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tus fotos para poder elegir un poster.'
      );
      return;
    }

     const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      const asset = resultado.assets[0];

      if (!asset.base64) {
        Alert.alert('No se pudo procesar la imagen', 'Intenta con otra foto.');
        return;
      }

      // Se guarda como base64 (data URI)
      // El base64 queda guardado directo dentro del dato de la película
      const mime = asset.mimeType ?? 'image/jpeg';
      const dataUri = `data:${mime};base64,${asset.base64}`;
      setForm((prev) => ({ ...prev, posterImage: dataUri }));
    }
  };

  const quitarImagen = () => {
    setForm((prev) => ({ ...prev, posterImage: '' }));
  };

  const handleGuardar = () => {
    setIntentoEnviar(true);
    const nuevosErrores = validarTodo(form);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const payload: Pelicula = {
      id: peliculaEditar?.id ?? Date.now().toString(),
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      genero: form.genero.trim(),
      duracion: Number(form.duracion),
      clasificacion: form.clasificacion.trim(),
      salaAsignada: form.salaAsignada.trim(),
      precio: Number(form.precio),
      estado: form.estado,
      posterImage: form.posterImage || undefined,
    };

    if (peliculaEditar) {
      dispatch(editarPelicula(payload));
    } else {
      dispatch(agregarPelicula(payload));
    }

    onClose();
  };

  const hayErrores = Object.values(errores).some(Boolean);

  const renderCampo = (
    campo: CampoTexto,
    etiqueta: string,
    opciones?: { teclado?: 'default' | 'numeric' | 'decimal-pad'; placeholder?: string }
  ) => (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, errores[campo] && styles.inputError]}
        value={form[campo]}
        onChangeText={(valor) => actualizar(campo, valor)}
        placeholder={opciones?.placeholder}
        placeholderTextColor={colors.textDim}
        keyboardType={opciones?.teclado ?? 'default'}
      />
      {errores[campo] && <Text style={styles.errorTexto}>{errores[campo]}</Text>}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.tarjetaContenedor}
        >
          <View style={styles.tarjeta}>
            <View style={styles.header}>
              <Text style={styles.titulo}>
                {peliculaEditar ? 'Editar película' : 'Agregar película'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>×</Text>
              </TouchableOpacity>
            </View>

            {intentoEnviar && hayErrores && (
              <View style={styles.alerta}>
                <Text style={styles.alertaTexto}>
                  Revisa los campos en rojo antes de continuar.
                </Text>
              </View>
            )}

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {renderCampo('codigo', 'Código', { placeholder: 'PEL-006' })}
              {renderCampo('nombre', 'Nombre', { placeholder: 'Título de la película' })}
              {renderCampo('genero', 'Género', { placeholder: 'Acción, Comedia...' })}
              {renderCampo('duracion', 'Duración (min)', {
                teclado: 'numeric',
                placeholder: '120',
              })}
              {renderCampo('clasificacion', 'Clasificación', { placeholder: 'A, B, C' })}
              {renderCampo('salaAsignada', 'Sala asignada', { placeholder: 'Sala 1' })}
              {renderCampo('precio', 'Precio ($)', {
                teclado: 'decimal-pad',
                placeholder: '4.50',
              })}
              
              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Poster (opcional)</Text>
                <View style={styles.posterFila}>
                  {form.posterImage ? (
                    <Image source={{ uri: form.posterImage }} style={styles.posterPreview} />
                  ) : (
                    <View style={[styles.posterPreview, styles.posterPreviewVacio]}>
                      <Text style={styles.posterPreviewTexto}>Sin imagen</Text>
                    </View>
                  )}
                  <View style={styles.posterAcciones}>
                    <TouchableOpacity style={styles.botonSecundario} onPress={elegirImagen}>
                      <Text style={styles.botonSecundarioTexto}>
                        {form.posterImage ? 'Cambiar imagen' : 'Subir imagen'}
                      </Text>
                    </TouchableOpacity>
                    {form.posterImage && (
                      <TouchableOpacity onPress={quitarImagen}>
                        <Text style={styles.quitarTexto}>Quitar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Estado</Text>
                <View style={styles.estadoToggle}>
                  <TouchableOpacity
                    style={[
                      styles.estadoOpcion,
                      form.estado === 'disponible' && styles.estadoOpcionActiva,
                    ]}
                    onPress={() => setForm((prev) => ({ ...prev, estado: 'disponible' }))}
                  >
                    <Text
                      style={[
                        styles.estadoTexto,
                        form.estado === 'disponible' && styles.estadoTextoActivo,
                      ]}
                    >
                      Disponible
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.estadoOpcion,
                      form.estado === 'no disponible' && styles.estadoOpcionActiva,
                    ]}
                    onPress={() => setForm((prev) => ({ ...prev, estado: 'no disponible' }))}
                  >
                    <Text
                      style={[
                        styles.estadoTexto,
                        form.estado === 'no disponible' && styles.estadoTextoActivo,
                      ]}
                    >
                      No disponible
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.acciones}>
              <TouchableOpacity style={styles.botonSecundario} onPress={onClose}>
                <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonPrimario} onPress={handleGuardar}>
                <Text style={styles.botonPrimarioTexto}>
                  {peliculaEditar ? 'Guardar cambios' : 'Agregar película'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  tarjetaContenedor: {
    width: '100%',
  },
  tarjeta: {
    backgroundColor: colors.bgPanel,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  cerrar: {
    color: colors.textMuted,
    fontSize: 26,
  },
  alerta: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  alertaTexto: {
    color: '#ff6b6b',
    fontSize: typography.small,
  },
  scroll: {
    maxHeight: 420,
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
  estadoToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  estadoOpcion: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  estadoOpcionActiva: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  estadoTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '600',
  },
  estadoTextoActivo: {
    color: colors.textPrimary,
  },
  posterFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  posterPreview: {
    width: 70,
    height: 96,
    borderRadius: radius.sm,
  },
  posterPreviewVacio: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterPreviewTexto: {
    color: colors.textDim,
    fontSize: typography.tiny,
    textAlign: 'center',
  },
  posterAcciones: {
    gap: spacing.sm,
  },
  quitarTexto: {
    color: colors.red,
    fontSize: typography.small,
    fontWeight: '600',
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
