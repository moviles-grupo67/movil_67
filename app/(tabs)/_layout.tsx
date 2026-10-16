import { useAuth } from "@/contexts/auth-context";
import { esStaff } from "@/src/dominio/permisos";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { sesion } = useAuth();
  const mostrarGestion = esStaff(sesion?.usuario.rol);
  console.log("Sesión:", sesion);
  console.log("Rol:", sesion?.usuario.rol);
  console.log("Mostrar Gestión:", mostrarGestion);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="espacios"
        options={{
          title: "Espacios",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="th-large" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: "Reservas",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="gestion/index"
        options={{
          title: "Gestión",
          headerShown: false,
          href: mostrarGestion ? "/(tabs)/gestion" : null,
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />

      <Tabs.Screen
        name="cuenta"
        options={{
          title: "Cuenta",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
