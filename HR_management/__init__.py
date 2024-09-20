from flask import Flask
from flask_restful import Api
from flask_socketio import SocketIO
import importlib
from flask_bcrypt import Bcrypt
import redis
from elasticsearch import Elasticsearch

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = 'sdjfalksdhdhs546534adfgadfjhgjksgfd4g65456sdfggdfg68df7sghdfgdfg5'
api = Api(app)
socketio = SocketIO(app)
bcrypt = Bcrypt(app)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
elastic_client = Elasticsearch("http://192.168.1.21:9200/")

importlib.import_module('HR_management.v1')
