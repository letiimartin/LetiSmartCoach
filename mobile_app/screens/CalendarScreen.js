import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Platform,
    FlatList,
    Dimensions,
    ActivityIndicator
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
    X,
    Bike,
    Activity
} from 'lucide-react-native';
import { calendarService } from '../services/calendarService';

const { width } = Dimensions.get('window');

const EVENT_TYPES = {
    workout: { label: 'Entreno', color: '#00f2ff', icon: Activity },
    race: { label: 'Carrera', color: '#ffcc00', icon: Trophy },
    social: { label: 'Social', color: '#ff4444', icon: Users },
    health: { label: 'Salud/Personal', color: '#33ff99', icon: HeartPulse },
};

export default function CalendarScreen() {
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-19')); // Lunes de la semana mock
    const [selectedDate, setSelectedDate] = useState('2026-01-19');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [fetchedEvents, fetchedSummary] = await Promise.all([
            calendarService.getEvents(),
            calendarService.getWeeklySummary(currentDate)
        ]);
        setEvents(fetchedEvents);
        setSummary(fetchedSummary);
        setLoading(false);
    };

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

    const getEventsForDay = (dateStr) => {
        return events.filter(e => {
            if (e.date === dateStr) return true;
            if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
            return false;
        });
    };

    const DayItem = ({ date }) => {
        const dateStr = formatDate(date);
        const dayEvents = getEventsForDay(dateStr);
        const isToday = dateStr === '2026-01-22'; // Hardcoded "today" for mock context

        return (
            <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
                <View style={styles.dayHeader}>
                    <View>
                        <Text style={styles.dayName}>{date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}</Text>
                        <Text style={styles.dayNumber}>{date.getDate()}</Text>
                    </View>
                    <Text style={styles.daySummary}>
                        {dayEvents.length > 0 ? `${dayEvents.length} ${dayEvents.length === 1 ? 'item' : 'items'}` : 'Sin entrenos'}
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
        const isWorkout = event.type === 'workout';
        const SportIcon = event.sport === 'ciclismo' ? Bike : Activity;

        return (
            <TouchableOpacity style={[styles.eventCard, { borderLeftColor: config.color }]}>
                <View style={styles.eventMain}>
                    <View style={styles.eventIconLabel}>
                        {isWorkout ? <SportIcon size={18} color={config.color} /> : <Icon size={16} color={config.color} />}
                        <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>
                    {isWorkout ? (
                        <View style={styles.workoutMeta}>
                            <Text style={styles.durationText}>{event.duration}</Text>
                            <View style={[styles.zoneBadge, { backgroundColor: 'rgba(0, 242, 255, 0.1)' }]}>
                                <Text style={styles.zoneText}>{event.zone}</Text>
                            </View>
                        </View>
                    ) : (
                        event.time && (
                            <View style={styles.eventTime}>
                                <Clock size={12} color="#909090" />
                                <Text style={styles.timeText}>{event.time}</Text>
                            </View>
                        )
                    )}
                </View>

                <View style={styles.badgeContainer}>
                    {event.priority && <Badge text={`Prioridad ${event.priority}`} color="#ffcc00" />}
                    {event.impact && <Badge text={event.impact} color="#ff3366" />}
                    {event.restriction && <Badge text={event.restriction} color="#33ff99" icon={<AlertTriangle size={10} color="#000" />} />}
                    {isWorkout && event.status && <Badge text={event.status} color="#e0e0e0" />}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <ActivityIndicator color="#00f2ff" size="large" />
            </SafeAreaView>
        );
    }

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
                    {/* Impact Card (Phase 1 Refined) */}
                    {summary && (
                        <View style={styles.impactCard}>
                            <View style={styles.summaryStats}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{summary.sessions}</Text>
                                    <Text style={styles.statLab}>Sesiones</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{summary.hours}</Text>
                                    <Text style={styles.statLab}>Horas</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{summary.tss}</Text>
                                    <Text style={styles.statLab}>TSS</Text>
                                </View>
                            </View>
                            <View style={styles.impactContent}>
                                <Text style={styles.impactText}>• {summary.restrictions} días con restricciones</Text>
                                <Text style={styles.impactText}>• {summary.keyRace}</Text>
                            </View>
                        </View>
                    )}

                    {weekDays.map(date => (
                        <DayItem key={date.toString()} date={date} />
                    ))}
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <MonthView
                        events={events}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                    />
                    <ScrollView style={styles.selectedDayEvents}>
                        <Text style={styles.selectedDayTitle}>
                            {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                        {getEventsForDay(selectedDate).length > 0 ? (
                            getEventsForDay(selectedDate).map(e => <EventCard key={e.id} event={e} />)
                        ) : (
                            <Text style={styles.noEventsText}>No hay entrenos ni eventos para este día.</Text>
                        )}
                    </ScrollView>
                </View>
            )}

            <AddEventModal
                isVisible={isAddModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSave={async (newEvent) => {
                    const saved = await calendarService.addEvent(newEvent);
                    setEvents([...events, saved]);
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

function MonthView({ events, selectedDate, onSelectDate }) {
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

                    // Get unique types for markers
                    const seenTypes = new Set();
                    const markerColors = [];
                    dayEvents.forEach(e => {
                        if (!seenTypes.has(e.type)) {
                            seenTypes.add(e.type);
                            markerColors.push(EVENT_TYPES[e.type].color);
                        }
                    });

                    const isSelected = dateStr === selectedDate;

                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.monthDay,
                                isSelected && styles.selectedDay
                            ]}
                            onPress={() => onSelectDate(dateStr)}
                        >
                            <Text style={[styles.monthDayText, isSelected && styles.selectedDayText]}>{day}</Text>
                            <View style={styles.markerContainer}>
                                {markerColors.slice(0, 4).map((c, idx) => (
                                    <View key={idx} style={[styles.marker, { backgroundColor: c }]} />
                                ))}
                            </View>
                        </TouchableOpacity>
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
                        <Text style={styles.modalTitle}>Añadir Item</Text>
                        <TouchableOpacity onPress={() => { onClose(); reset(); }}>
                            <X color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>

                    {step === 1 ? (
                        <View style={styles.typeSelection}>
                            <TypeButton
                                title="Entrenamiento"
                                icon={<Activity color="#00f2ff" />}
                                onSelect={() => { setSelectedType('workout'); setStep(2); }}
                            />
                            <TypeButton
                                title="Carrera / Objetivo"
                                icon={<Trophy color="#ffcc00" />}
                                onSelect={() => { setSelectedType('race'); setStep(2); }}
                            />
                            <TypeButton
                                title="Evento Social"
                                icon={<Users color="#ff3366" />}
                                onSelect={() => { setSelectedType('social'); setStep(2); }}
                            />
                            <TypeButton
                                title="Salud / Personal"
                                icon={<HeartPulse color="#33ff99" />}
                                onSelect={() => { setSelectedType('health'); setStep(2); }}
                            />
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Nombre del Item</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={form.title}
                                onChangeText={t => setForm({ ...form, title: t })}
                                placeholder="Ej. Trail 20k o Rodaje Z2"
                                placeholderTextColor="#606060"
                            />

                            <Text style={styles.formLabel}>Fecha (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={form.date}
                                onChangeText={t => setForm({ ...form, date: t })}
                            />

                            {selectedType === 'workout' && (
                                <View style={{ gap: 12 }}>
                                    <Text style={styles.formLabel}>Deporte (ciclismo/running)</Text>
                                    <TextInput style={styles.modalInput} value={form.sport} onChangeText={t => setForm({ ...form, sport: t })} />
                                    <Text style={styles.formLabel}>Duración (ej. 1h 30m)</Text>
                                    <TextInput style={styles.modalInput} value={form.duration} onChangeText={t => setForm({ ...form, duration: t })} />
                                </View>
                            )}

                            {selectedType === 'race' && (
                                <>
                                    <Text style={styles.formLabel}>Prioridad (A/B/C)</Text>
                                    <TextInput style={styles.modalInput} value={form.priority} onChangeText={t => setForm({ ...form, priority: t.toUpperCase() })} />
                                </>
                            )}

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => {
                                    onSave({ ...form, type: selectedType });
                                    reset();
                                }}
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
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
    container: { flex: 1, backgroundColor: '#0a0a0c' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff' },
    addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00f2ff', alignItems: 'center', justifyContent: 'center' },
    toggleContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, marginHorizontal: 20, padding: 4, marginBottom: 20 },
    toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    toggleActive: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    toggleText: { color: '#909090', fontWeight: '600' },
    toggleTextActive: { color: '#fff' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    impactCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
    summaryStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 15 },
    statBox: { alignItems: 'center' },
    statVal: { color: '#00f2ff', fontSize: 20, fontWeight: '800' },
    statLab: { color: '#707070', fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
    impactContent: { gap: 6 },
    impactText: { color: '#e0e0e0', fontSize: 13 },
    dayContainer: { marginBottom: 24 },
    todayContainer: { borderLeftWidth: 2, borderLeftColor: '#00f2ff', paddingLeft: 12, marginLeft: -14 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
    dayName: { color: '#707070', fontSize: 12, fontWeight: 'bold' },
    dayNumber: { color: '#fff', fontSize: 24, fontWeight: '800' },
    daySummary: { color: '#909090', fontSize: 12, marginBottom: 4 },
    eventCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 12, padding: 14, borderLeftWidth: 4, marginBottom: 8 },
    eventMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    eventIconLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    eventTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
    workoutMeta: { alignItems: 'flex-end' },
    durationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    zoneBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    zoneText: { color: '#00f2ff', fontSize: 10, fontWeight: 'bold' },
    eventTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { color: '#909090', fontSize: 12 },
    badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#151518', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 450 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    typeSelection: { gap: 12 },
    typeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 18, borderRadius: 16 },
    typeButtonLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    typeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    formContainer: { gap: 12 },
    formLabel: { color: '#909090', fontSize: 12, textTransform: 'uppercase' },
    modalInput: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    saveButton: { backgroundColor: '#00f2ff', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 12 },
    saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    monthContainer: { paddingHorizontal: 12, marginBottom: 10 },
    monthTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, paddingHorizontal: 8 },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', rowGap: 8 },
    monthDay: { width: (width - 40) / 7, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginBottom: 8 },
    selectedDay: { backgroundColor: 'rgba(0, 242, 255, 0.15)', borderWidth: 1, borderColor: '#00f2ff' },
    monthDayText: { color: '#909090', fontSize: 15, fontWeight: '500', marginBottom: 4 },
    selectedDayText: { color: '#fff', fontWeight: 'bold' },
    markerContainer: { flexDirection: 'row', height: 6, alignItems: 'center', gap: 3 },
    marker: { width: 5, height: 5, borderRadius: 2.5 },
    monthLegend: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendText: { color: '#707070', fontSize: 11, textTransform: 'uppercase' },
    selectedDayEvents: { flex: 1, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
    selectedDayTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16, textTransform: 'capitalize' },
    noEventsText: { color: '#606060', fontStyle: 'italic', fontSize: 14, textAlign: 'center', marginTop: 20 }
});
