import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, List, Calendar, User } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';

// Context
import { WorkoutsProvider } from './src/context/WorkoutsContext';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator({ onLogout }) {
  return (
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
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0c', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00f2ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <WorkoutsProvider>
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
          {session ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs">
                {(props) => <TabNavigator {...props} onLogout={() => supabase.auth.signOut()} />}
              </Stack.Screen>
              <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
            </Stack.Navigator>
          ) : (
            <AuthScreen onLogin={() => { }} />
          )}
        </NavigationContainer>
      </WorkoutsProvider>
    </SafeAreaProvider>
  );
}
