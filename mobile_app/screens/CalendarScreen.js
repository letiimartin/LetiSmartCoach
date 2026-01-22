import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Platform,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Plus,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Users,
    HeartPulse,
    Info,
    Clock,
    AlertTriangle,
    X
} from 'lucide-react-native';
import { MOCK_EVENTS } from '../constants/mocks';

const EVENT_TYPES = {
    race: { label: 'Carrera', color: '#ffcc00', icon: Trophy },
    social: { label: 'Social', color: '#ff3366', icon: Users },
    health: { label: 'Salud/Personal', color: '#33ff99', icon: HeartPulse },
};

export default function CalendarScreen() {
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
    const [events, setEvents] = useState(MOCK_EVENTS);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-19')); // Lunes de la semana mock

    // Get days of the week starting from Monday
    const weekDays = useMemo(() => {
        const days = [];
        const start = new Date(currentDate);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate]);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const getEventsForDay = (date) => {
        const dateStr = formatDate(date);
        return events.filter(e => {
            if (e.date === dateStr) return true;
            if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
            return false;
        });
    };

    const DayItem = ({ date }) => {
        const dayEvents = getEventsForDay(date);
        const isToday = formatDate(date) === '2026-01-22'; // Hardcoded "today" for mock context

        return (
            <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
                <View style={styles.dayHeader}>
                    <View>
                        <Text style={styles.dayName}>{date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}</Text>
                        <Text style={styles.dayNumber}>{date.getDate()}</Text>
                    </View>
                    <Text style={styles.daySummary}>
                        {dayEvents.length > 0 ? `${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventos'}` : 'Sin eventos'}
                    </Text>
                </View>

                {dayEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </View>
        );
    };

    const EventCard = ({ event }) => {
        const config = EVENT_TYPES[event.type];
        const Icon = config.icon;

        return (
            <TouchableOpacity style={[styles.eventCard, { borderLeftColor: config.color }]}>
                <View style={styles.eventMain}>
                    <View style={styles.eventIconLabel}>
                        <Icon size={16} color={config.color} />
                        <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>
                    {event.time && (
                        <View style={styles.eventTime}>
                            <Clock size={12} color="#909090" />
                            <Text style={styles.timeText}>{event.time}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.badgeContainer}>
                    {event.priority && <Badge text={`Prioridad ${event.priority}`} color="#ffcc00" />}
                    {event.impact && <Badge text={event.impact} color="#ff3366" />}
                    {event.restriction && <Badge text={event.restriction} color="#33ff99" icon={<AlertTriangle size={10} color="#000" />} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Calendario</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
                        <Plus color="#000" size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'week' && styles.toggleActive]}
                    onPress={() => setViewMode('week')}
                >
                    <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Semana</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'month' && styles.toggleActive]}
                    onPress={() => setViewMode('month')}
                >
                    <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>Mes</Text>
                </TouchableOpacity>
            </View>

            {viewMode === 'week' ? (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Impact Card */}
                    <View style={styles.impactCard}>
                        <Info size={20} color="#00f2ff" />
                        <View style={styles.impactContent}>
                            <Text style={styles.impactTitle}>Esta semana</Text>
                            <Text style={styles.impactText}>• 2 días con restricciones</Text>
                            <Text style={styles.impactText}>• Domingo: Carrera A</Text>
                        </View>
                    </View>

                    {weekDays.map(date => (
                        <DayItem key={date.toString()} date={date} />
                    ))}
                </ScrollView>
            ) : (
                <MonthView events={events} />
            )}

            {/* Add Event Modal Placeholder (Simple Version for Phase 1) */}
            <AddEventModal
                isVisible={isAddModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSave={(newEvent) => {
                    setEvents([...events, { ...newEvent, id: Date.now() }]);
                    setAddModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}

function Badge({ text, color, icon }) {
    return (
        <View style={[styles.badge, { backgroundColor: color }]}>
            {icon}
            <Text style={styles.badgeText}>{text}</Text>
        </View>
    );
}

function MonthView({ events }) {
    // Simple mock month view - grid of 31 days
    return (
        <View style={styles.monthContainer}>
            <View style={styles.monthHeader}>
                <Text style={styles.monthTitle}>Enero 2026</Text>
            </View>
            <View style={styles.monthGrid}>
                {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.date === dateStr || (e.endDate && dateStr >= e.date && dateStr <= e.endDate));

                    return (
                        <View key={i} style={styles.monthDay}>
                            <Text style={styles.monthDayText}>{day}</Text>
                            <View style={styles.markerContainer}>
                                {dayEvents.slice(0, 3).map(e => (
                                    <View key={e.id} style={[styles.marker, { backgroundColor: EVENT_TYPES[e.type].color }]} />
                                ))}
                            </View>
                        </View>
                    );
                })}
            </View>
            <View style={styles.monthLegend}>
                {Object.entries(EVENT_TYPES).map(([key, val]) => (
                    <View key={key} style={styles.legendItem}>
                        <View style={[styles.marker, { backgroundColor: val.color }]} />
                        <Text style={styles.legendText}>{val.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function AddEventModal({ isVisible, onClose, onSave }) {
    const [step, setStep] = useState(1); // 1: Type selection, 2: Form
    const [selectedType, setSelectedType] = useState(null);
    const [form, setForm] = useState({ title: '', date: '2026-01-22', priority: 'B', impact: 'Flexible', restriction: 'Ninguna' });

    if (!isVisible) return null;

    const reset = () => {
        setStep(1);
        setSelectedType(null);
        setForm({ title: '', date: '2026-01-22', priority: 'B', impact: 'Flexible', restriction: 'Ninguna' });
    };

    return (
        <Modal transparent animationType="slide" visible={isVisible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Añadir Evento</Text>
                        <TouchableOpacity onPress={() => { onClose(); reset(); }}>
                            <X color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>

                    {step === 1 ? (
                        <View style={styles.typeSelection}>
                            <TypeButton
                                type="race"
                                title="Carrera / Objetivo"
                                icon={<Trophy color="#ffcc00" />}
                                onSelect={() => { setSelectedType('race'); setStep(2); }}
                            />
                            <TypeButton
                                type="social"
                                title="Evento Social"
                                icon={<Users color="#ff3366" />}
                                onSelect={() => { setSelectedType('social'); setStep(2); }}
                            />
                            <TypeButton
                                type="health"
                                title="Salud / Personal"
                                icon={<HeartPulse color="#33ff99" />}
                                onSelect={() => { setSelectedType('health'); setStep(2); }}
                            />
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Nombre del Evento</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={form.title}
                                onChangeText={t => setForm({ ...form, title: t })}
                                placeholder="Ej. Trail 20k"
                                placeholderTextColor="#606060"
                            />

                            <Text style={styles.formLabel}>Fecha (Mock YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={form.date}
                                onChangeText={t => setForm({ ...form, date: t })}
                            />

                            {selectedType === 'race' && (
                                <>
                                    <Text style={styles.formLabel}>Prioridad (A/B/C)</Text>
                                    <TextInput style={styles.modalInput} value={form.priority} onChangeText={t => setForm({ ...form, priority: t.toUpperCase() })} />
                                </>
                            )}

                            {selectedType === 'social' && (
                                <>
                                    <Text style={styles.formLabel}>Impacto (No entreno / Reducir / Flexible)</Text>
                                    <TextInput style={styles.modalInput} value={form.impact} onChangeText={t => setForm({ ...form, impact: t })} />
                                </>
                            )}

                            {selectedType === 'health' && (
                                <>
                                    <Text style={styles.formLabel}>Restricción (No correr / Solo Z1 / etc)</Text>
                                    <TextInput style={styles.modalInput} value={form.restriction} onChangeText={t => setForm({ ...form, restriction: t })} />
                                </>
                            )}

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => {
                                    onSave({ ...form, type: selectedType });
                                    reset();
                                }}
                            >
                                <Text style={styles.saveButtonText}>Guardar Evento</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

function TypeButton({ title, icon, onSelect }) {
    return (
        <TouchableOpacity style={styles.typeButton} onPress={onSelect}>
            <View style={styles.typeButtonLeft}>
                {icon}
                <Text style={styles.typeButtonText}>{title}</Text>
            </View>
            <ChevronRight color="#606060" size={20} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#00f2ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginHorizontal: 20,
        padding: 4,
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    toggleActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    toggleText: {
        color: '#909090',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    impactCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 242, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        gap: 16,
        marginBottom: 24,
    },
    impactTitle: {
        color: '#00f2ff',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    impactText: {
        color: '#e0e0e0',
        fontSize: 13,
    },
    dayContainer: {
        marginBottom: 24,
    },
    todayContainer: {
        borderLeftWidth: 2,
        borderLeftColor: '#00f2ff',
        paddingLeft: 12,
        marginLeft: -14,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    dayName: {
        color: '#707070',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dayNumber: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
    },
    daySummary: {
        color: '#909090',
        fontSize: 12,
        marginBottom: 4,
    },
    eventCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 4,
        marginBottom: 8,
    },
    eventMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eventTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    eventTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: '#909090',
        fontSize: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        color: '#000',
        fontSize: 11,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#151518',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 450,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    typeSelection: {
        gap: 12,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 18,
        borderRadius: 16,
    },
    typeButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    typeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    formContainer: {
        gap: 12,
    },
    formLabel: {
        color: '#909090',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    modalInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    saveButton: {
        backgroundColor: '#00f2ff',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
    },
    saveButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    monthContainer: {
        paddingHorizontal: 20,
    },
    monthTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    monthDay: {
        width: (width - 40 - 48) / 7,
        aspectRatio: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    monthDayText: {
        color: '#fff',
        fontSize: 14,
    },
    markerContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 4,
        gap: 2,
    },
    marker: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    monthLegend: {
        marginTop: 24,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendText: {
        color: '#909090',
        fontSize: 12,
    }
});
