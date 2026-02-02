import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ofeapnttdjbsyaquslwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZWFwbnR0ZGpic3lhcXVzbHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjI1MTAsImV4cCI6MjA4NDU5ODUxMH0.wnnwfI2396Ee8trP89HE8X6uqn5fZkt_iMx2dKs5ZXA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
