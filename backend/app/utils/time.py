from datetime import datetime, timezone


def server_now():
  return datetime.now(timezone.utc)


def ensure_utc(dt):
  if dt is None:
    return None
  if dt.tzinfo is None:
    return dt.replace(tzinfo=timezone.utc)
  return dt.astimezone(timezone.utc)
