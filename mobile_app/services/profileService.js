import { MOCK_ATHLETE } from '../constants/mocks';

export const profileService = {
    async getProfile() {
        // Simulating API latency
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_ATHLETE), 300);
        });
    },

    async updateProfile(updates) {
        console.log('Update profile (Mock):', updates);
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 300);
        });
    }
};
