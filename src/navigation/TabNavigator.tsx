
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { autenticarPersonal } from '@/utils/biometria';
import type { RootStackParamList } from './AppNavigator';

import IndexScreen from '@/screens/Index';
import DetallePelicula from '@/screens/DetallePelicula';
import MapaAsientosScreen from '@/screens/MapaAsientosScreen';
import FormularioVenta from '@/screens/FormularioVenta';
import GeneradorQR from '@/screens/GeneradorQR';
import HistorialBoletos from '@/screens/HistorialScreen';

import PeliculasScreen from '@/screens/PeliculasScreen';
import CrearFuncionScreen from '@/screens/CrearFuncionScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import EscanerScreen from '@/screens/EscanerScreen';

export type TabParamList = {
  Cartelera: undefined;
  MisBoletos: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const CarteleraStack = createNativeStackNavigator<RootStackParamList>();
const AdminStack = createNativeStackNavigator<RootStackParamList>();
const MisBoletosStack = createNativeStackNavigator<RootStackParamList>();

function CarteleraStackScreen() {
  return (
    <CarteleraStack.Navigator screenOptions={{ headerShown: false }}>
      <CarteleraStack.Screen name="Catalogo" component={IndexScreen} />
      <CarteleraStack.Screen name="DetallePelicula" component={DetallePelicula} />
      <CarteleraStack.Screen name="SeleccionAsientos" component={MapaAsientosScreen} />
      <CarteleraStack.Screen name="FormularioVenta" component={FormularioVenta} />
      <CarteleraStack.Screen name="GeneradorQR" component={GeneradorQR} />
    </CarteleraStack.Navigator>
  );
}

function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="GestionPeliculas" component={PeliculasScreen} />
      <AdminStack.Screen name="CrearFuncion" component={CrearFuncionScreen} />
      <AdminStack.Screen name="Dashboard" component={DashboardScreen} />
      <AdminStack.Screen name="Escaner" component={EscanerScreen} />
    </AdminStack.Navigator>
  );
}

function MisBoletosStackScreen() {
  return (
    <MisBoletosStack.Navigator screenOptions={{ headerShown: false }}>
      <MisBoletosStack.Screen name="HistorialBoletos" component={HistorialBoletos} />
      <MisBoletosStack.Screen name="GeneradorQR" component={GeneradorQR} />
    </MisBoletosStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.bgPanel,
          borderTopColor: colors.borderSubtle,
        },
        tabBarIcon: ({ color, size }) => {
          const iconos: Record<keyof TabParamList, string> = {
            Cartelera: 'film-outline',
            MisBoletos: 'ticket-outline',
            Admin: 'settings-outline',
          };
          return <Ionicons name={iconos[route.name as keyof TabParamList] as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Cartelera" component={CarteleraStackScreen} />

      <Tab.Screen name="MisBoletos" component={MisBoletosStackScreen} options={{ title: 'Mis Boletos' }} />

      <Tab.Screen
        name="Admin"
        component={AdminStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();

            autenticarPersonal().then((resultado) => {
              if (resultado.exito) {
                navigation.navigate('Admin');
              } else if (resultado.mensaje) {
                Alert.alert('Acceso denegado', resultado.mensaje);
              }
            });
          },
        })}
      />
    </Tab.Navigator>
  );
}