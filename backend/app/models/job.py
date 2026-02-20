from app import db
from datetime import datetime

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    employer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    company_name = db.Column(db.String(200), nullable=False)
    
    job_type = db.Column(db.String(50), nullable=False)
    work_mode = db.Column(db.String(50), default='onsite')
    experience_level = db.Column(db.String(50), nullable=False, index=True)
    industry = db.Column(db.String(100), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    allows_remote = db.Column(db.Boolean, default=False)
    
    salary_min = db.Column(db.Integer)
    salary_max = db.Column(db.Integer)
    salary_currency = db.Column(db.String(10), default='USD')
    salary_period = db.Column(db.String(20), default='year')
    show_salary = db.Column(db.Boolean, default=True)
    
    benefits = db.Column(db.JSON)  # Changed from ARRAY to JSON
    requirements = db.Column(db.JSON)
    responsibilities = db.Column(db.JSON)  # Changed from ARRAY to JSON
    
    application_deadline = db.Column(db.DateTime)
    start_date = db.Column(db.Date)
    number_of_openings = db.Column(db.Integer, default=1)
    
    screening_questions = db.Column(db.JSON)
    
    status = db.Column(db.String(20), default='draft', index=True)
    visibility = db.Column(db.String(20), default='public')
    featured = db.Column(db.Boolean, default=False)
    urgent = db.Column(db.Boolean, default=False)
    
    views = db.Column(db.Integer, default=0)
    applications_count = db.Column(db.Integer, default=0)
    
    matching_criteria = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime, index=True)
    closed_at = db.Column(db.DateTime)
    
    employer = db.relationship('User', back_populates='jobs_posted', foreign_keys=[employer_id])
    required_skills = db.relationship('JobSkill', back_populates='job', cascade='all, delete-orphan')
    applications = db.relationship('Application', back_populates='job', cascade='all, delete-orphan')
    
    def increment_views(self):
        self.views += 1
        db.session.commit()
    
    def is_open(self):
        if self.status != 'active':
            return False
        if self.application_deadline and self.application_deadline < datetime.utcnow():
            return False
        return True
    
    def days_since_posted(self):
        if not self.published_at:
            return None
        delta = datetime.utcnow() - self.published_at
        return delta.days
    
    def days_until_deadline(self):
        if not self.application_deadline:
            return None
        delta = self.application_deadline - datetime.utcnow()
        return max(0, delta.days)
    
    def to_dict(self, include_employer=True, include_skills=True):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'company_name': self.company_name,
            'job_type': self.job_type,
            'work_mode': self.work_mode,
            'experience_level': self.experience_level,
            'industry': self.industry,
            'category': self.category,
            'location': {
                'city': self.city,
                'state': self.state,
                'country': self.country,
                'allows_remote': self.allows_remote
            },
            'salary': {
                'min': self.salary_min,
                'max': self.salary_max,
                'currency': self.salary_currency,
                'period': self.salary_period,
                'show': self.show_salary
            } if self.show_salary else None,
            'benefits': self.benefits or [],
            'requirements': self.requirements or {},
            'responsibilities': self.responsibilities or [],
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'number_of_openings': self.number_of_openings,
            'status': self.status,
            'visibility': self.visibility,
            'featured': self.featured,
            'urgent': self.urgent,
            'views': self.views,
            'applications_count': self.applications_count,
            'is_open': self.is_open(),
            'days_since_posted': self.days_since_posted(),
            'days_until_deadline': self.days_until_deadline(),
            'created_at': self.created_at.isoformat(),
            'published_at': self.published_at.isoformat() if self.published_at else None
        }
        
        if include_employer and self.employer:
            data['employer'] = {
                'id': self.employer.id,
                'name': self.employer.full_name,
                'company': self.employer.employer_profile.get('company_name') if self.employer.employer_profile else None,
                'logo': self.employer.employer_profile.get('company_logo') if self.employer.employer_profile else None
            }
        
        if include_skills:
            data['required_skills'] = [js.to_dict() for js in self.required_skills]
        
        return data
    
    def __repr__(self):
        return f'<Job {self.title}>'


class JobSkill(db.Model):
    __tablename__ = 'job_skills'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), nullable=False)
    
    required = db.Column(db.Boolean, default=True)
    proficiency_level = db.Column(db.Integer)
    weight = db.Column(db.Integer, default=5)
    
    job = db.relationship('Job', back_populates='required_skills')
    skill = db.relationship('Skill', back_populates='jobs')
    
    __table_args__ = (
        db.UniqueConstraint('job_id', 'skill_id', name='unique_job_skill'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'skill': self.skill.to_dict() if self.skill else None,
            'required': self.required,
            'proficiency_level': self.proficiency_level,
            'weight': self.weight
        }
    
    def __repr__(self):
        return f'<JobSkill job={self.job_id} skill={self.skill_id}>'


class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False, index=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    employer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    cover_letter = db.Column(db.Text)
    resume_url = db.Column(db.String(255))
    screening_answers = db.Column(db.JSON)
    
    status = db.Column(db.String(50), default='submitted', index=True)
    status_history = db.Column(db.JSON)
    
    ai_match_score = db.Column(db.Float, index=True)
    ai_analysis = db.Column(db.JSON)
    
    interviews = db.Column(db.JSON)
    employer_notes = db.Column(db.JSON)
    employer_rating = db.Column(db.Float)
    
    is_viewed = db.Column(db.Boolean, default=False)
    viewed_at = db.Column(db.DateTime)
    is_favorite = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    job = db.relationship('Job', back_populates='applications')
    applicant = db.relationship('User', back_populates='applications_submitted', 
                                foreign_keys=[applicant_id])
    employer = db.relationship('User', back_populates='applications_received',
                              foreign_keys=[employer_id])
    
    __table_args__ = (
        db.UniqueConstraint('job_id', 'applicant_id', name='unique_job_application'),
    )
    
    def days_since_application(self):
        delta = datetime.utcnow() - self.created_at
        return delta.days
    
    def update_status(self, new_status, changed_by_id, notes=''):
        if not self.status_history:
            self.status_history = []
        
        self.status_history.append({
            'status': new_status,
            'changed_at': datetime.utcnow().isoformat(),
            'changed_by': changed_by_id,
            'notes': notes
        })
        
        self.status = new_status
        
        if new_status != 'submitted' and not self.is_viewed:
            self.is_viewed = True
            self.viewed_at = datetime.utcnow()
    
    def to_dict(self, include_job=True, include_applicant=True):
        data = {
            'id': self.id,
            'cover_letter': self.cover_letter,
            'resume_url': self.resume_url,
            'status': self.status,
            'ai_match_score': self.ai_match_score,
            'ai_analysis': self.ai_analysis,
            'is_viewed': self.is_viewed,
            'is_favorite': self.is_favorite,
            'days_since_application': self.days_since_application(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_job and self.job:
            data['job'] = self.job.to_dict(include_employer=False, include_skills=False)
        
        if include_applicant and self.applicant:
            data['applicant'] = {
                'id': self.applicant.id,
                'name': self.applicant.full_name,
                'email': self.applicant.email,
                'profile_picture': self.applicant.profile_picture,
                'current_title': self.applicant.job_seeker_profile.get('current_job_title') 
                                if self.applicant.job_seeker_profile else None
            }
        
        return data
    
    def __repr__(self):
        return f'<Application job={self.job_id} applicant={self.applicant_id}>'
