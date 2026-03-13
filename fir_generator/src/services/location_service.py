import requests
import os

class LocationService:
    @staticmethod
    def detect_location(address: str = None):
        """
        Detects:
        1. Jurisdiction: Based on 'address' (Place of Incident) if provided.
        2. Filling Location: Strictly based on live IP address.
        """
        headers = {'User-Agent': 'JusticeRoute-FIR-Generator/1.0'}
        
        # --- 1. Get Live Filling Location (Audit) ---
        filling_loc_str = "Unknown"
        live_lat, live_lon = None, None
        try:
            ip_res = requests.get('https://ipinfo.io/json', timeout=5)
            if ip_res.status_code == 200:
                ip_data = ip_res.json()
                filling_loc_str = f"{ip_data.get('city')}, {ip_data.get('region')} (IP Detect)"
                l_loc = ip_data.get('loc', '').split(',')
                if len(l_loc) == 2:
                    live_lat, live_lon = l_loc[0], l_loc[1]
        except: pass

        # --- 2. Get Jurisdiction (Police Station Header) ---
        juris_lat, juris_lon = live_lat, live_lon # Default to live
        
        if address:
            try:
                search_url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1"
                s_res = requests.get(search_url, headers=headers, timeout=5)
                if s_res.status_code == 200:
                    s_data = s_res.json()
                    if s_data:
                        juris_lat = s_data[0].get('lat')
                        juris_lon = s_data[0].get('lon')
            except: pass

        # Map jurisdiction coordinates back to Station Name
        jurisdiction = {
            "district": "Mumbai City",
            "police_station": "Colaba",
            "state": "Maharashtra"
        }

        if juris_lat and juris_lon:
            try:
                geo_url = f"https://nominatim.openstreetmap.org/reverse?lat={juris_lat}&lon={juris_lon}&format=json"
                g_res = requests.get(geo_url, headers=headers, timeout=5)
                if g_res.status_code == 200:
                    g_data = g_res.json()
                    addr = g_data.get('address', {})
                    area = addr.get('suburb') or addr.get('neighbourhood') or addr.get('city_district') or addr.get('town')
                    city = addr.get('city') or addr.get('county') or addr.get('state_district')
                    
                    if area:
                        for s in [' East', ' West', ' North', ' South']:
                            area = area.replace(s, '').replace(s.lower(), '')
                    
                    jurisdiction = {
                        "district": city or "Mumbai City",
                        "police_station": area or f"{city} Central",
                        "state": addr.get('state', 'Maharashtra')
                    }
            except: pass

        return {
            "jurisdiction": jurisdiction,
            "filling_location": filling_loc_str
        }
