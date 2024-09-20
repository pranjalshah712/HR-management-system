import json
import pymysql
import random
from flask import render_template, make_response, request, redirect, url_for, session
from flask_restful import Resource
from flask_socketio import Namespace, emit
from HR_management import bcrypt, redis_client, elastic_client
from HR_management.v1.models import Emp, Manager, Admin, db

# Establishing a connection to the MySQL database
connection = pymysql.connect(host="localhost",
                             user="root",
                             password="root",
                             database="hr_management_db",
                             cursorclass=pymysql.cursors.DictCursor)


class Login(Resource):
    # Handles user login functionality

    def get(self, success=None):
        # Render the login page, optionally showing a success message
        if success is not None:
            return make_response(render_template('login.html', success=success))
        else:
            return make_response(render_template('login.html'))

    def post(self):
        # Handle form submission for login
        role_of = request.form['role']

        # Admin login
        if role_of == '0':
            user_email = request.form['user_email']
            password = request.form['password']
            user_exists = Admin.query.filter_by(admin_email=user_email).first()
            try:
                if user_exists:
                    # Verify password
                    decode_password = bcrypt.check_password_hash(user_exists.password, password)

                    if decode_password:
                        return redirect(url_for('adminclass', admin_id=user_exists.admin_id))
                    else:
                        return make_response(render_template('login.html', password_error=True))
                else:
                    return make_response(render_template('login.html', email_error=True))
            except:
                return make_response(render_template('login.html', other_error=True))

        # Employee login
        if role_of == '1':
            user_email = request.form['user_email']
            password = request.form['password']
            user_exists = Emp.query.filter_by(emp_email=user_email).first()

            if user_exists:
                decode_password = bcrypt.check_password_hash(user_exists.password, password)

                if decode_password:
                    session[user_email] = user_email
                    return redirect(url_for('employee', emp_id=user_exists.emp_id))
                else:
                    return make_response(render_template('login.html', password_error=True))
            else:
                return make_response(render_template('login.html', email_error=True))

        # Manager login
        if role_of == '2':
            user_email = request.form['user_email']
            password = request.form['password']
            user_exists = Manager.query.filter_by(mgr_email=user_email).first()

            if user_exists:
                decode_password = bcrypt.check_password_hash(user_exists.password, password)

                if decode_password:
                    session[user_email] = user_email
                    return redirect(url_for('managerclass', mgr_id=user_exists.mgr_id))
                else:
                    return make_response(render_template('login.html', password_error=True))
            else:
                return make_response(render_template('login.html', email_error=True))


class Logout(Resource):
    # Handles user logout functionality

    def get(self):
        session.pop('logged_in', None)
        return redirect(url_for('login'))


class Register(Resource):
    # Handles user registration functionality

    def get(self, admin_id):
        # Render registration form for a specific admin
        return make_response(render_template('registration_form.html', admin_id=admin_id))

    def post(self, admin_id):
        # Handle registration form submission
        role_of = request.form['role_of']

        # Admin registration
        if role_of == '0':
            admin_name = request.form['admin_name']
            admin_email = request.form['admin_email']
            password = request.form['password']
            email_exists = Admin.query.filter_by(admin_email=admin_email).first()

            if email_exists:
                return make_response(render_template('registration_form.html', email_error=True, admin_id=admin_id))
            else:
                encode_password = bcrypt.generate_password_hash(password).decode('utf-8')
                admin_data = Admin(admin_name=admin_name, admin_email=admin_email, password=encode_password)
                db.session.add(admin_data)
                db.session.commit()
                return redirect(url_for('adminclass', admin_id=admin_id))

        # Employee registration
        elif role_of == '1':
            emp_name = request.form['emp_name']
            emp_email = request.form['emp_email']
            experience = request.form['experience']
            skills = request.form['skills']
            designation = request.form['designation']
            manager_id = request.form['manager_id']
            password = request.form['password']

            email_exists = Emp.query.filter_by(emp_email=emp_email).first()

            if email_exists:
                return make_response(render_template('registration_form.html', email_error=True, admin_id=admin_id))
            else:
                manager_exists = Manager.query.filter_by(mgr_id=manager_id).first()

                if manager_exists:
                    encode_password = bcrypt.generate_password_hash(password).decode('utf-8')
                    emp_data = Emp(emp_name=emp_name, emp_email=emp_email, password=encode_password,
                                   experience=experience, skills=skills, designation=designation, manager_id=manager_id)
                    db.session.add(emp_data)
                    db.session.commit()
                    return redirect(url_for('adminclass', admin_id=admin_id))
                else:
                    return make_response(
                        render_template('registration_form.html', manager_error=True, admin_id=admin_id))

        # Manager registration
        elif role_of == '2':
            mgr_name = request.form['mgr_name']
            mgr_email = request.form['mgr_email']
            password = request.form['password']

            email_exists = Manager.query.filter_by(mgr_email=mgr_email).first()

            if email_exists:
                return make_response(render_template('registration_form.html', email_error=True, admin_id=admin_id))
            else:
                encode_password = bcrypt.generate_password_hash(password).decode('utf-8')
                mgr_data = Manager(mgr_name=mgr_name, mgr_email=mgr_email, password=encode_password)
                db.session.add(mgr_data)
                db.session.commit()
                return redirect(url_for('adminclass', admin_id=admin_id))


