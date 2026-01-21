from supabase_client import get_supabase_client
from datetime import datetime
import json

supabase = get_supabase_client()

def calculate_best_efforts(user_id: str, workout_id: str, sport: str, metrics: dict):
    # This is a simplified version. For a real app, we'd parse the FIT file or stream data.
    # Wahoo API might provide some peaks, but if not, we'd need time-series data.
    # For now, we'll store the session average/max if peak data isn't available in JSON.
    
    if sport == "cycling":
        windows = ["5s", "1m", "5m", "20m", "60m"]
        # In a real scenario, we'd look for "max_power", "normalized_power", etc.
        # Or parse the stream. Here we mock it based on available avg_power.
        avg_power = metrics.get("avg_power")
        if avg_power:
            for window in windows:
                # Mocking: in reality, 20m peak > 60m peak, etc.
                # Here we just store the workout as a potential source.
                eff_data = {
                    "user_id": user_id,
                    "sport": sport,
                    "window": window,
                    "value": avg_power, # Mocked value
                    "unit": "W",
                    "recorded_at": metrics.get("start_time"),
                    "workout_id": workout_id
                }
                supabase.table("best_efforts").insert(eff_data).execute()

    elif sport == "running":
        # Handle running distances
        pass
