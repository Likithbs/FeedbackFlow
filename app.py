from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
import bcrypt
import os
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

# Use persistent database path for Docker
db_path = os.environ.get('DATABASE_PATH', '/app/data/feedback.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'manager' or 'employee'
    team_id = db.Column(db.String(50), nullable=False)
    manager_id = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Team(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    manager_id = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    manager_id = db.Column(db.String(50), nullable=False)
    employee_id = db.Column(db.String(50), nullable=False)
    strengths = db.Column(db.Text, nullable=False)
    areas_to_improve = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), nullable=False)  # 'positive', 'neutral', 'negative'
    acknowledged = db.Column(db.Boolean, default=False)
    acknowledged_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Helper functions
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def user_to_dict(user):
    return {
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'role': user.role,
        'teamId': user.team_id,
        'managerId': user.manager_id
    }

def feedback_to_dict(feedback):
    return {
        'id': feedback.id,
        'managerId': feedback.manager_id,
        'employeeId': feedback.employee_id,
        'strengths': feedback.strengths,
        'areasToImprove': feedback.areas_to_improve,
        'sentiment': feedback.sentiment,
        'acknowledged': feedback.acknowledged,
        'acknowledgedAt': feedback.acknowledged_at.isoformat() if feedback.acknowledged_at else None,
        'createdAt': feedback.created_at.isoformat(),
        'updatedAt': feedback.updated_at.isoformat()
    }

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = generate_token(user.id)
    return jsonify({
        'token': token,
        'user': user_to_dict(user)
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': user_to_dict(current_user)})

@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user.role == 'manager':
        # Managers can see their team members
        team_members = User.query.filter_by(manager_id=current_user.id).all()
        return jsonify({'users': [user_to_dict(user) for user in team_members]})
    else:
        # Employees can only see themselves and their manager
        users = []
        users.append(user_to_dict(current_user))
        if current_user.manager_id:
            manager = User.query.get(current_user.manager_id)
            if manager:
                users.append(user_to_dict(manager))
        return jsonify({'users': users})

@app.route('/api/feedback', methods=['GET'])
@token_required
def get_feedback(current_user):
    if current_user.role == 'manager':
        # Managers can see feedback they've given
        feedback_list = Feedback.query.filter_by(manager_id=current_user.id).all()
    else:
        # Employees can see feedback they've received
        feedback_list = Feedback.query.filter_by(employee_id=current_user.id).all()
    
    return jsonify({'feedback': [feedback_to_dict(f) for f in feedback_list]})

@app.route('/api/feedback', methods=['POST'])
@token_required
def create_feedback(current_user):
    if current_user.role != 'manager':
        return jsonify({'message': 'Only managers can create feedback'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['employeeId', 'strengths', 'areasToImprove', 'sentiment']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400
    
    # Verify employee belongs to manager's team
    employee = User.query.get(data['employeeId'])
    if not employee or employee.manager_id != current_user.id:
        return jsonify({'message': 'Employee not found or not in your team'}), 404
    
    # Create feedback
    feedback = Feedback(
        id=f"fb{int(datetime.utcnow().timestamp() * 1000)}",
        manager_id=current_user.id,
        employee_id=data['employeeId'],
        strengths=data['strengths'],
        areas_to_improve=data['areasToImprove'],
        sentiment=data['sentiment']
    )
    
    db.session.add(feedback)
    db.session.commit()
    
    return jsonify({'feedback': feedback_to_dict(feedback)}), 201

@app.route('/api/feedback/<feedback_id>', methods=['PUT'])
@token_required
def update_feedback(current_user, feedback_id):
    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({'message': 'Feedback not found'}), 404
    
    if feedback.manager_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields if provided
    if 'strengths' in data:
        feedback.strengths = data['strengths']
    if 'areasToImprove' in data:
        feedback.areas_to_improve = data['areasToImprove']
    if 'sentiment' in data:
        feedback.sentiment = data['sentiment']
    
    feedback.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'feedback': feedback_to_dict(feedback)})

@app.route('/api/feedback/<feedback_id>/acknowledge', methods=['POST'])
@token_required
def acknowledge_feedback(current_user, feedback_id):
    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({'message': 'Feedback not found'}), 404
    
    if feedback.employee_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    feedback.acknowledged = True
    feedback.acknowledged_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'feedback': feedback_to_dict(feedback)})

@app.route('/api/teams', methods=['GET'])
@token_required
def get_teams(current_user):
    if current_user.role == 'manager':
        team = Team.query.get(current_user.team_id)
        return jsonify({'teams': [{'id': team.id, 'name': team.name, 'managerId': team.manager_id}] if team else []})
    else:
        return jsonify({'teams': []})

