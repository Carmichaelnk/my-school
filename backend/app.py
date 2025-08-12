"""
MySchool Flask Application Entry Point
"""

import os
from app import create_app, db
from app.models.user import User
from app.models.school import School

# Create Flask application
app = create_app()

@app.shell_context_processor
def make_shell_context():
    """Make database models available in Flask shell"""
    return {
        'db': db,
        'User': User,
        'School': School
    }

if __name__ == '__main__':
    # Run the application
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
