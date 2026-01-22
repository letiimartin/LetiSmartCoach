import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { User, Activity, Heart, Target, LifeBuoy, Settings, LogOut, ChevronRight, Info } from 'lucide-react-native';
import { MOCK_ATHLETE } from '../constants/mocks';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ onLogout }) {
    const athlete = MOCK_ATHLETE;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{athlete.avatar}</Text>
                    </View>
                    <Text style={styles.name}>{athlete.name}</Text>
                    <Text style={styles.sportFocus}>{athlete.sport_focus}</Text>
                </View>

                {/* 2. Información General */}
                <Section title="Información General" icon={<User size={20} color="#00f2ff" />}>
                    <View style={styles.grid}>
                        <InfoItem label="Edad" value={`${athlete.age} años`} />
                        <InfoItem label="Género" value={athlete.gender} />
                        <InfoItem label="Altura" value={`${athlete.height_cm} cm`} />
                        <InfoItem label="Peso" value={`${athlete.weight_kg} kg`} />
                    </View>
                    <View style={styles.fullWidthItem}>
                        <Text style={styles.label}>Ocupación</Text>
                        <Text style={styles.value}>{athlete.occupation}</Text>
                    </View>
                </Section>

                {/* 3. Perfil Deportivo */}
                <Section title="Perfil Deportivo" icon={<Activity size={20} color="#00f2ff" />}>
                    <View style={styles.row}>
                        <InfoItem label="Nivel" value={athlete.level} />
                        <InfoItem label="Perfil" value={athlete.profile_type} />
                    </View>
                    <View style={styles.row}>
                        <InfoItem label="FTP (Ciclismo)" value={`${athlete.ftp_w} W`} highlighted />
                        <InfoItem label="Ritmo (Running)" value={athlete.running_pace} highlighted />
                    </View>

                    <Text style={styles.subTitle}>Zonas de Potencia</Text>
                    <View style={styles.zonesContainer}>
                        {athlete.zones.power.map((z, i) => (
                            <Text key={i} style={styles.zoneText}>{z}</Text>
                        ))}
                    </View>

                    <Text style={styles.subTitle}>Zonas de FC</Text>
                    <View style={styles.zonesContainer}>
                        {athlete.zones.hr.map((z, i) => (
                            <Text key={i} style={styles.zoneText}>{z}</Text>
                        ))}
                    </View>
                </Section>

                {/* 4. Preferencias y Motivación */}
                <Section title="Preferencias y Motivación" icon={<Target size={20} color="#00f2ff" />}>
                    <DetailItem label="¿Por qué entrena?" value={athlete.motivation} />
                    <DetailItem label="¿Qué le motiva más?" value={athlete.motivators} />
                    <DetailItem label="Tipos de carreras favoritas" value={athlete.fav_races} />
                    <DetailItem label="Entrenamientos que disfruta" value={athlete.fav_workouts} />
                </Section>

                {/* 5. Contexto Vital */}
                <Section title="Contexto Vital" icon={<LifeBuoy size={20} color="#00f2ff" />}>
                    <View style={styles.grid}>
                        <InfoItem label="Horario Habitual" value={athlete.schedule} />
                        <InfoItem label="Estrés Percibido" value={athlete.stress} />
                        <InfoItem label="Vida Social" value={athlete.social_life} />
                        <InfoItem label="Tiempo Libre" value={athlete.free_time} />
                    </View>
                </Section>

                {/* 6. Acciones (Mock) */}
                <View style={styles.actionsContainer}>
                    <ActionButton label="Editar Perfil" icon={<Settings size={20} color="#909090" />} />
                    <ActionButton label="Conectar Dispositivos" icon={<ChevronRight size={20} color="#909090" />} />
                    <ActionButton label="Ajustes de Entrenamiento" icon={<ChevronRight size={20} color="#909090" />} />
                </View>

                {/* 7. Cerrar Sesión */}
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <LogOut size={20} color="#fff" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ title, icon, children }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                {icon}
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
}

function InfoItem({ label, value, highlighted }) {
    return (
        <View style={styles.infoItem}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, highlighted && styles.primaryText]}>{value}</Text>
        </View>
    );
}

function DetailItem({ label, value }) {
    return (
        <View style={styles.detailItem}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

function ActionButton({ label, icon }) {
    return (
        <TouchableOpacity style={styles.actionButton} disabled>
            <Text style={styles.actionLabel}>{label}</Text>
            {icon}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00f2ff',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00f2ff',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    sportFocus: {
        fontSize: 16,
        color: '#00f2ff',
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e0e0e0',
    },
    sectionContent: {
        gap: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    infoItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 12,
        borderRadius: 12,
    },
    fullWidthItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 12,
        borderRadius: 12,
    },
    detailItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 12,
        borderRadius: 12,
        gap: 4,
    },
    label: {
        fontSize: 12,
        color: '#909090',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 2,
    },
    detailValue: {
        fontSize: 15,
        color: '#e0e0e0',
        lineHeight: 20,
    },
    primaryText: {
        color: '#00f2ff',
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#909090',
        marginTop: 8,
        marginBottom: 4,
    },
    zonesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    zoneText: {
        fontSize: 12,
        color: '#e0e0e0',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    actionsContainer: {
        marginTop: 10,
        marginBottom: 24,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 18,
        borderRadius: 16,
        opacity: 0.5,
    },
    actionLabel: {
        fontSize: 16,
        color: '#e0e0e0',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff453a',
        padding: 18,
        borderRadius: 16,
        gap: 10,
        marginTop: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
