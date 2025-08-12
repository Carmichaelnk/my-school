"""
Validation utilities for MySchool application
"""

import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False
    return True

def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?[\d\s\-\(\)]{10,}$'
    return re.match(pattern, phone) is not None

def validate_student_email(email):
    """Validate student institutional email format"""
    if not validate_email(email):
        return False, "Invalid email format"
    
    # Define allowed student email domains
    allowed_student_domains = [
        '@students.kcau.ac.ke',
        '@student.kcau.ac.ke',
        # Add more institutional domains as needed
    ]
    
    # Check if email ends with any allowed student domain
    for domain in allowed_student_domains:
        if email.lower().endswith(domain.lower()):
            return True, "Valid student email"
    
    return False, f"Email must be from an institutional domain (e.g., @students.kcau.ac.ke)"

def validate_lecturer_email(email):
    """Validate lecturer institutional email format"""
    if not validate_email(email):
        return False, "Invalid email format"
    
    # Define allowed lecturer email domains
    allowed_lecturer_domains = [
        '@kcau.ac.ke',
        '@staff.kcau.ac.ke',
        '@faculty.kcau.ac.ke',
        # Add more lecturer domains as needed
    ]
    
    # Check if email ends with any allowed lecturer domain
    for domain in allowed_lecturer_domains:
        if email.lower().endswith(domain.lower()):
            return True, "Valid lecturer email"
    
    return False, f"Email must be from an institutional domain (e.g., @kcau.ac.ke)"

def validate_institutional_email(email, user_role='student'):
    """Validate institutional email based on user role"""
    if user_role.lower() == 'student':
        return validate_student_email(email)
    elif user_role.lower() == 'lecturer':
        return validate_lecturer_email(email)
    else:
        return False, "Invalid user role specified"
