from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Job, User, Skill, UserSkill
from sqlalchemy import func

bp = Blueprint('ai', __name__)

@bp.route('/match-jobs', methods=['GET'])
@jwt_required()
def match_jobs():
    """Get AI-powered job recommendations based on user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's skills
        user_skills = UserSkill.query.filter_by(user_id=user_id).all()
        user_skill_names = [us.skill.name for us in user_skills if us.skill]
        
        # Get user's experience level from profile
        user_experience = 0
        if user.job_seeker_profile and 'experience' in user.job_seeker_profile:
            user_experience = user.job_seeker_profile.get('experience', 0)
        
        # Determine experience level category
        if user_experience < 2:
            experience_levels = ['entry', 'junior']
        elif user_experience < 5:
            experience_levels = ['junior', 'mid']
        elif user_experience < 8:
            experience_levels = ['mid', 'senior']
        else:
            experience_levels = ['senior', 'lead']
        
        # Get all active jobs
        all_jobs = Job.query.filter_by(status='active', visibility='public').all()
        
        # Calculate match score for each job
        job_matches = []
        for job in all_jobs:
            match_score = calculate_match_score(
                job, 
                user_skill_names, 
                experience_levels,
                user
            )
            
            if match_score > 0:
                job_matches.append({
                    'job': job.to_dict(),
                    'match_score': match_score,
                    'match_reasons': get_match_reasons(job, user_skill_names, user)
                })
        
        # Sort by match score
        job_matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Get top 10 matches
        top_matches = job_matches[:10]
        
        return jsonify({
            'matches': top_matches,
            'total': len(job_matches),
            'user_skills': user_skill_names,
            'user_experience': user_experience
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_match_score(job, user_skills, experience_levels, user):
    """Calculate match score (0-100) for a job"""
    score = 0
    
    # Experience level match (30 points)
    if job.experience_level in experience_levels:
        score += 30
    
    # Skills match (50 points)
    if job.required_skills:
        job_skill_names = [js.skill.name for js in job.required_skills if js.skill]
        
        if job_skill_names:
            matching_skills = set(user_skills) & set(job_skill_names)
            skill_match_ratio = len(matching_skills) / len(job_skill_names)
            score += int(skill_match_ratio * 50)
    
    # Location match (10 points)
    if user.city and job.city:
        if user.city.lower() == job.city.lower():
            score += 10
    
    # Remote work preference (10 points)
    if job.allows_remote or job.work_mode == 'remote':
        score += 10
    
    return min(score, 100)

def get_match_reasons(job, user_skills, user):
    """Get reasons why this job matches the user"""
    reasons = []
    
    # Skills match
    if job.required_skills:
        job_skill_names = [js.skill.name for js in job.required_skills if js.skill]
        matching_skills = set(user_skills) & set(job_skill_names)
        
        if matching_skills:
            skills_str = ', '.join(list(matching_skills)[:3])
            if len(matching_skills) > 3:
                skills_str += f' and {len(matching_skills) - 3} more'
            reasons.append(f"Matches your skills: {skills_str}")
    
    # Location match
    if user.city and job.city:
        if user.city.lower() == job.city.lower():
            reasons.append(f"Located in your city: {job.city}")
    
    # Remote work
    if job.allows_remote or job.work_mode == 'remote':
        reasons.append("Offers remote work")
    
    # Salary match
    if user.job_seeker_profile and 'expected_salary' in user.job_seeker_profile:
        expected_salary = user.job_seeker_profile['expected_salary']
        if expected_salary and 'min' in expected_salary:
            if job.salary_min and job.salary_min >= expected_salary['min']:
                reasons.append("Salary meets your expectations")
    
    return reasons

@bp.route('/skill-gap', methods=['GET'])
@jwt_required()
def skill_gap_analysis():
    """Analyze skill gaps for recommended jobs"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's skills
        user_skills = UserSkill.query.filter_by(user_id=user_id).all()
        user_skill_names = [us.skill.name for us in user_skills if us.skill]
        
        # Get all active jobs
        all_jobs = Job.query.filter_by(status='active', visibility='public').limit(20).all()
        
        # Find all skills mentioned in jobs
        job_skills = {}
        for job in all_jobs:
            if job.required_skills:
                for js in job.required_skills:
                    if js.skill:
                        skill_name = js.skill.name
                        if skill_name not in user_skill_names:
                            if skill_name not in job_skills:
                                job_skills[skill_name] = {
                                    'name': js.skill.display_name or skill_name,
                                    'count': 0,
                                    'jobs': []
                                }
                            job_skills[skill_name]['count'] += 1
                            job_skills[skill_name]['jobs'].append(job.title)
        
        # Sort by frequency
        skill_gaps = sorted(
            job_skills.values(),
            key=lambda x: x['count'],
            reverse=True
        )[:10]
        
        return jsonify({
            'skill_gaps': skill_gaps,
            'current_skills': user_skill_names,
            'total_gaps': len(skill_gaps)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
