import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, List, Calendar, User } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './lib/supabase';

// Screens
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import ProfileScreen from './screens/ProfileScreen';
import CalendarScreen from './screens/CalendarScreen';

const Tab = createBottomTabNavigator();



export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0c', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00f2ff" />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen onLogin={() => { }} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#0a0a0c',
          primary: '#00f2ff',
          card: '#0a0a0c',
          border: 'rgba(255,255,255,0.1)',
          text: '#e0e0e0',
        }
      }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0a0a0c',
              borderTopColor: 'rgba(255,255,255,0.1)',
              height: 64,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: '#00f2ff',
            tabBarInactiveTintColor: '#909090',
            tabBarIcon: ({ color, size }) => {
              if (route.name === 'Home') return <Home size={size} color={color} />;
              if (route.name === 'Entrenos') return <List size={size} color={color} />;
              if (route.name === 'Calendario') return <Calendar size={size} color={color} />;
              if (route.name === 'Perfil') return <User size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={DashboardScreen} />
          <Tab.Screen name="Entrenos" component={WorkoutsScreen} />
          <Tab.Screen name="Calendario" component={CalendarScreen} />
          <Tab.Screen name="Perfil">
            {(props) => <ProfileScreen {...props} onLogout={() => setSession(null)} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
