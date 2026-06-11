from werkzeug.security import check_password_hash, generate_password_hash


def hash_pin(pin: str) -> str:
  return generate_password_hash(str(pin))


def verify_pin(pin: str, pin_hash: str) -> bool:
  return check_password_hash(pin_hash, str(pin))
