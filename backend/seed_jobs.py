from app import create_app, db
from app.models import Job, User, Skill, JobSkill
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Find an employer user (or create one)
    employer = User.query.filter_by(role='employer').first()
    
    if not employer:
        print("Creating employer user...")
        employer = User(
            email='employer@techcorp.com',
            first_name='Tech',
            last_name='Corp',
            role='employer',
            is_active=True,
            is_email_verified=True
        )
        employer.set_password('password123')
        employer.employer_profile = {
            'company_name': 'Tech Corp',
            'industry': 'Technology',
            'company_size': '201-500',
            'company_description': 'Leading technology company'
        }
        db.session.add(employer)
        db.session.commit()
    
    # Create sample jobs
    jobs_data = [
        {
            'title': 'Senior Full Stack Developer',
            'description': 'We are looking for an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using React, Node.js, and modern technologies.',
            'company_name': 'Tech Corp',
            'job_type': 'full-time',
            'work_mode': 'hybrid',
            'experience_level': 'senior',
            'industry': 'Technology',
            'category': 'Software Development',
            'city': 'San Francisco',
            'state': 'California',
            'country': 'United States',
            'allows_remote': True,
            'salary_min': 120000,
            'salary_max': 160000,
            'salary_currency': 'USD',
            'salary_period': 'year',
            'show_salary': True,
            'benefits': ['Health Insurance', '401k', 'Unlimited PTO', 'Remote Work', 'Stock Options'],
            'responsibilities': [
                'Design and develop scalable web applications',
                'Collaborate with cross-functional teams',
                'Write clean, maintainable code',
                'Mentor junior developers'
            ],
            'requirements': {
                'education': {'level': 'bachelor', 'required': False},
                'experience': {'min': 5, 'max': 10},
                'other': ['Strong problem-solving skills', 'Excellent communication']
            },
            'number_of_openings': 2,
            'status': 'active',
            'visibility': 'public',
            'featured': True,
            'urgent': False,
        },
        {
            'title': 'Frontend Developer',
            'description': 'Join our team as a Frontend Developer! You will create beautiful, responsive user interfaces using React and modern CSS frameworks.',
            'company_name': 'Design Studio',
            'job_type': 'full-time',
            'work_mode': 'remote',
            'experience_level': 'mid',
            'industry': 'Technology',
            'category': 'Frontend Development',
            'city': 'Austin',
            'state': 'Texas',
            'country': 'United States',
            'allows_remote': True,
            'salary_min': 80000,
            'salary_max': 110000,
            'salary_currency': 'USD',
            'salary_period': 'year',
            'show_salary': True,
            'benefits': ['Health Insurance', 'Remote Work', 'Flexible Hours', 'Learning Budget'],
            'responsibilities': [
                'Build responsive web applications',
                'Implement pixel-perfect designs',
                'Optimize application performance',
                'Collaborate with designers'
            ],
            'requirements': {
                'education': {'level': 'associate', 'required': False},
                'experience': {'min': 3, 'max': 5}
            },
            'number_of_openings': 1,
            'status': 'active',
            'visibility': 'public',
            'featured': False,
            'urgent': True,
        },
        {
            'title': 'Data Scientist',
            'description': 'We are seeking a talented Data Scientist to analyze complex datasets and build predictive models that drive business decisions.',
            'company_name': 'Analytics Pro',
            'job_type': 'full-time',
            'work_mode': 'onsite',
            'experience_level': 'senior',
            'industry': 'Technology',
            'category': 'Data Science',
            'city': 'New York',
            'state': 'New York',
            'country': 'United States',
            'allows_remote': False,
            'salary_min': 130000,
            'salary_max': 170000,
            'salary_currency': 'USD',
            'salary_period': 'year',
            'show_salary': True,
            'benefits': ['Health Insurance', '401k', 'Gym Membership', 'Commuter Benefits'],
            'responsibilities': [
                'Build and deploy machine learning models',
                'Analyze large datasets',
                'Present findings to stakeholders',
                'Collaborate with engineering teams'
            ],
            'requirements': {
                'education': {'level': 'master', 'required': True},
                'experience': {'min': 4, 'max': 8}
            },
            'number_of_openings': 1,
            'status': 'active',
            'visibility': 'public',
            'featured': True,
            'urgent': False,
        },
        {
            'title': 'Junior Backend Developer',
            'description': 'Great opportunity for early-career developers! Learn and grow with our experienced team while building scalable backend systems.',
            'company_name': 'StartUp XYZ',
            'job_type': 'full-time',
            'work_mode': 'hybrid',
            'experience_level': 'entry',
            'industry': 'Technology',
            'category': 'Backend Development',
            'city': 'Seattle',
            'state': 'Washington',
            'country': 'United States',
            'allows_remote': True,
            'salary_min': 70000,
            'salary_max': 90000,
            'salary_currency': 'USD',
            'salary_period': 'year',
            'show_salary': True,
            'benefits': ['Health Insurance', 'Learning Budget', 'Flexible Hours'],
            'responsibilities': [
                'Develop RESTful APIs',
                'Write unit tests',
                'Debug and fix issues',
                'Learn from senior developers'
            ],
            'requirements': {
                'education': {'level': 'bachelor', 'required': False},
                'experience': {'min': 0, 'max': 2}
            },
            'number_of_openings': 3,
            'status': 'active',
            'visibility': 'public',
            'featured': False,
            'urgent': False,
        },
        {
            'title': 'DevOps Engineer',
            'description': 'Join our infrastructure team as a DevOps Engineer. Work with Kubernetes, AWS, and modern CI/CD pipelines.',
            'company_name': 'Cloud Solutions Inc',
            'job_type': 'full-time',
            'work_mode': 'remote',
            'experience_level': 'mid',
            'industry': 'Technology',
            'category': 'DevOps',
            'city': 'Remote',
            'state': '',
            'country': 'United States',
            'allows_remote': True,
            'salary_min': 100000,
            'salary_max': 140000,
            'salary_currency': 'USD',
            'salary_period': 'year',
            'show_salary': True,
            'benefits': ['Health Insurance', '401k', 'Remote Work', 'Home Office Budget'],
            'responsibilities': [
                'Manage cloud infrastructure',
                'Build CI/CD pipelines',
                'Monitor system performance',
                'Implement security best practices'
            ],
            'requirements': {
                'education': {'level': 'bachelor', 'required': False},
                'experience': {'min': 3, 'max': 6}
            },
            'number_of_openings': 2,
            'status': 'active',
            'visibility': 'public',
            'featured': False,
            'urgent': True,
        },
        {
            'title': 'UI/UX Designer',
            'description': 'Creative UI/UX Designer wanted! Design beautiful, intuitive interfaces for web and mobile applications.',
            'company_name': 'Creative Agency',
            'job_type': 'full-time',
            'work_mode': 'hybrid',
            'experience_level': 'mid',
            'industry': 'Technology',
            'category': 'Design',
            'city': 'Los Angeles',
            'state': 'California',
            'country': 'United States',
            'allows_remote': True,
            'salary_min': 85000,
            'salary_max': 115000,
            'salary_currency': 'USD',
            'salary_period': 'year',
            'show_salary': True,
            'benefits': ['Health Insurance', 'Creative Tools Budget', 'Flexible Hours', 'Remote Work'],
            'responsibilities': [
                'Create wireframes and prototypes',
                'Conduct user research',
                'Design user interfaces',
                'Collaborate with developers'
            ],
            'requirements': {
                'education': {'level': 'bachelor', 'required': False},
                'experience': {'min': 2, 'max': 5}
            },
            'number_of_openings': 1,
            'status': 'active',
            'visibility': 'public',
            'featured': False,
            'urgent': False,
        },
    ]
    
    print("Creating sample jobs...")
    for job_data in jobs_data:
        # Check if job already exists
        existing = Job.query.filter_by(
            title=job_data['title'],
            company_name=job_data['company_name']
        ).first()
        
        if existing:
            print(f"Job '{job_data['title']}' already exists, skipping...")
            continue
        
        job = Job(
            employer_id=employer.id,
            published_at=datetime.utcnow(),
            **job_data
        )
        db.session.add(job)
        print(f"✓ Created: {job_data['title']} at {job_data['company_name']}")
    
    db.session.commit()
    print(f"\n✅ Successfully created {len(jobs_data)} jobs!")
    print("\nYou can now browse these jobs in the frontend!")
