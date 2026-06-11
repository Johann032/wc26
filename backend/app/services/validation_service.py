import re

from app.models.prediction_question import QUESTION_TYPES


class ValidationError(Exception):
  def __init__(self, message):
    self.message = message
    super().__init__(message)


class ValidationService:
  @staticmethod
  def validate_answer(question, answer):
    if answer is None or str(answer).strip() == "":
      raise ValidationError("Answer is required")

    answer = str(answer).strip()
    qtype = question.question_type

    if qtype not in QUESTION_TYPES:
      raise ValidationError(f"Unknown question type: {qtype}")

    if qtype == "winner":
      return ValidationService._validate_choice(answer, question)
    if qtype == "exact_score":
      return ValidationService._validate_exact_score(answer)
    if qtype == "multiple_choice":
      return ValidationService._validate_choice(answer, question)
    if qtype == "yes_no":
      return ValidationService._validate_yes_no(answer)
    if qtype == "number":
      return ValidationService._validate_number(answer)

    return answer

  @staticmethod
  def validate_choices_for_type(question_type, options_json):
    if question_type not in ("winner", "multiple_choice"):
      return None
    choices = (options_json or {}).get("choices", [])
    if not choices or not any(str(c).strip() for c in choices):
      return "At least one choice is required for this question type"
    return None

  @staticmethod
  def _validate_choice(answer, question):
    choices = (question.options_json or {}).get("choices", [])
    if not choices:
      raise ValidationError("Question has no configured choices")
    normalized = {c.strip().lower(): c for c in choices}
    if answer.lower() not in normalized:
      raise ValidationError(f"Answer must be one of: {', '.join(choices)}")
    return normalized[answer.lower()]

  @staticmethod
  def _validate_exact_score(answer):
    if not re.match(r"^\d+\s*[-:]\s*\d+$", answer):
      raise ValidationError("Exact score must be in format e.g. 2-1 or 2:1")
    parts = re.split(r"[-:]", answer)
    return f"{int(parts[0].strip())}-{int(parts[1].strip())}"

  @staticmethod
  def _validate_yes_no(answer):
    normalized = answer.strip().lower()
    if normalized in ("yes", "y"):
      return "Yes"
    if normalized in ("no", "n"):
      return "No"
    raise ValidationError("Answer must be Yes or No")

  @staticmethod
  def _validate_number(answer):
    try:
      value = int(answer)
    except ValueError:
      raise ValidationError("Answer must be a whole number")
    if value < 0:
      raise ValidationError("Answer must be zero or positive")
    return str(value)

  @staticmethod
  def validate_correct_answer(question, answer):
    if answer is None or str(answer).strip() == "":
      raise ValidationError("Correct answer is required")
    return ValidationService.validate_answer(question, answer)
