# auth_utils.py
import json
import os

def save_tokens(token_data):
    with open("tokens.json", "w") as f:
        json.dump(token_data, f)

def load_tokens():
    if os.path.exists("tokens.json"):
        with open("tokens.json", "r") as f:
            return json.load(f)
    return None
