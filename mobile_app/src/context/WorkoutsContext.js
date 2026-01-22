import React, { createContext, useContext, useState, useEffect } from 'react';
import { calendarService } from '../services/calendarService';

const WorkoutsContext = createContext();

export function WorkoutsProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await calendarService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateWorkoutStatus = (id, status) => {
        setEvents(prev => prev.map(event =>
            event.id === id ? { ...event, status } : event
        ));
    };

    const addEvent = async (event) => {
        const saved = await calendarService.addEvent(event);
        setEvents(prev => [...prev, saved]);
        return saved;
    };

    const value = {
        events,
        loading,
        updateWorkoutStatus,
        addEvent,
        refresh: loadData
    };

    return (
        <WorkoutsContext.Provider value={value}>
            {children}
        </WorkoutsContext.Provider>
    );
}

export function useWorkouts() {
    const context = useContext(WorkoutsContext);
    if (!context) {
        throw new Error('useWorkouts must be used within a WorkoutsProvider');
    }
    return context;
}
