from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON, ARRAY

class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    category = db.Column(db.String(50), nullable=False, index=True)
    sub_category = db.Column(db.String(50))
    synonyms = db.Column(db.JSON)
    
    is_verified = db.Column(db.Boolean, default=False)
    is_popular = db.Column(db.Boolean, default=False, index=True)
    trending_score = db.Column(db.Integer, default=0, index=True)
    
    job_count = db.Column(db.Integer, default=0, index=True)
    user_count = db.Column(db.Integer, default=0)
    
    icon_url = db.Column(db.String(255))
    official_website = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    users = db.relationship('UserSkill', back_populates='skill', cascade='all, delete-orphan')
    jobs = db.relationship('JobSkill', back_populates='skill', cascade='all, delete-orphan')
    trainings = db.relationship('TrainingSkill', back_populates='skill')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'display_name': self.display_name,
            'description': self.description,
            'category': self.category,
            'sub_category': self.sub_category,
            'is_popular': self.is_popular,
            'trending_score': self.trending_score,
            'job_count': self.job_count,
            'user_count': self.user_count,
            'icon_url': self.icon_url
        }
    
    def __repr__(self):
        return f'<Skill {self.display_name}>'


class Training(db.Model):
    __tablename__ = 'trainings'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    
    provider_name = db.Column(db.String(100), nullable=False)
    provider_website = db.Column(db.String(255))
    provider_verified = db.Column(db.Boolean, default=False)
    
    type = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    difficulty = db.Column(db.String(20), nullable=False, index=True)
    
    duration_value = db.Column(db.Integer)
    duration_unit = db.Column(db.String(20))
    total_hours = db.Column(db.Integer)
    
    format = db.Column(db.String(50), default='self-paced')
    languages = db.Column(db.JSON)
    
    pricing_type = db.Column(db.String(20), nullable=False, index=True)
    price_amount = db.Column(db.Float)
    price_currency = db.Column(db.String(10), default='USD')
    
    learning_outcomes = db.Column(db.JSON)
    
    offers_certificate = db.Column(db.Boolean, default=False)
    certificate_type = db.Column(db.String(50))
    
    enrollment_url = db.Column(db.String(500), nullable=False)
    enrollment_count = db.Column(db.Integer, default=0)
    
    average_rating = db.Column(db.Float, default=0.0, index=True)
    rating_count = db.Column(db.Integer, default=0)
    
    thumbnail_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active', index=True)
    featured = db.Column(db.Boolean, default=False)
    
    views = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    skills = db.relationship('TrainingSkill', back_populates='training', cascade='all, delete-orphan')
    
    def to_dict(self, include_skills=True):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'provider': {
                'name': self.provider_name,
                'website': self.provider_website,
                'verified': self.provider_verified
            },
            'type': self.type,
            'category': self.category,
            'difficulty': self.difficulty,
            'duration': {
                'value': self.duration_value,
                'unit': self.duration_unit,
                'total_hours': self.total_hours
            },
            'format': self.format,
            'languages': self.languages or [],
            'pricing': {
                'type': self.pricing_type,
                'amount': self.price_amount,
                'currency': self.price_currency
            },
            'learning_outcomes': self.learning_outcomes or [],
            'certificate': {
                'offered': self.offers_certificate,
                'type': self.certificate_type
            },
            'enrollment_url': self.enrollment_url,
            'rating': {
                'average': self.average_rating,
                'count': self.rating_count
            },
            'thumbnail_url': self.thumbnail_url,
            'status': self.status,
            'featured': self.featured
        }
        
        if include_skills:
            data['skills'] = [ts.skill.to_dict() for ts in self.skills if ts.skill]
        
        return data
    
    def __repr__(self):
        return f'<Training {self.title}>'


class TrainingSkill(db.Model):
    __tablename__ = 'training_skills'
    
    id = db.Column(db.Integer, primary_key=True)
    training_id = db.Column(db.Integer, db.ForeignKey('trainings.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), nullable=False)
    
    training = db.relationship('Training', back_populates='skills')
    skill = db.relationship('Skill', back_populates='trainings')
    
    __table_args__ = (
        db.UniqueConstraint('training_id', 'skill_id', name='unique_training_skill'),
    )
