def check_fraud(
    amount: float,
    location: str,
    fraud_threshold: float = 10000.0,
    high_risk_threshold: float = 50000.0,
    suspicious_locations: list = None
):
    if suspicious_locations is None:
        suspicious_locations = ["Unknown", "Foreign", "DarkWeb"]

    if amount > high_risk_threshold:
        return "HIGH_RISK"

    if amount > fraud_threshold:
        return "FRAUD"

    # Case insensitive location match
    loc_clean = location.strip().lower()
    suspicious_clean = [loc.strip().lower() for loc in suspicious_locations]
    if loc_clean in suspicious_clean:
        return "FRAUD"

    return "SAFE"
