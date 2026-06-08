def check_fraud(amount: float, location: str):
    suspicious_locations = [
        "Unknown",
        "Foreign",
        "DarkWeb"
    ]

    if amount > 50000:
        return "HIGH_RISK"

    if amount > 10000:
        return "FRAUD"

    if location in suspicious_locations:
        return "FRAUD"

    return "SAFE"