import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User,
    Activity,
    Target,
    LifeBuoy,
    LogOut,
    Edit3,
    Save,
    X,
    AlertCircle,
    ChevronDown,
    Plus,
    Info,
    ChevronRight,
    Activity as ActivityIcon,
    Zap,
    Heart,
    Gauge,
    Calendar,
    Trophy,
    Clock
} from 'lucide-react-native';

import { profileService } from '../services/profileService';

const { width } = Dimensions.get('window');

// Options
const GENDER_OPTIONS = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'];
const SPORT_FOCUS_OPTIONS = [
    { label: 'Ciclismo', value: 'cycling' },
    { label: 'Trail Running', value: 'trail' },
    { label: 'Ambos', value: 'both' }
];
const LEVEL_OPTIONS = ['Principiante', 'Recreacional', 'Amateur Competitivo', 'Élite Amateur'];
const STRESS_OPTIONS = ['Bajo', 'Moderado', 'Alto', 'Muy Alto'];
const SCHEDULE_OPTIONS = ['Mañanas', 'Mediodía', 'Tardes', 'Noches', 'Variable'];
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function ProfileScreen({ navigation, onLogout }) {
    const [athlete, setAthlete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [activeEditSection, setActiveEditSection] = useState('general');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await profileService.getProfile();
            setAthlete(data);
            setFormData(data || {});
        } catch (error) {
            Alert.alert("Error", "No se pudo cargar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = () => {
        if (!formData) return 0;
        const mandatory = ['full_name', 'age', 'gender', 'height_cm', 'weight_kg'];
        const recommended = ['sport_focus', 'level', 'ftp_w'];

        const mandatoryCount = mandatory.filter(f => formData[f]).length;
        const recommendedCount = recommended.filter(f => formData[f]).length;

        // Mandatory is 70% of the bar, recommended 30%
        return Math.round(((mandatoryCount / mandatory.length) * 70) + ((recommendedCount / recommended.length) * 30));
    };

    const validate = () => {
        let newErrors = {};
        const { age, height_cm, weight_kg, gender, full_name } = formData;

        if (!full_name) newErrors.full_name = "Requerido";
        if (!age || age < 14 || age > 100) newErrors.age = "Error";
        if (!gender) newErrors.gender = "Requerido";
        if (!height_cm || height_cm < 100 || height_cm > 250) newErrors.height_cm = "Error";
        if (!weight_kg || weight_kg < 30 || weight_kg > 250) newErrors.weight_kg = "Error";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            Alert.alert("Campos incompletos", "Por favor completa los datos obligatorios en Información General.");
            setActiveEditSection('general');
            return;
        }

        setSaving(true);
        try {
            const updated = await profileService.updateProfile(formData);
            setAthlete(updated);
            setFormData(updated);
            setIsEditing(false);
            Alert.alert("Éxito", "Perfil actualizado correctamente");
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper for nested JSON fields
    const updateJsonField = (parent, field, value) => {
        setFormData(prev => {
            const current = prev[parent] || {};
            return {
                ...prev,
                [parent]: { ...current, [field]: value }
            };
        });
    };

    if (loading || !athlete) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <ActivityIndicator color="#00f2ff" />
            </SafeAreaView>
        );
    }

    const completion = calculateCompletion();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                {/* Custom Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{isEditing ? 'Configuración' : 'Mi Perfil'}</Text>
                    {isEditing ? (
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.iconButton}>
                                <X size={20} color="#ff453a" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#000" /> : <Save size={20} color="#000" />}
                                <Text style={styles.saveText}>Hecho</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                            <Edit3 size={18} color="#00f2ff" />
                            <Text style={styles.editText}>Editar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {!isEditing ?
                        <>
                            {/* Profile Status */}
                            {completion < 100 && (
                                <View style={styles.statusBox}>
                                    <View style={styles.statusHeader}>
                                        <AlertCircle size={16} color="#ffcc00" />
                                        <Text style={styles.statusText}>Perfil Incompleto</Text>
                                        <Text style={styles.statusPercent}>{completion}%</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${completion}%` }]} />
                                    </View>
                                </View>
                            )}

                            {/* Hero Card */}
                            <View style={styles.heroCard}>
                                <View style={styles.avatarLarge}>
                                    <Text style={styles.avatarText}>{athlete.avatar}</Text>
                                </View>
                                <View style={styles.heroInfo}>
                                    <Text style={styles.heroName}>{athlete.full_name || 'Nuevo Atleta'}</Text>
                                    <Text style={styles.heroSub}>{athlete.email}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.sportBadge}>
                                            <Text style={styles.sportBadgeText}>{SPORT_FOCUS_OPTIONS.find(o => o.value === athlete.sport_focus)?.label || 'Multideporte'}</Text>
                                        </View>
                                        {athlete.level && (
                                            <View style={styles.levelBadge}>
                                                <Text style={styles.levelBadgeText}>{athlete.level}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Section 1: Basicos */}
                            <Card title="Información General" icon={<User size={18} color="#00f2ff" />}>
                                <View style={styles.grid}>
                                    <StatItem label="Edad" value={athlete.age} unit="años" />
                                    <StatItem label="Género" value={athlete.gender} />
                                    <StatItem label="Altura" value={athlete.height_cm} unit="cm" />
                                    <StatItem label="Peso" value={athlete.weight_kg} unit="kg" />
                                </View>
                            </Card>

                            {/* Section 2: Ficha Técnica */}
                            <Card title="Ficha Deportiva" icon={<ActivityIcon size={18} color="#00f2ff" />}>
                                <View style={styles.grid}>
                                    <StatItem label="Cooper / FTP" value={athlete.ftp_w} unit="W" highlight />
                                    <StatItem label="VO2 Max" value={athlete.vo2max} unit="ml/kg" />
                                    <StatItem label="Ritmo Run" value={athlete.thresholds_json?.run_threshold_pace} />
                                    <StatItem label="Tipo" value={athlete.athlete_type} />
                                </View>
                                {!athlete.ftp_w && (
                                    <TouchableOpacity style={styles.ctaBox}>
                                        <Zap size={16} color="#00f2ff" />
                                        <Text style={styles.ctaText}>Estimar FTP con un test de 20 min</Text>
                                        <ChevronRight size={16} color="#606060" />
                                    </TouchableOpacity>
                                )}
                            </Card>

                            {/* Section 3: Zonas */}
                            <Card title="Zonas de Entrenamiento" icon={<Gauge size={18} color="#00f2ff" />}>
                                <View style={styles.zoneGroup}>
                                    <Text style={styles.zoneLabel}>Zonas de Potencia (W)</Text>
                                    <View style={styles.chipRow}>
                                        {Object.entries(athlete.zones_power_json || {}).map(([key, val]) => (
                                            <View key={key} style={styles.zoneChip}>
                                                <Text style={styles.zoneChipText}>{key}: {val}W</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.zoneGroup}>
                                    <Text style={styles.zoneLabel}>Zonas de Frecuencia Cardíaca (PPM)</Text>
                                    <View style={styles.chipRow}>
                                        {Object.entries(athlete.zones_hr_json || {}).map(([key, val]) => (
                                            <View key={key} style={[styles.zoneChip, { borderColor: 'rgba(255,100,100,0.2)' }]}>
                                                <Text style={styles.zoneChipText}>{key}: {val}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </Card>

                            {/* Section 4: Contexto & Vital */}
                            <Card title="Preferencias y Contexto" icon={<LifeBuoy size={18} color="#00f2ff" />}>
                                <View style={styles.vitalGrid}>
                                    <VitalItem label="Horario" value={athlete.schedule} icon={<Calendar size={14} color="#00f2ff" />} />
                                    <VitalItem label="Estrés" value={athlete.stress} icon={<Zap size={14} color="#00f2ff" />} />
                                </View>
                                <View style={styles.vitalGrid}>
                                    <VitalItem label="Disponibilidad" value={athlete.availability} icon={<Clock size={14} color="#00f2ff" />} />
                                    <VitalItem label="Día Fuerza" value={athlete.force_preference} icon={<ActivityIcon size={14} color="#00f2ff" />} />
                                </View>
                                <Text style={styles.bioTitle}>Motivación</Text>
                                <Text style={styles.bioText} numberOfLines={3}>{athlete.motivation || 'Sin definir'}</Text>
                                <Text style={styles.bioTitle}>Próximos Objetivos</Text>
                                <Text style={styles.bioText}>{athlete.preferred_races || 'Sin definir'}</Text>
                            </Card>

                            {/* Logout */}
                            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                                <LogOut size={20} color="#ff453a" />
                                <Text style={styles.logoutText}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        </>
                        :
                        /* EDIT MODE */
                        <View style={styles.editSection}>

                            {/* General */}
                            <EditAccordion
                                title="1. Información General"
                                active={activeEditSection === 'general'}
                                onToggle={() => setActiveEditSection('general')}
                                isValid={!errors.full_name && !errors.age}
                            >
                                <Input label="Nombre Completo *" value={formData.full_name} onChange={v => updateField('full_name', v)} error={errors.full_name} />
                                <View style={styles.formRow}>
                                    <Input label="Edad *" value={formData.age} onChange={v => updateField('age', v)} keyboardType="numeric" style={{ flex: 1 }} error={errors.age} />
                                    <Picker label="Género *" value={formData.gender} options={GENDER_OPTIONS} onSelect={v => updateField('gender', v)} style={{ flex: 1.5 }} error={errors.gender} />
                                </View>
                                <View style={styles.formRow}>
                                    <Input label="Altura (cm) *" value={formData.height_cm} onChange={v => updateField('height_cm', v)} keyboardType="numeric" style={{ flex: 1 }} error={errors.height_cm} />
                                    <Input label="Peso (kg) *" value={formData.weight_kg} onChange={v => updateField('weight_kg', v)} keyboardType="numeric" style={{ flex: 1 }} error={errors.weight_kg} />
                                </View>
                            </EditAccordion>

                            {/* Deporte */}
                            <EditAccordion
                                title="2. Ficha Deportiva"
                                active={activeEditSection === 'sport'}
                                onToggle={() => setActiveEditSection('sport')}
                            >
                                <Picker label="Enfoque Principal" value={formData.sport_focus} options={SPORT_FOCUS_OPTIONS} onSelect={v => updateField('sport_focus', v)} />
                                <Picker label="Nivel" value={formData.level} options={LEVEL_OPTIONS} onSelect={v => updateField('level', v)} />
                                <View style={styles.formRow}>
                                    <Input label="FTP (W)" value={formData.ftp_w} onChange={v => updateField('ftp_w', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                    <Input label="VO2 Max" value={formData.vo2max} onChange={v => updateField('vo2max', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                </View>
                                <Input label="Ritmo Umbral (min/km)" value={formData.thresholds_json?.run_threshold_pace} onChange={v => updateJsonField('thresholds_json', 'run_threshold_pace', v)} placeholder="Ej: 4:15" />
                                <Input label="Tipo Atleta" value={formData.athlete_type} onChange={v => updateField('athlete_type', v)} placeholder="Ej: Escaladora, Diesel..." />
                            </EditAccordion>

                            {/* Zonas */}
                            <EditAccordion
                                title="3. Zonas de Potencia & FC"
                                active={activeEditSection === 'zones'}
                                onToggle={() => setActiveEditSection('zones')}
                            >
                                <Text style={styles.sectionSubtitle}>Watios (Power)</Text>
                                <View style={styles.formRow}>
                                    <Input label="Z1" value={formData.zones_power_json?.Z1} onChange={v => updateJsonField('zones_power_json', 'Z1', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                    <Input label="Z2" value={formData.zones_power_json?.Z2} onChange={v => updateJsonField('zones_power_json', 'Z2', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                    <Input label="Z3" value={formData.zones_power_json?.Z3} onChange={v => updateJsonField('zones_power_json', 'Z3', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                </View>
                                <View style={styles.formRow}>
                                    <Input label="Z4" value={formData.zones_power_json?.Z4} onChange={v => updateJsonField('zones_power_json', 'Z4', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                    <Input label="Z5" value={formData.zones_power_json?.Z5} onChange={v => updateJsonField('zones_power_json', 'Z5', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                    <Input label="Z6" value={formData.zones_power_json?.Z6} onChange={v => updateJsonField('zones_power_json', 'Z6', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                </View>
                                <Text style={styles.sectionSubtitle}>Latidos (PPM)</Text>
                                <View style={styles.formRow}>
                                    <Input label="Max FC" value={formData.thresholds_json?.hr_max} onChange={v => updateJsonField('thresholds_json', 'hr_max', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                    <Input label="Umbral FC" value={formData.thresholds_json?.hr_threshold} onChange={v => updateJsonField('thresholds_json', 'hr_threshold', v)} keyboardType="numeric" style={{ flex: 1 }} />
                                </View>
                            </EditAccordion>

                            {/* Preferencias */}
                            <EditAccordion
                                title="4. Motivación y Contexto"
                                active={activeEditSection === 'vital'}
                                onToggle={() => setActiveEditSection('vital')}
                            >
                                <Input label="¿Qué te motiva a entrenar?" value={formData.motivation} onChange={v => updateField('motivation', v)} multiline />
                                <Input label="Próximas Carreras / Metas" value={formData.preferred_races} onChange={v => updateField('preferred_races', v)} multiline placeholder="Copa de España, Reto Personal..." />
                                <View style={styles.formRow}>
                                    <Picker label="Horario" value={formData.schedule} options={SCHEDULE_OPTIONS} onSelect={v => updateField('schedule', v)} style={{ flex: 1 }} />
                                    <Picker label="Estrés" value={formData.stress} options={STRESS_OPTIONS} onSelect={v => updateField('stress', v)} style={{ flex: 1 }} />
                                </View>
                                <Input label="Disponibilidad Semanal" value={formData.availability} onChange={v => updateField('availability', v)} placeholder="Ej: L, M, J, S, D (2h)" />
                                <View style={styles.formRow}>
                                    <Input label="Preferencia Fuerza" value={formData.force_preference} onChange={v => updateField('force_preference', v)} placeholder="Ej: Miércoles" style={{ flex: 1 }} />
                                    <Input label="Restricciones" value={formData.restrictions} onChange={v => updateField('restrictions', v)} placeholder="Ej: No correr Lunes" style={{ flex: 1 }} />
                                </View>
                            </EditAccordion>
                        </View>
                    }

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// UI Components
function Card({ title, icon, children }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {icon}
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardContent}>{children}</View>
        </View>
    );
}

function StatItem({ label, value, unit, highlight }) {
    return (
        <View style={styles.statItem}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, highlight && { color: '#00f2ff' }]}>
                {value ? `${value}${unit ? ' ' + unit : ''}` : '---'}
            </Text>
        </View>
    );
}

function VitalItem({ label, value, icon }) {
    return (
        <View style={styles.vitalItem}>
            {icon}
            <View>
                <Text style={styles.vitalLabel}>{label}</Text>
                <Text style={styles.vitalValue}>{value || '---'}</Text>
            </View>
        </View>
    );
}

function EditAccordion({ title, active, onToggle, children, isValid = true }) {
    return (
        <View style={[styles.accordion, active && styles.accordionActive]}>
            <TouchableOpacity onPress={onToggle} style={styles.accordionHeader}>
                <Text style={[styles.accordionTitle, !isValid && { color: '#ff453a' }]}>{title}</Text>
                <ChevronDown size={18} color={active ? "#00f2ff" : "#606060"} style={{ transform: [{ rotate: active ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>
            {active && <View style={styles.accordionContent}>{children}</View>}
        </View>
    );
}

function Input({ label, value, onChange, keyboardType = 'default', style, error, multiline, placeholder }) {
    return (
        <View style={[styles.inputBox, style]}>
            <Text style={[styles.inputLabel, error && { color: '#ff453a' }]}>{label}</Text>
            <TextInput
                style={[styles.textInput, error && styles.inputError, multiline && { height: 80, textAlignVertical: 'top' }]}
                value={value?.toString() || ''}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor="#404040"
                multiline={multiline}
            />
        </View>
    );
}

function Picker({ label, value, options, onSelect, style, error }) {
    const [open, setOpen] = useState(false);

    // Support both simple string arrays and object arrays
    const renderValue = (val) => {
        const opt = options.find(o => (o.value || o) === val);
        return opt ? (opt.label || opt) : 'Seleccionar';
    };

    return (
        <View style={[styles.inputBox, style]}>
            <Text style={[styles.inputLabel, error && { color: '#ff453a' }]}>{label}</Text>
            <TouchableOpacity onPress={() => setOpen(!open)} style={[styles.textInput, styles.pickerInput, error && styles.inputError]}>
                <Text style={[styles.pickerText, !value && { color: '#404040' }]}>{renderValue(value)}</Text>
                <ChevronDown size={14} color="#606060" />
            </TouchableOpacity>
            {open && (
                <View style={styles.pickerDropdown}>
                    {options.map(opt => {
                        const val = opt.value || opt;
                        const label = opt.label || opt;
                        return (
                            <TouchableOpacity key={val} onPress={() => { onSelect(val); setOpen(false); }} style={styles.pickerOption}>
                                <Text style={[styles.pickerOptionText, value === val && { color: '#00f2ff' }]}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0c' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    editButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0, 242, 255, 0.1)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10
    },
    editText: { color: '#00f2ff', fontSize: 13, fontWeight: '700' },
    iconButton: { padding: 6 },
    saveButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#00f2ff',
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10
    },
    saveText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },

    scrollContainer: { padding: 20, paddingBottom: 60 },

    statusBox: { backgroundColor: 'rgba(255, 204, 0, 0.05)', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 204, 0, 0.1)' },
    statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    statusText: { flex: 1, color: '#ffcc00', fontSize: 13, fontWeight: 'bold' },
    statusPercent: { color: '#ffcc00', fontSize: 13, fontWeight: '800' },
    progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#ffcc00' },

    heroCard: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 24, paddingVertical: 10 },
    avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0, 242, 255, 0.08)', borderWidth: 1, borderColor: '#00f2ff', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#00f2ff', fontSize: 24, fontWeight: '900' },
    heroInfo: { flex: 1 },
    heroName: { color: '#fff', fontSize: 22, fontWeight: '900' },
    heroSub: { color: '#606060', fontSize: 13, marginTop: 2 },
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    sportBadge: { backgroundColor: 'rgba(0, 242, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    sportBadgeText: { color: '#00f2ff', fontSize: 11, fontWeight: 'bold' },
    levelBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    levelBadgeText: { color: '#e0e0e0', fontSize: 11, fontWeight: '600' },

    card: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    cardTitle: { color: '#ddd', fontSize: 15, fontWeight: '700' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statItem: { width: '48%', marginBottom: 16 },
    statLabel: { color: '#606060', fontSize: 10, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },

    ctaBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0, 242, 255, 0.05)', padding: 14, borderRadius: 12, marginTop: 8 },
    ctaText: { flex: 1, color: '#00f2ff', fontSize: 13, fontWeight: '600' },

    zoneGroup: { marginBottom: 15 },
    zoneLabel: { color: '#606060', fontSize: 11, marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    zoneChip: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    zoneChipText: { color: '#ccc', fontSize: 12, fontWeight: '600' },

    vitalGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    vitalItem: { flexDirection: 'row', gap: 10, width: '45%' },
    vitalLabel: { color: '#606060', fontSize: 10, textTransform: 'uppercase' },
    vitalValue: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
    bioTitle: { color: '#606060', fontSize: 11, fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
    bioText: { color: '#aaa', fontSize: 13, lineHeight: 20 },

    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 69, 58, 0.15)' },
    logoutText: { color: '#ff453a', fontSize: 16, fontWeight: 'bold' },

    // Edit Styles
    editSection: { gap: 12 },
    accordion: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)' },
    accordionActive: { borderColor: 'rgba(0, 242, 255, 0.2)' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
    accordionTitle: { color: '#e0e0e0', fontSize: 15, fontWeight: '700' },
    accordionContent: { paddingHorizontal: 18, paddingBottom: 20, gap: 15 },

    inputBox: { gap: 6 },
    inputLabel: { color: '#606060', fontSize: 11, fontWeight: 'bold' },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14,
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    inputError: { borderColor: '#ff453a' },
    formRow: { flexDirection: 'row', gap: 12 },
    pickerInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pickerText: { color: '#fff', fontSize: 14 },
    pickerDropdown: { backgroundColor: '#1a1a1c', borderRadius: 10, marginTop: 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    pickerOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.03)' },
    pickerOptionText: { color: '#aaa', fontSize: 14 },
    sectionSubtitle: { color: '#00f2ff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }
});
