import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { User, Activity, Heart, Target, LifeBuoy, Settings, LogOut, ChevronRight, Edit3, Plus, Info } from 'lucide-react-native';
import { MOCK_ATHLETE } from '../constants/mocks';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ onLogout }) {
    const athlete = MOCK_ATHLETE;

    // Calculo de completitud (mock logic)
    const fields = ['age', 'height_cm', 'weight_kg', 'occupation', 'level', 'profile_type', 'ftp_w', 'running_pace', 'motivation', 'motivators', 'fav_races', 'fav_workouts', 'schedule', 'stress', 'social_life', 'free_time'];
    const filledFields = fields.filter(f => athlete[f] !== null && athlete[f] !== "").length;
    const completionPercent = Math.round((filledFields / fields.length) * 100);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topHeader}>
                <Text style={styles.topTitle}>Mi Perfil</Text>
                <TouchableOpacity style={styles.editMainButton} disabled>
                    <Edit3 size={20} color="#00f2ff" />
                    <Text style={styles.editMainText}>Editar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Card & Completion */}
                <View style={styles.profileCard}>
                    <View style={styles.headerInfo}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{athlete.avatar}</Text>
                        </View>
                        <View>
                            <Text style={styles.name}>{athlete.name}</Text>
                            <Text style={styles.sportFocus}>{athlete.sport_focus}</Text>
                        </View>
                    </View>

                    <View style={styles.completionContainer}>
                        <View style={styles.completionHeader}>
                            <Text style={styles.completionLabel}>Perfil {completionPercent < 100 ? 'Incompleto' : 'Completo'}</Text>
                            <Text style={styles.completionValue}>{completionPercent}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
                        </View>
                        {completionPercent < 100 && (
                            <Text style={styles.completionTip}>Completa tu información para que el Coach IA sea más preciso.</Text>
                        )}
                    </View>
                </View>

                {/* 2. Información General */}
                <Section title="Información General" icon={<User size={18} color="#00f2ff" />} onEdit={() => { }}>
                    <View style={styles.grid}>
                        <InfoItem label="Edad" value={athlete.age} unit="años" />
                        <InfoItem label="Género" value={athlete.gender} />
                        <InfoItem label="Altura" value={athlete.height_cm} unit="cm" />
                        <InfoItem label="Peso" value={athlete.weight_kg} unit="kg" />
                    </View>
                    <FullWidthItem label="Ocupación" value={athlete.occupation} />
                </Section>

                {/* 3. Perfil Deportivo */}
                <Section title="Perfil Deportivo" icon={<Activity size={18} color="#00f2ff" />} onEdit={() => { }}>
                    <View style={styles.row}>
                        <InfoItem label="Nivel" value={athlete.level} />
                        <InfoItem label="Perfil" value={athlete.profile_type} />
                    </View>
                    <View style={styles.row}>
                        <InfoItem label="FTP (Ciclismo)" value={athlete.ftp_w} unit="W" highlighted />
                        <InfoItem label="Ritmo (Running)" value={athlete.running_pace} highlighted />
                    </View>

                    <Text style={styles.subTitle}>Zonas de Potencia</Text>
                    <View style={styles.zonesContainer}>
                        {athlete.zones?.power?.length > 0 ? (
                            athlete.zones.power.map((z, i) => (
                                <View key={i} style={styles.chip}><Text style={styles.chipText}>{z}</Text></View>
                            ))
                        ) : <EmptyState text="Zonas de potencia no definidas" />}
                    </View>

                    <Text style={styles.subTitle}>Zonas de FC</Text>
                    <View style={styles.zonesContainer}>
                        {athlete.zones?.hr?.length > 0 ? (
                            athlete.zones.hr.map((z, i) => (
                                <View key={i} style={styles.chip}><Text style={styles.chipText}>{z}</Text></View>
                            ))
                        ) : <EmptyState text="Zonas de frecuencia no definidas" />}
                    </View>
                </Section>

                {/* 4. Preferencias y Motivación */}
                <Section title="Preferencias y Motivación" icon={<Target size={18} color="#00f2ff" />} onEdit={() => { }}>
                    <DetailItem label="¿Por qué entrena?" value={athlete.motivation} />
                    <DetailItem label="¿Qué le motiva más?" value={athlete.motivators} />
                    <DetailItem label="Carreras favoritas" value={athlete.fav_races} />
                    <DetailItem label="Entrenamientos top" value={athlete.fav_workouts} />
                </Section>

                {/* 5. Contexto Vital */}
                <Section title="Contexto Vital" icon={<LifeBuoy size={18} color="#00f2ff" />} onEdit={() => { }}>
                    <View style={styles.grid}>
                        <InfoItem label="Horario Habitual" value={athlete.schedule} />
                        <InfoItem label="Estrés Percibido" value={athlete.stress} />
                        <InfoItem label="Vida Social" value={athlete.social_life} />
                        <InfoItem label="Tiempo Libre" value={athlete.free_time} />
                    </View>
                </Section>

                {/* 7. Cerrar Sesión */}
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <LogOut size={20} color="#fff" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ title, icon, children, onEdit }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                    {icon}
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <TouchableOpacity onPress={onEdit} style={styles.sectionEdit}>
                    <Edit3 size={14} color="#909090" />
                </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
}

