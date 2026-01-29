/**
 * Utility functions for date manipulation in LetiSmartCoach
 */

/**
 * Returns an array of 7 days representing a week around the pivot date
 * @param {Date} pivot - The date to base the week on
 * @returns {Array} List of {label, date, day} objects
 */
export const getWeekDays = (pivot) => {
    const startOfWeek = new Date(pivot);
    // Adjust to Monday
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return {
            label: d.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase() + d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(1),
            date: d.toISOString().split('T')[0],
            day: d.getDate()
        };
    });
};

/**
 * Returns the month metadata and days for the pivot date
 * @param {Date} pivot 
 * @returns {Object} {monthName, year, days, emptySlots}
 */
export const getMonthData = (pivot) => {
    const year = pivot.getFullYear();
    const month = pivot.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-based offset (0=Mon, 6=Sun)
    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6;

    const daysInMonth = lastDay.getDate();
    const monthName = pivot.toLocaleDateString('es-ES', { month: 'long' });

    return {
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        year,
        days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        emptySlots: Array.from({ length: startOffset }, (_, i) => i)
    };
};

/**
 * Formats a date to YYYY-MM-DD
 */
export const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};
