import re
import bleach


def validate_uuid(uuid_string: str) -> bool:
    """Validate UUID format"""
    uuid_pattern = re.compile(
        r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_pattern.match(uuid_string))


def sanitize_html(text: str) -> str:
    """Remove all HTML tags from text"""
    return bleach.clean(text, tags=[], strip=True)


def validate_rating(rating: str) -> bool:
    """Validate rating value"""
    return rating in ['up', 'down']


def validate_pagination(page: int, per_page: int) -> tuple:
    """Validate and normalize pagination parameters"""
    page = max(1, page)
    per_page = max(1, min(100, per_page))
    return page, per_page