function InfoItem({ label, value, unit, highlighted }) {
    const isDefined = value !== null && value !== "";
    return (
        <View style={styles.infoItem}>
            <Text style={styles.label}>{label}</Text>
            {isDefined ? (
                <Text style={[styles.value, highlighted && styles.primaryText]}>{value}{unit ? ` ${unit}` : ''}</Text>
            ) : (
                <TouchableOpacity style={styles.addCta}>
                    <Plus size={12} color="#00f2ff" />
                    <Text style={styles.addText}>Añadir</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function FullWidthItem({ label, value }) {
    const isDefined = value !== null && value !== "";
    return (
        <View style={styles.fullWidthItem}>
            <Text style={styles.label}>{label}</Text>
            {isDefined ? (
                <Text style={styles.value}>{value}</Text>
            ) : (
                <TouchableOpacity style={styles.addCta}>
                    <Plus size={12} color="#00f2ff" />
                    <Text style={styles.addText}>Añadir</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function DetailItem({ label, value }) {
    const isDefined = value !== null && value !== "";
    return (
        <View style={styles.detailItem}>
            <Text style={styles.label}>{label}</Text>
            {isDefined ? (
                <Text style={styles.detailValue}>{value}</Text>
            ) : (
                <TouchableOpacity style={styles.addCta}>
                    <Plus size={12} color="#00f2ff" />
                    <Text style={styles.addText}>Añadir información</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function EmptyState({ text }) {
    return (
        <View style={styles.emptyState}>
            <Info size={14} color="#606060" />
            <Text style={styles.emptyText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    topTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    editMainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.2)',
    },
    editMainText: {
        color: '#00f2ff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00f2ff',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#00f2ff',
    },
    name: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    sportFocus: {
        fontSize: 14,
        color: '#00f2ff',
        marginTop: 2,
    },
    completionContainer: {
        gap: 8,
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    completionLabel: {
        color: '#e0e0e0',
        fontSize: 13,
        fontWeight: '600',
    },
    completionValue: {
        color: '#00f2ff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#00f2ff',
    },
    completionTip: {
        fontSize: 11,
        color: '#909090',
        marginTop: 2,
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e0e0e0',
    },
    sectionEdit: {
        padding: 4,
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
        justifyContent: 'center',
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
        fontSize: 11,
        color: '#707070',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    detailValue: {
        fontSize: 14,
        color: '#e0e0e0',
        lineHeight: 20,
    },
    addCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    addText: {
        color: '#00f2ff',
        fontSize: 13,
        fontWeight: '500',
    },
    primaryText: {
        color: '#00f2ff',
    },
    subTitle: {
        fontSize: 13,
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
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chipText: {
        fontSize: 11,
        color: '#e0e0e0',
    },
    emptyState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    emptyText: {
        fontSize: 12,
        color: '#606060',
        fontStyle: 'italic',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        padding: 18,
        borderRadius: 16,
        gap: 10,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.2)',
    },
    logoutText: {
        color: '#ff453a',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
