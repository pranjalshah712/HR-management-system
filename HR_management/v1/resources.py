import json
import pymysql
import random
from flask import render_template, make_response, request, redirect, url_for, session
from flask_restful import Resource
from flask_socketio import Namespace, emit
from HR_management import bcrypt, redis_client, elastic_client
from HR_management.v1.models import Emp, Manager, Admin, db

connection = pymysql.connect(host="localhost",
                             user="root",
                             password="root",
                             database="hr_management_db",
                             cursorclass=pymysql.cursors.DictCursor)


class Login(Resource):

    def get(self, success=None):

        # redis_client.delete('leaves')
        # redis_client.set("leaves", json.dumps([]))

        if success is not None:
            return make_response(render_template('login.html', success=success))

        else:
            return make_response(render_template('login.html'))

    def post(self):

        role_of = request.form['role']

        if role_of == '0':
            user_email = request.form['user_email']
            password = request.form['password']
            user_exists = Admin.query.filter_by(admin_email=user_email).first()
            try:
                if user_exists:
                    decode_password = bcrypt.check_password_hash(user_exists.password, password)

                    if decode_password:
                        # session[user_email] = user_email
                        # user = User()
                        # user.id = user_email
                        # login_user(user)
                        return redirect(url_for('adminclass', admin_id=user_exists.admin_id))

                    else:
                        return make_response(render_template('login.html', password_error=True))

                else:
                    return make_response(render_template('login.html', email_error=True))
            except:
                return make_response(render_template('login.html', other_error=True))

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

    def get(self):
        session.pop('logged_in', None)

        return redirect(url_for('login'))


class Register(Resource):

    def get(self, admin_id):

        return make_response(render_template('registration_form.html', admin_id=admin_id))

    def post(self, admin_id):

        role_of = request.form['role_of']

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

    def get(self, emp_id):

        emp_data = Emp.query.filter_by(emp_id=emp_id).first()

        cur = connection.cursor()

        cur.execute("select total_attendance from attendance where emp_id = %s", (emp_id,))
        attendance_count = cur.fetchall()

        cur.execute("SELECT * FROM task WHERE employee_id = %s", (emp_id,))
        tasks = cur.fetchall()

        connection.commit()
        cur.close()

        try:
            attendance = attendance_count[0]['total_attendance']

        except:
            attendance = 0

        notifications = json.loads(redis_client.get('leaves'))
        count = 0
        for notification in notifications:
            if notification['emp_id'] == str(emp_id):
                count += 1

        return make_response(render_template('employee.html', emp_data=emp_data, attendance=attendance,
                                             tasks=tasks, count=count))


def get_managers():
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

    def get(self, mgr_id):
        manager_data = Manager.query.filter_by(mgr_id=mgr_id).first()

        cur = connection.cursor()

        cur.execute("select * from employee where manager_id = %s", (manager_data.mgr_id,))
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

        ex_employee_data = get_employees(mgr_id)
        # ex_employees = list()
        # for emp in ex_employee_data:
        #     if emp['manager_id'] == mgr_id:
        #         ex_employees.append(emp)

        return make_response(render_template('manager.html', manager_data=manager_data,
                                             employees=employees,
                                             ex_employee_data=ex_employee_data, count=count))


class AdminClass(Resource):

    def get(self, admin_id):
        admin_data = Admin.query.filter_by(admin_id=admin_id).first()

        cur = connection.cursor()

        cur.execute("select * from employee")
        employees = cur.fetchall()

        cur.execute("select * from manager")
        managers = cur.fetchall()

        connection.commit()
        cur.close()

        notifications = json.loads(redis_client.get('leaves'))
        count = 0
        for notification in notifications:
            count += 1

        ex_manager_data = get_managers()
        ex_employee_data = get_employees()

        return make_response(
            render_template('admin.html', admin_data=admin_data, employees=employees,
                            managers=managers, notifications=notifications, ex_manager_data=ex_manager_data,
                            ex_employee_data=ex_employee_data, count=count))


class Task(Resource):

    def get(self, emp_id):
        cur = connection.cursor()

        cur.execute("SELECT * FROM task WHERE employee_id = %s", (emp_id,))
        tasks = cur.fetchall()

        connection.commit()
        cur.close()

        return make_response(render_template('user_task.html', tasks=tasks))


class AddTask(Resource):

    def get(self, emp_id, mgr_id):
        return make_response(render_template('add_task.html', emp_id=emp_id, mgr_id=mgr_id))

    def post(self, emp_id, mgr_id):
        task_title = request.form['task_title']
        task_detail = request.form['task_detail']

        cur = connection.cursor()

        cur.execute("insert into task (employee_id, task_title, task_details) values (%s, %s, %s)",
                    (emp_id, task_title, task_detail))

        connection.commit()
        cur.close()

        return redirect(url_for('managerclass', mgr_id=mgr_id))


