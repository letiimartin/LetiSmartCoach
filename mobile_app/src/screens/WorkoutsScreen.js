import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkouts } from '../context/WorkoutsContext';
import WorkoutCard from '../components/WorkoutCard';

const FILTERS = ['Todos', 'Ciclismo', 'Running', 'Fuerza'];
const TIME_FILTERS = [
    { label: 'Semana', value: 7 },
    { label: '14 Días', value: 14 }
];

export default function WorkoutsScreen({ navigation }) {
    const { events, updateWorkoutStatus } = useWorkouts();
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [timeFilter, setTimeFilter] = useState(7);

    const workouts = events.filter(e => e.type === 'workout');

    // Filtering logic
    const filteredWorkouts = workouts.filter(w => {
        const matchesSport = activeFilter === 'Todos' || w.sport.toLowerCase() === activeFilter.toLowerCase();
        // Mock time filtering logic (simplified)
        return matchesSport;
    });

    // Grouping by date
    const grouped = filteredWorkouts.reduce((acc, w) => {
        if (!acc[w.date]) acc[w.date] = [];
        acc[w.date].push(w);
        return acc;
    }, {});

    const sections = Object.keys(grouped).sort().map(date => ({
        date,
        data: grouped[date]
    }));

    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr);
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        const formatted = date.toLocaleDateString('es-ES', options);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tus Entrenos</Text>
                <Text style={styles.subtitle}>Gestiona tu ejecución semanal</Text>
            </View>

            {/* Filtros */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.chip, activeFilter === f && styles.chipActive]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.divider} />
                    {TIME_FILTERS.map(tf => (
                        <TouchableOpacity
                            key={tf.value}
                            style={[styles.chip, timeFilter === tf.value && styles.chipActive]}
                            onPress={() => setTimeFilter(tf.value)}
                        >
                            <Text style={[styles.chipText, timeFilter === tf.value && styles.chipTextActive]}>{tf.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={sections}
                keyExtractor={(item) => item.date}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.daySection}>
                        <Text style={styles.dayHeader}>
                            {item.date === '2026-01-22' ? 'HOY • ' : ''}
                            {formatDateHeader(item.date)}
                        </Text>
                        {item.data.map(w => (
                            <WorkoutCard
                                key={w.id}
                                workout={w}
                                onPress={() => navigation.navigate('WorkoutDetail', { workout: w })}
                                onToggleStatus={(id) => updateWorkoutStatus(id, w.status === 'hecho' ? 'planificado' : 'hecho')}
                            />
                        ))}
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#909090',
        marginTop: 4,
    },
    filtersContainer: {
        marginBottom: 8,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipActive: {
        backgroundColor: '#00f2ff',
        borderColor: '#00f2ff',
    },
    chipText: {
        color: '#909090',
        fontSize: 14,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#000',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4,
    },
    list: {
        padding: 20,
        paddingTop: 8,
    },
    daySection: {
        marginBottom: 24,
    },
    dayHeader: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#606060',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 0.5,
    }
});
