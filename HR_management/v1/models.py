from flask_sqlalchemy import SQLAlchemy
from HR_management import app

app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:root@localhost/hr_management_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Emp(db.Model):
    __tablename__ = 'employee'
    emp_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    emp_name = db.Column(db.String(100), nullable=False)
    emp_email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    experience = db.Column(db.String(100), nullable=False)
    skills = db.Column(db.String(100), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    manager_id = db.Column(db.Integer, nullable=False)


class Manager(db.Model):
    __tablename__ = 'manager'
    mgr_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mgr_name = db.Column(db.String(100), nullable=False)
    mgr_email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)


class Admin(db.Model):
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_name = db.Column(db.String(100), nullable=False)
    admin_email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)


with app.app_context():
    db.create_all()
