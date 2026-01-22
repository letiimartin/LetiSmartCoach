import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, ChevronRight } from 'lucide-react-native';
import { calendarService } from '../services/calendarService';
import { ActivityIndicator } from 'react-native';

export default function WorkoutsScreen() {
    const [workouts, setWorkouts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        calendarService.getWorkouts().then(data => {
            setWorkouts(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color="#00f2ff" />
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tus Entrenos</Text>
                <Text style={styles.subtitle}>Sesiones planificadas para esta semana</Text>
            </View>

            <FlatList
                data={MOCK_WORKOUTS}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.workoutCard}>
                        <View style={styles.iconContainer}>
                            <Target color="#7000ff" size={24} />
                        </View>
                        <View style={styles.details}>
                            <Text style={styles.workoutTitle}>{item.title}</Text>
                            <Text style={styles.workoutMeta}>{item.sport} • {item.duration} • {item.intensity}</Text>
                        </View>
                        <ChevronRight color="#909090" size={20} />
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
        padding: 24,
        paddingBottom: 16,
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
    list: {
        padding: 24,
        gap: 16,
    },
    workoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(112, 0, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    details: {
        flex: 1,
    },
    workoutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    workoutMeta: {
        fontSize: 12,
        color: '#909090',
        marginTop: 2,
    },
});