def get_employees(mgr_id=None):
    # Retrieves employees based on manager ID or all employees if no ID is given
    if mgr_id:
        query = {
            "query": {
                "bool": {
                    "filter": {
                        "term": {
                            "employees.manager_id": {
                                "value": mgr_id
                            }
                        }
                    }
                }
            }
        }
    else:
        query = {
            'query': {
                'match_all': {
                }
            }
        }
    employee_data = list()
    emp_data = elastic_client.search(index='ex_employees', body=query, size=10000)
    for data in emp_data['hits']['hits']:
        employee_data.append(data['_source']['employees'])

    return employee_data


class Employee(Resource):
    # Handles employee profile functionality

    def get(self, emp_id):
        emp_data = Emp.query.filter_by(emp_id=emp_id).first()

        cur = connection.cursor()

        # Fetch attendance data for the employee
        cur.execute("select total_attendance from attendance where emp_id = %s", (emp_id,))
        attendance_count = cur.fetchall()

        # Fetch tasks assigned to the employee
        cur.execute("SELECT * FROM task WHERE employee_id = %s", (emp_id,))
        tasks = cur.fetchall()

        connection.commit()
        cur.close()

        try:
            attendance = attendance_count[0]['total_attendance']
        except:
            attendance = 0

        # Count notifications related to the employee
        notifications = json.loads(redis_client.get('leaves'))
        count = 0
        for notification in notifications:
            if notification['emp_id'] == str(emp_id):
                count += 1

        return make_response(render_template('employee.html', emp_data=emp_data, attendance=attendance,
                                             tasks=tasks, count=count))


def get_managers():
    # Retrieves all managers
    query = {
        'query': {
            'match_all': {
            }
        }
    }
    manager_data = list()
    mgr_data = elastic_client.search(index='ex_managers', body=query, size=10000)
    for data in mgr_data['hits']['hits']:
        manager_data.append(data['_source']['managers'])
    return manager_data


class ManagerClass(Resource):
    # Handles manager profile functionality

    def get(self, mgr_id):
        manager_data = Manager.query.filter_by(mgr_id=mgr_id).first()

        cur = connection.cursor()

        # Fetch employees under the manager
        cur.execute("select * from employee where manager_id = %s", (manager_data.mgr_id,))
        employees = cur.fetchall()

        connection.commit()
        cur.close()

        emp_ids = list()
        emp_leaves = list()

        # Count leave notifications for employees under the manager
        notifications = json.loads(redis_client.get('leaves'))
        for employee in employees:
            emp_ids.append(str(employee['emp_id']))
        count = 0
        for notification in notifications:
            if notification['emp_id'] in emp_ids and notification['status'] is None:
                count += 1
                emp_leaves.append(notification)

        ex_employee_data = get_employees(mgr_id)

        return make_response(render_template('manager.html', manager_data=manager_data,
                                             employees=employees,
                                             ex_employee_data=ex_employee_data, count=count))

class AdminClass(Resource):
    # Handles the admin dashboard functionality

    def get(self, admin_id):
        # Retrieve admin data based on admin ID
        admin_data = Admin.query.filter_by(admin_id=admin_id).first()

        cur = connection.cursor()

        # Fetch all employees from the database
        cur.execute("select * from employee")
        employees = cur.fetchall()

        # Fetch all managers from the database
        cur.execute("select * from manager")
        managers = cur.fetchall()

        connection.commit()
        cur.close()

        # Retrieve leave notifications from Redis
        notifications = json.loads(redis_client.get('leaves'))
        count = 0
        # Count the total number of notifications
        for notification in notifications:
            count += 1

        # Get additional manager and employee data
        ex_manager_data = get_managers()
        ex_employee_data = get_employees()

        # Render the admin dashboard with relevant data
        return make_response(
            render_template('admin.html', admin_data=admin_data, employees=employees,
                            managers=managers, notifications=notifications, ex_manager_data=ex_manager_data,
                            ex_employee_data=ex_employee_data, count=count))


