from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository


class UserService:
  def __init__(self, repository=None, auth_service=None):
    self.repository = repository or UserRepository()
    self.auth_service = auth_service or AuthService()

  def list_users(self, include_admin=False):
    return [u.to_dict(include_admin=include_admin) for u in self.repository.get_all()]

  def get_user(self, user_id, include_admin=False):
    user = self.repository.get_by_id(user_id)
    if not user:
      return None
    return user.to_dict(include_admin=include_admin)

  def create_user(self, data):
    display_name = (data.get("display_name") or "").strip()
    pin = data.get("pin")
    if not display_name or not pin:
      return None, "Display name and PIN are required"
    if len(str(pin)) < 4:
      return None, "PIN must be at least 4 characters"

    user, error = self.auth_service.create_user(
      display_name,
      pin,
      is_admin=bool(data.get("is_admin", False)),
      active=bool(data.get("active", True)),
    )
    if error:
      return None, error
    return user.to_dict(include_admin=True), None

  def update_user(self, user_id, data):
    user, error = self.auth_service.update_user(user_id, data)
    if error:
      return None, error
    return user.to_dict(include_admin=True), None