# Initialize database and create sample data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Check if data already exists
        if User.query.first():
            return
        
        # Create sample teams
        teams = [
            Team(id='team1', name='Engineering Team', manager_id='mgr1'),
            Team(id='team2', name='Design Team', manager_id='mgr2'),
            Team(id='team3', name='Marketing Team', manager_id='mgr3'),
            Team(id='team4', name='Sales Team', manager_id='mgr4'),
            Team(id='team5', name='Product Team', manager_id='mgr5')
        ]
        
        # Create sample users - Managers
        managers = [
            User(
                id='mgr1',
                email='sarah.manager@company.com',
                name='Sarah Johnson',
                password_hash=hash_password('password123'),
                role='manager',
                team_id='team1'
            ),
            User(
                id='mgr2',
                email='alex.manager@company.com',
                name='Alex Wilson',
                password_hash=hash_password('password123'),
                role='manager',
                team_id='team2'
            ),
            User(
                id='mgr3',
                email='maria.manager@company.com',
                name='Maria Rodriguez',
                password_hash=hash_password('password123'),
                role='manager',
                team_id='team3'
            ),
            User(
                id='mgr4',
                email='david.manager@company.com',
                name='David Chen',
                password_hash=hash_password('password123'),
                role='manager',
                team_id='team4'
            ),
            User(
                id='mgr5',
                email='jennifer.manager@company.com',
                name='Jennifer Taylor',
                password_hash=hash_password('password123'),
                role='manager',
                team_id='team5'
            )
        ]
        
        # Create sample users - Employees
        employees = [
            # Engineering Team (Sarah's team)
            User(
                id='emp1',
                email='john.smith@company.com',
                name='John Smith',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team1',
                manager_id='mgr1'
            ),
            User(
                id='emp2',
                email='emily.davis@company.com',
                name='Emily Davis',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team1',
                manager_id='mgr1'
            ),
            User(
                id='emp3',
                email='michael.brown@company.com',
                name='Michael Brown',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team1',
                manager_id='mgr1'
            ),
            User(
                id='emp4',
                email='rachel.green@company.com',
                name='Rachel Green',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team1',
                manager_id='mgr1'
            ),
            
            # Design Team (Alex's team)
            User(
                id='emp5',
                email='lisa.jones@company.com',
                name='Lisa Jones',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team2',
                manager_id='mgr2'
            ),
            User(
                id='emp6',
                email='tom.wilson@company.com',
                name='Tom Wilson',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team2',
                manager_id='mgr2'
            ),
            User(
                id='emp7',
                email='anna.lee@company.com',
                name='Anna Lee',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team2',
                manager_id='mgr2'
            ),
            
            # Marketing Team (Maria's team)
            User(
                id='emp8',
                email='james.miller@company.com',
                name='James Miller',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team3',
                manager_id='mgr3'
            ),
            User(
                id='emp9',
                email='sophie.clark@company.com',
                name='Sophie Clark',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team3',
                manager_id='mgr3'
            ),
            User(
                id='emp10',
                email='kevin.white@company.com',
                name='Kevin White',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team3',
                manager_id='mgr3'
            ),
            
            # Sales Team (David's team)
            User(
                id='emp11',
                email='natalie.adams@company.com',
                name='Natalie Adams',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team4',
                manager_id='mgr4'
            ),
            User(
                id='emp12',
                email='robert.garcia@company.com',
                name='Robert Garcia',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team4',
                manager_id='mgr4'
            ),
            
            # Product Team (Jennifer's team)
            User(
                id='emp13',
                email='olivia.martinez@company.com',
                name='Olivia Martinez',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team5',
                manager_id='mgr5'
            ),
            User(
                id='emp14',
                email='daniel.thompson@company.com',
                name='Daniel Thompson',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team5',
                manager_id='mgr5'
            ),
            User(
                id='emp15',
                email='grace.anderson@company.com',
                name='Grace Anderson',
                password_hash=hash_password('password123'),
                role='employee',
                team_id='team5',
                manager_id='mgr5'
            )
        ]
        
        # Create sample feedback
        feedback_items = [
            # Sarah's feedback to her engineering team
            Feedback(
                id='fb1',
                manager_id='mgr1',
                employee_id='emp1',
                strengths='Excellent problem-solving skills and always delivers high-quality code. Great team collaboration and willingness to help others.',
                areas_to_improve='Could benefit from improving time estimation for tasks and communicating blockers earlier.',
                sentiment='positive',
                acknowledged=True,
                acknowledged_at=datetime(2024, 1, 16, 9, 30),
                created_at=datetime(2024, 1, 15, 10, 0),
                updated_at=datetime(2024, 1, 15, 10, 0)
            ),
            Feedback(
                id='fb2',
                manager_id='mgr1',
                employee_id='emp2',
                strengths='Outstanding attention to detail and thorough testing. Excellent documentation skills.',
                areas_to_improve='Could be more proactive in suggesting process improvements and taking on leadership opportunities.',
                sentiment='positive',
                created_at=datetime(2024, 1, 10, 14, 30),
                updated_at=datetime(2024, 1, 10, 14, 30)
            ),
            Feedback(
                id='fb3',
                manager_id='mgr1',
                employee_id='emp3',
                strengths='Strong technical knowledge and quick learner. Good at asking the right questions.',
                areas_to_improve='Needs to work on confidence in presenting ideas and be more vocal in team discussions.',
                sentiment='neutral',
                acknowledged=True,
                acknowledged_at=datetime(2024, 1, 9, 8, 45),
                created_at=datetime(2024, 1, 8, 11, 15),
                updated_at=datetime(2024, 1, 8, 11, 15)
            ),
            Feedback(
                id='fb4',
                manager_id='mgr1',
                employee_id='emp4',
                strengths='Excellent communication skills and great at mentoring junior developers. Shows strong leadership potential.',
                areas_to_improve='Could focus more on code optimization and performance improvements.',
                sentiment='positive',
                created_at=datetime(2024, 1, 20, 16, 0),
                updated_at=datetime(2024, 1, 20, 16, 0)
            ),
            
            # Alex's feedback to design team
            Feedback(
                id='fb5',
                manager_id='mgr2',
                employee_id='emp5',
                strengths='Creative problem solver with excellent design intuition. Great at user research and understanding customer needs.',
                areas_to_improve='Could improve on meeting deadlines and better time management for multiple projects.',
                sentiment='positive',
                created_at=datetime(2024, 1, 18, 11, 0),
                updated_at=datetime(2024, 1, 18, 11, 0)
            ),
            Feedback(
                id='fb6',
                manager_id='mgr2',
                employee_id='emp6',
                strengths='Exceptional visual design skills and attention to brand consistency. Works well with development team.',
                areas_to_improve='Could benefit from learning more about accessibility standards and inclusive design.',
                sentiment='positive',
                acknowledged=True,
                acknowledged_at=datetime(2024, 1, 19, 14, 20),
                created_at=datetime(2024, 1, 17, 9, 30),
                updated_at=datetime(2024, 1, 17, 9, 30)
            ),
            
            # Maria's feedback to marketing team
            Feedback(
                id='fb7',
                manager_id='mgr3',
                employee_id='emp8',
                strengths='Great analytical skills and data-driven approach to campaigns. Excellent at A/B testing and optimization.',
                areas_to_improve='Could work on creative storytelling and emotional connection in campaigns.',
                sentiment='positive',
                created_at=datetime(2024, 1, 22, 15, 45),
                updated_at=datetime(2024, 1, 22, 15, 45)
            ),
            
            # David's feedback to sales team
            Feedback(
                id='fb8',
                manager_id='mgr4',
                employee_id='emp11',
                strengths='Outstanding relationship building skills and consistently exceeds targets. Great at understanding client needs.',
                areas_to_improve='Could improve on CRM data entry and follow-up documentation.',
                sentiment='positive',
                acknowledged=True,
                acknowledged_at=datetime(2024, 1, 21, 10, 15),
                created_at=datetime(2024, 1, 19, 13, 20),
                updated_at=datetime(2024, 1, 19, 13, 20)
            ),
            
            # Jennifer's feedback to product team
            Feedback(
                id='fb9',
                manager_id='mgr5',
                employee_id='emp13',
                strengths='Excellent strategic thinking and roadmap planning. Great at stakeholder communication and requirement gathering.',
                areas_to_improve='Could benefit from more hands-on technical knowledge to better communicate with engineering.',
                sentiment='positive',
                created_at=datetime(2024, 1, 23, 10, 30),
                updated_at=datetime(2024, 1, 23, 10, 30)
            )
        ]
        
        # Add all data to database
        for team in teams:
            db.session.add(team)
        for manager in managers:
            db.session.add(manager)
        for employee in employees:
            db.session.add(employee)
        for feedback in feedback_items:
            db.session.add(feedback)
        
        db.session.commit()
        print("Database initialized with multi-team sample data")

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=os.environ.get('FLASK_ENV') != 'production', host='0.0.0.0', port=port)