class Task(Resource):
    # Handles fetching tasks assigned to an employee

    def get(self, emp_id):
        cur = connection.cursor()

        # Fetch tasks related to the specific employee
        cur.execute("SELECT * FROM task WHERE employee_id = %s", (emp_id,))
        tasks = cur.fetchall()

        connection.commit()
        cur.close()

        # Render the user's task page with the tasks
        return make_response(render_template('user_task.html', tasks=tasks))


class AddTask(Resource):
    # Handles adding a new task for an employee

    def get(self, emp_id, mgr_id):
        # Render the form for adding a new task
        return make_response(render_template('add_task.html', emp_id=emp_id, mgr_id=mgr_id))

    def post(self, emp_id, mgr_id):
        # Handle form submission for adding a new task
        task_title = request.form['task_title']
        task_detail = request.form['task_detail']

        cur = connection.cursor()

        # Insert the new task into the database
        cur.execute("insert into task (employee_id, task_title, task_details) values (%s, %s, %s)",
                    (emp_id, task_title, task_detail))

        connection.commit()
        cur.close()

        # Redirect to the manager's page after adding the task
        return redirect(url_for('managerclass', mgr_id=mgr_id))


class Attendance(Resource):
    # Handles attendance functionality for employees

    def get(self, emp_id):
        cur = connection.cursor()

        # Retrieve the total attendance for the employee
        cur.execute("SELECT total_attendance FROM attendance WHERE emp_id = %s", (emp_id,))

        try:
            attendance_count = cur.fetchall()
            # Increment the attendance count
            attendance_count[0]['total_attendance'] += 1
            attendance_count = attendance_count[0]['total_attendance']
            # Update the attendance count in the database
            cur.execute("UPDATE attendance SET total_attendance = %s WHERE emp_id = %s",
                        (attendance_count, emp_id))

        except:
            # If no attendance record exists, create one
            attendance_count = 1
            cur.execute("insert into attendance (emp_id, total_attendance) values (%s, %s)",
                        (emp_id, attendance_count))

        connection.commit()
        cur.close()

        # Redirect back to the employee's profile after updating attendance
        return redirect(url_for('employee', emp_id=emp_id))


class Status(Resource):
    # Handles updating the status of a task

    def get(self, task_id, emp_id):
        cur = connection.cursor()

        # Update the task status to complete
        cur.execute("update task set status = %s where task_id = %s", (True, task_id))

        connection.commit()
        cur.close()

        # Redirect back to the employee's profile after updating task status
        return redirect(url_for('employee', emp_id=emp_id))


class Remove(Resource):
    # Handles the removal of employees or managers from the system

    def get(self, emp_id, admin_id, mgr_id=0):
        if mgr_id == 0:
            # Removing an employee
            cur = connection.cursor()

            # Fetch employee data to keep a record before deletion
            cur.execute("select * from employee where emp_id = %s", (emp_id,))
            employees_data = cur.fetchall()
            employee_data = employees_data[0]

            # Fetch tasks associated with the employee
            cur.execute("select * from task where employee_id = %s", (emp_id,))
            tasks_data = cur.fetchall()

            # Delete the employee from the database
            cur.execute("delete from employee where emp_id = %s", (emp_id,))

            # Delete all tasks associated with the employee
            cur.execute("delete from task where employee_id = %s", (emp_id,))

            connection.commit()
            cur.close()

            # Index employee data in Elasticsearch after deletion
            elastic_client.index(index='ex_employees', body={'employees': employee_data})

            # Index associated tasks in Elasticsearch
            if len(tasks_data) > 0:
                for task in tasks_data:
                    elastic_client.index(index='ex_tasks', body={'tasks': task})

            # Redirect to the admin class view
            return redirect(url_for('adminclass', admin_id=admin_id))

        else:
            # Removing a manager
            cur = connection.cursor()

            # Fetch manager data before deletion
            cur.execute("select * from manager where mgr_id = %s", (mgr_id,))
            managers_data = cur.fetchall()
            manager_data = managers_data[0]

            # Delete the manager from the database
            cur.execute("delete from manager where mgr_id = %s", (mgr_id,))

            connection.commit()
            cur.close()

            # Index manager data in Elasticsearch after deletion
            elastic_client.index(index='ex_managers', body={'managers': manager_data})

            # Redirect to the admin class view
            return redirect(url_for('adminclass', admin_id=admin_id))


