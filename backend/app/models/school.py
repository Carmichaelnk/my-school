"""
School model for MySchool application
"""

from datetime import datetime
from app import db

class School(db.Model):
    """School model for managing educational institutions"""
    
    __tablename__ = 'schools'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    
    # Contact information
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(255))
    
    # Address information
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    
    # School settings
    logo = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='school', lazy='dynamic')
    
    def __repr__(self):
        return f'<School {self.name}>'
    
    def to_dict(self):
        """Convert school object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'logo': self.logo,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def find_by_code(code):
        """Find school by code"""
        return School.query.filter_by(code=code).first()
