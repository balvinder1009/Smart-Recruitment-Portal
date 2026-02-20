from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Job, User

bp = Blueprint('jobs', __name__)

@bp.route('', methods=['GET'])  # Changed from '/' to ''
def get_jobs():
    """Get all jobs with optional filters"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        job_type = request.args.get('job_type', '')
        work_mode = request.args.get('work_mode', '')
        experience_level = request.args.get('experience_level', '')
        city = request.args.get('city', '')
        
        # Build query
        query = Job.query.filter_by(status='active', visibility='public')
        
        # Apply filters
        if search:
            query = query.filter(
                (Job.title.ilike(f'%{search}%')) | 
                (Job.company_name.ilike(f'%{search}%')) |
                (Job.description.ilike(f'%{search}%'))
            )
        
        if job_type:
            query = query.filter_by(job_type=job_type)
        
        if work_mode:
            query = query.filter_by(work_mode=work_mode)
        
        if experience_level:
            query = query.filter_by(experience_level=experience_level)
        
        if city:
            query = query.filter(Job.city.ilike(f'%{city}%'))
        
        # Order by featured first, then by date
        query = query.order_by(Job.featured.desc(), Job.published_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        jobs = [job.to_dict() for job in pagination.items]
        
        return jsonify({
            'jobs': jobs,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['GET'])
def get_job(id):
    """Get a single job by ID"""
    try:
        job = Job.query.get(id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Increment view count
        job.increment_views()
        
        return jsonify(job.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])  # Changed from '/' to ''
@jwt_required()
def create_job():
    """Create a new job (employer only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'employer':
            return jsonify({'error': 'Only employers can create jobs'}), 403
        
        data = request.get_json()
        
        # Create job
        job = Job(
            employer_id=user_id,
            title=data.get('title'),
            description=data.get('description'),
            company_name=user.employer_profile.get('company_name', ''),
            job_type=data.get('job_type'),
            work_mode=data.get('work_mode', 'onsite'),
            experience_level=data.get('experience_level'),
            industry=data.get('industry'),
            category=data.get('category'),
            city=data.get('city'),
            state=data.get('state'),
            country=data.get('country'),
            allows_remote=data.get('allows_remote', False),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            salary_currency=data.get('salary_currency', 'USD'),
            salary_period=data.get('salary_period', 'year'),
            show_salary=data.get('show_salary', True),
            benefits=data.get('benefits', []),
            responsibilities=data.get('responsibilities', []),
            requirements=data.get('requirements', {}),
            number_of_openings=data.get('number_of_openings', 1),
            status=data.get('status', 'draft'),
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job': job.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
