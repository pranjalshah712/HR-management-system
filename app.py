from HR_management import app, socketio

if __name__ == '__main__':
    socketio.run(app, port=9900, debug=False, allow_unsafe_werkzeug=True)


