from app import db, bcrypt
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON, ARRAY
import jwt
from time import time
from flask import current_app

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='jobseeker', index=True)
    
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))
    bio = db.Column(db.Text)
    
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    job_seeker_profile = db.Column(JSON)
    employer_profile = db.Column(JSON)
    preferences = db.Column(JSON)
    
    is_active = db.Column(db.Boolean, default=True)
    is_email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(255))
    
    profile_views = db.Column(db.Integer, default=0)
    last_login = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    skills = db.relationship('UserSkill', back_populates='user', cascade='all, delete-orphan')
    jobs_posted = db.relationship('Job', back_populates='employer', foreign_keys='Job.employer_id')
    applications_submitted = db.relationship('Application', back_populates='applicant', 
                                            foreign_keys='Application.applicant_id')
    applications_received = db.relationship('Application', back_populates='employer',
                                           foreign_keys='Application.employer_id')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def generate_auth_token(self, expires_in=3600):
        return jwt.encode(
            {
                'user_id': self.id,
                'email': self.email,
                'role': self.role,
                'exp': time() + expires_in
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
    
    @staticmethod
    def verify_auth_token(token):
        try:
            data = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            return User.query.get(data['user_id'])
        except:
            return None
    
    def get_profile_completion(self):
        completed = 0
        total = 0
        
        basic_fields = [
            self.first_name, self.last_name, self.email, 
            self.phone, self.city, self.bio
        ]
        for field in basic_fields:
            total += 1
            if field:
                completed += 1
        
        if self.role == 'jobseeker' and self.job_seeker_profile:
            profile = self.job_seeker_profile
            jobseeker_fields = [
                profile.get('current_job_title'),
                profile.get('experience'),
                profile.get('resume_url'),
                profile.get('education'),
                profile.get('work_experience')
            ]
            for field in jobseeker_fields:
                total += 1
                if field:
                    completed += 1
            total += 1
            if len(self.skills) > 0:
                completed += 1
        elif self.role == 'employer' and self.employer_profile:
            profile = self.employer_profile
            employer_fields = [
                profile.get('company_name'),
                profile.get('industry'),
                profile.get('company_description'),
                profile.get('company_website')
            ]
            for field in employer_fields:
                total += 1
                if field:
                    completed += 1
        
        return round((completed / total) * 100) if total > 0 else 0
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'location': {
                'city': self.city,
                'state': self.state,
                'country': self.country,
                'zip_code': self.zip_code
            },
            'is_active': self.is_active,
            'is_email_verified': self.is_email_verified,
            'profile_completion': self.get_profile_completion(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if self.role == 'jobseeker':
            data['job_seeker_profile'] = self.job_seeker_profile or {}
            data['skills'] = [skill.to_dict() for skill in self.skills]
        elif self.role == 'employer':
            data['employer_profile'] = self.employer_profile or {}
        
        if include_sensitive:
            data['preferences'] = self.preferences
            data['last_login'] = self.last_login.isoformat() if self.last_login else None
        
        return data
    
    def __repr__(self):
        return f'<User {self.email}>'


class UserSkill(db.Model):
    __tablename__ = 'user_skills'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), nullable=False)
    
    proficiency_level = db.Column(db.Integer)
    years_of_experience = db.Column(db.Float)
    last_used = db.Column(db.Date)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', back_populates='skills')
    skill = db.relationship('Skill', back_populates='users')
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'skill_id', name='unique_user_skill'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'skill': self.skill.to_dict() if self.skill else None,
            'proficiency_level': self.proficiency_level,
            'years_of_experience': self.years_of_experience,
            'last_used': self.last_used.isoformat() if self.last_used else None
        }
    
    def __repr__(self):
        return f'<UserSkill user={self.user_id} skill={self.skill_id}>'