class Attendance(Resource):

    def get(self, emp_id):

        cur = connection.cursor()

        cur.execute("SELECT total_attendance FROM attendance WHERE emp_id = %s", (emp_id,))

        try:
            attendance_count = cur.fetchall()
            attendance_count[0]['total_attendance'] += 1
            attendance_count = attendance_count[0]['total_attendance']
            cur.execute("UPDATE attendance SET total_attendance = %s WHERE emp_id = %s",
                        (attendance_count, emp_id))

        except:
            attendance_count = 1
            cur.execute("insert into attendance (emp_id, total_attendance) values (%s, %s)",
                        (emp_id, attendance_count))

        connection.commit()
        cur.close()

        return redirect(url_for('employee', emp_id=emp_id))


class Status(Resource):

    def get(self, task_id, emp_id):
        cur = connection.cursor()

        cur.execute("update task set status = %s where task_id = %s", (True, task_id))

        connection.commit()
        cur.close()

        return redirect(url_for('employee', emp_id=emp_id))


class Remove(Resource):

    def get(self, emp_id, admin_id, mgr_id=0):

        if mgr_id == 0:
            cur = connection.cursor()

            cur.execute("select * from employee where emp_id = %s", (emp_id,))
            employees_data = cur.fetchall()
            employee_data = employees_data[0]

            cur.execute("select * from task where employee_id = %s", (emp_id,))
            tasks_data = cur.fetchall()

            cur.execute("delete from employee where emp_id = %s", (emp_id,))

            cur.execute("delete from task where employee_id = %s", (emp_id,))

            connection.commit()
            cur.close()

            elastic_client.index(index='ex_employees', body={'employees': employee_data})

            if len(tasks_data) > 0:
                for task in tasks_data:
                    elastic_client.index(index='ex_tasks', body={'tasks': task})

            return redirect(url_for('adminclass', admin_id=admin_id))

        else:
            cur = connection.cursor()

            cur.execute("select * from manager where mgr_id = %s", (mgr_id,))
            managers_data = cur.fetchall()
            manager_data = managers_data[0]

            cur.execute("delete from manager where mgr_id = %s", (mgr_id,))

            connection.commit()
            cur.close()

            elastic_client.index(index='ex_managers', body={'managers': manager_data})

            return redirect(url_for('adminclass', admin_id=admin_id))


def generate_random_number():
    number = random.randint(0, 1000000000)
    number_list = list()
    if number not in number_list:
        number_list.append(number)
        return number


def store_leave(leave_id, leave_start, leave_end, leave_subject, leave_reason, emp_id, status=None):
    all_leaves = json.loads(redis_client.get('leaves'))
    all_leaves.append(
        {'leave_id': leave_id, 'start': leave_start, 'end': leave_end, 'subject': leave_subject, 'reason': leave_reason,
         'emp_id': emp_id, 'status': status})
    redis_client.set('leaves', json.dumps(all_leaves))


class LeaveStatus(Resource):

    def get(self, leave_id, status, mgr_id):

        all_leaves = json.loads(redis_client.get('leaves'))
        for leave in all_leaves:
            if leave['leave_id'] == int(leave_id):
                leave['status'] = status

        redis_client.set('leaves', json.dumps(all_leaves))

        return redirect(url_for('managerclass', mgr_id=mgr_id))


class ExManagers(Resource):

    def get(self, admin_id):
        manager_data = get_managers()
        return redirect(url_for('adminclass', admin_id=admin_id, manager_data=manager_data))


def get_tasks():
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

    def get(self, emp_id):

        tasks = get_tasks()
        emp_tasks = list()
        for task in tasks:
            if task['employee_id'] == emp_id:
                emp_tasks.append(task)

        return make_response(render_template('user_task.html', tasks=emp_tasks))


class Leave(Resource):

    def post(self):
        leave_start = request.form['leave_start']
        leave_end = request.form['leave_end']
        leave_subject = request.form['leave_subject']
        leave_reason = request.form['leave_reason']
        emp_id = request.form['emp_id']
        leave_id = generate_random_number()

        store_leave(leave_id, leave_start, leave_end, leave_subject, leave_reason, emp_id)
        return redirect(url_for('employee', emp_id=emp_id))


class LeaveHandler(Namespace):

    def on_connect(self):
        print("connect")

    def on_message(self, ids):
        if ids['emp_id'] != 'none':
            emp_leaves = list()
            notifications = json.loads(redis_client.get('leaves'))
            count = 0
            for notification in notifications:
                count += 1
                if notification['emp_id'] == str(ids['emp_id']):
                    emp_leaves.append(notification)
            print(len(notifications))

            emit('admin_notifications', json.dumps({'notifications': notifications, 'count': count}), broadcast=True)
            emit('initial_notifications', json.dumps(emp_leaves), broadcast=True)

        elif ids['mgr_id'] != 'none':
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
            notifications = json.loads(redis_client.get('leaves'))
            count = 0
            for notification in notifications:
                count += 1
            emit('admin_notifications', json.dumps({'notifications': notifications, 'count': count}), broadcast=True)