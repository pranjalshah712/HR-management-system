from HR_management.v1.resources import (Login, Logout, Register, Employee, ManagerClass, Task, AddTask, Attendance,
                                        Status, AdminClass, Remove, LeaveHandler, LeaveStatus, ExManagers, ExTask,
                                        Leave)
from HR_management import api, socketio

api.add_resource(Login, '/', '/<string:success>')
api.add_resource(Logout, '/logout')
api.add_resource(Register, '/register/<int:admin_id>')

api.add_resource(Employee, '/employee/<int:emp_id>')
api.add_resource(ManagerClass, '/manager/<int:mgr_id>')
api.add_resource(AdminClass, '/admin/<int:admin_id>')

api.add_resource(Task, '/task/<int:emp_id>')
api.add_resource(AddTask, '/add_task/<int:emp_id>/<int:mgr_id>')

api.add_resource(Attendance, '/attendance/<int:emp_id>')

api.add_resource(Status, '/status_update/<int:task_id>/<int:emp_id>')

api.add_resource(LeaveStatus, '/leave_status/<string:leave_id>/<string:status>/<int:mgr_id>')

api.add_resource(Remove, '/remove/<int:emp_id>/<int:admin_id>', '/remove/<int:emp_id>/<int:admin_id>/<int:mgr_id>')

api.add_resource(ExManagers, '/ex_managers/<int:admin_id>')

api.add_resource(ExTask, '/remove_task/<int:emp_id>')

api.add_resource(Leave, '/leaves')

socketio.on_namespace(LeaveHandler('/leave'))