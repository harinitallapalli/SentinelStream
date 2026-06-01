def check_fraud(amount: float):
    if amount > 10000:
        return "FRAUD"

    return "SAFE"