def generate_random_number():
    # Generate a random unique leave ID
    number = random.randint(0, 1000000000)
    number_list = list()
    if number not in number_list:
        number_list.append(number)
        return number


def store_leave(leave_id, leave_start, leave_end, leave_subject, leave_reason, emp_id, status=None):
    # Store leave information in Redis
    all_leaves = json.loads(redis_client.get('leaves'))
    all_leaves.append(
        {'leave_id': leave_id, 'start': leave_start, 'end': leave_end, 'subject': leave_subject, 'reason': leave_reason,
         'emp_id': emp_id, 'status': status})
    redis_client.set('leaves', json.dumps(all_leaves))


class LeaveStatus(Resource):
    # Update the status of a leave request

    def get(self, leave_id, status, mgr_id):
        # Fetch all leave requests from Redis
        all_leaves = json.loads(redis_client.get('leaves'))
        for leave in all_leaves:
            if leave['leave_id'] == int(leave_id):
                leave['status'] = status  # Update the status

        # Store updated leave requests back in Redis
        redis_client.set('leaves', json.dumps(all_leaves))

        # Redirect back to the manager's page
        return redirect(url_for('managerclass', mgr_id=mgr_id))


class ExManagers(Resource):
    # Handles fetching existing managers

    def get(self, admin_id):
        manager_data = get_managers()  # Get manager data
        return redirect(url_for('adminclass', admin_id=admin_id, manager_data=manager_data))


def get_tasks():
    # Retrieve all tasks from Elasticsearch
    query = {
        'query': {
            'match_all': {
            }
        }
    }
    task_data = list()
    ex_task_data = elastic_client.search(index='ex_tasks', body=query, size=10000)
    for data in ex_task_data['hits']['hits']:
        task_data.append(data['_source']['tasks'])

    return task_data


class ExTask(Resource):
    # Handles fetching tasks assigned to a specific employee

    def get(self, emp_id):
        tasks = get_tasks()  # Get all tasks
        emp_tasks = list()
        # Filter tasks that belong to the specified employee
        for task in tasks:
            if task['employee_id'] == emp_id:
                emp_tasks.append(task)

        # Render the user's task page with the employee's tasks
        return make_response(render_template('user_task.html', tasks=emp_tasks))


class Leave(Resource):
    # Handles leave requests from employees

    def post(self):
        # Gather leave request details from the form
        leave_start = request.form['leave_start']
        leave_end = request.form['leave_end']
        leave_subject = request.form['leave_subject']
        leave_reason = request.form['leave_reason']
        emp_id = request.form['emp_id']
        leave_id = generate_random_number()  # Generate a random leave ID

        # Store the leave request
        store_leave(leave_id, leave_start, leave_end, leave_subject, leave_reason, emp_id)
        return redirect(url_for('employee', emp_id=emp_id))


class LeaveHandler(Namespace):
    # WebSocket namespace for handling leave notifications

    def on_connect(self):
        print("connect")  # Connection established

    def on_message(self, ids):
        # Handle messages for employee leave notifications
        if ids['emp_id'] != 'none':
            emp_leaves = list()
            notifications = json.loads(redis_client.get('leaves'))
            count = 0
            for notification in notifications:
                count += 1
                if notification['emp_id'] == str(ids['emp_id']):
                    emp_leaves.append(notification)

            emit('admin_notifications', json.dumps({'notifications': notifications, 'count': count}), broadcast=True)
            emit('initial_notifications', json.dumps(emp_leaves), broadcast=True)

        elif ids['mgr_id'] != 'none':
            # Handle messages for manager leave notifications
            cur = connection.cursor()
            cur.execute("select * from employee where manager_id = %s", (ids['mgr_id'],))
            employees = cur.fetchall()
            connection.commit()
            cur.close()

            emp_ids = list()
            emp_leaves = list()

            notifications = json.loads(redis_client.get('leaves'))
            for employee in employees:
                emp_ids.append(str(employee['emp_id']))
            count = 0
            for notification in notifications:
                if notification['emp_id'] in emp_ids and notification['status'] is None:
                    count += 1
                    emp_leaves.append(notification)
            emit('mgr_notifications', json.dumps({'notifications': emp_leaves, 'count': count}), broadcast=True)

        else:
            # Handle general notifications for admins
            notifications = json.loads(redis_client.get('leaves'))
            count = 0
            for notification in notifications:
                count += 1
            emit('admin_notifications', json.dumps({'notifications': notifications, 'count': count}), broadcast=True)
