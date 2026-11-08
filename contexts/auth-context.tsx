import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { autenticar, biometriaDisponible } from '@/src/servicios/biometria';
import { iniciarSesion, obtenerSesionPorToken, registrarse } from '@/src/servicios/auth-service';
import { CLAVE_TOKEN } from '@/src/servicios/cliente-api';
import { alternarFavorito as alternarFavoritoServicio } from '@/src/servicios/usuarios';
import { vibrarError, vibrarExito } from '@/src/servicios/vibracion';
import { esError, Respuesta } from '@/src/tipos/api';
import { DatosRegistro, Sesion, Usuario } from '@/src/tipos/usuario';

const guardarUsuario = (u: Usuario) => SecureStore.setItemAsync(CLAVE_USUARIO, JSON.stringify(u));
const borrarTodo = async () => {
  await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  await SecureStore.deleteItemAsync(CLAVE_USUARIO);
};

const CLAVE_BIOMETRIA = 'biometria-activada';
const CLAVE_USUARIO = 'sesion-usuario';

interface AuthContextValue {
  sesion: Sesion | null;
  cargando: boolean;
  bloqueada: boolean;
  biometriaActivada: boolean;
  ingresar: (email: string, contrasena: string) => Promise<string | null>;
  crearCuenta: (datos: DatosRegistro) => Promise<string | null>;
  activarBiometria: () => Promise<string | null>;
  desactivarBiometria: () => Promise<void>;
  desbloquear: () => Promise<boolean>;
  salir: () => Promise<void>;
  alternarFavorito: (espacioId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [pendiente, setPendiente] = useState<Sesion | null>(null);
  const [biometriaActivada, setBiometriaActivada] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      let paraDesbloquear: Sesion | null = null;
      try {
        const token = await SecureStore.getItemAsync(CLAVE_TOKEN);
        if (!token) return;

        const r = await obtenerSesionPorToken(token);
        let recuperada: Sesion | null = null;
        if (!esError(r)) {
          recuperada = r.datos;
          await guardarUsuario(r.datos.usuario);
        } else if (r.error.codigo === 'TOKEN_INVALIDO') {
          await borrarTodo();
          return;
        } else {
          const copia = await SecureStore.getItemAsync(CLAVE_USUARIO);
          if (copia) recuperada = { token, usuario: JSON.parse(copia) as Usuario };
        }
        if (!recuperada) return;

        const activada =
          (await SecureStore.getItemAsync(CLAVE_BIOMETRIA)) === recuperada.usuario.id;
        if (activada && (await biometriaDisponible())) {
          setBiometriaActivada(true);
          setPendiente(recuperada);
          paraDesbloquear = recuperada;
        } else {
          setSesion(recuperada);
        }
      } catch {
      } finally {
        setCargando(false);
      }

      if (paraDesbloquear && (await autenticar('Desbloqueá tu sesión'))) {
        vibrarExito();
        setSesion(paraDesbloquear);
        setPendiente(null);
      }
    })();
  }, []);

  const guardarSesion = useCallback(async (respuesta: Respuesta<Sesion>) => {
    if (esError(respuesta)) return respuesta.error.mensaje;
    await SecureStore.setItemAsync(CLAVE_TOKEN, respuesta.datos.token);
    await guardarUsuario(respuesta.datos.usuario);
    const idActivado = await SecureStore.getItemAsync(CLAVE_BIOMETRIA);
    setBiometriaActivada(idActivado === respuesta.datos.usuario.id);
    setPendiente(null);
    setSesion(respuesta.datos);
    return null;
  }, []);

  const ingresar = useCallback(
    async (email: string, contrasena: string) =>
      guardarSesion(await iniciarSesion(email, contrasena)),
    [guardarSesion]
  );

  const crearCuenta = useCallback(
    async (datos: DatosRegistro) => guardarSesion(await registrarse(datos)),
    [guardarSesion]
  );

  const activarBiometria = useCallback(async () => {
    if (!sesion) return 'Tenés que iniciar sesión primero.';
    if (!(await biometriaDisponible())) {
      return 'Este dispositivo no tiene huella ni bloqueo de pantalla configurado.';
    }
    if (!(await autenticar('Confirmá para activar el desbloqueo'))) {
      return 'No se pudo confirmar tu identidad.';
    }
    await SecureStore.setItemAsync(CLAVE_BIOMETRIA, sesion.usuario.id);
    setBiometriaActivada(true);
    return null;
  }, [sesion]);

  const desactivarBiometria = useCallback(async () => {
    await SecureStore.deleteItemAsync(CLAVE_BIOMETRIA);
    setBiometriaActivada(false);
  }, []);

  const desbloquear = useCallback(async () => {
    if (!pendiente) return true;
    const ok = await autenticar('Desbloqueá tu sesión');
    if (ok) {
      vibrarExito();
      setSesion(pendiente);
      setPendiente(null);
    } else {
      vibrarError();
    }
    return ok;
  }, [pendiente]);

  const alternarFavorito = useCallback(
    async (espacioId: string) => {
      if (!sesion) return;
      const favoritos = await alternarFavoritoServicio(sesion.usuario.id, espacioId);
      const usuarioActualizado = { ...sesion.usuario, espaciosFavoritos: favoritos };
      await guardarUsuario(usuarioActualizado);
      setSesion({ ...sesion, usuario: usuarioActualizado });
    },
    [sesion]
  );

  const salir = useCallback(async () => {
    await borrarTodo();
    setBiometriaActivada(false);
    setPendiente(null);
    setSesion(null);
  }, []);

  const value = useMemo(
    () => ({
      sesion,
      cargando,
      bloqueada: pendiente !== null,
      biometriaActivada,
      ingresar,
      crearCuenta,
      activarBiometria,
      desactivarBiometria,
      desbloquear,
      salir,
      alternarFavorito,
    }),
    [
      sesion,
      cargando,
      pendiente,
      biometriaActivada,
      ingresar,
      crearCuenta,
      activarBiometria,
      desactivarBiometria,
      desbloquear,
      salir,
      alternarFavorito,
    ]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
