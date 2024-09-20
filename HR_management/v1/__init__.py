from flask import Blueprint
from HR_management import api, app
from HR_management.v1 import endpoints

blue_ob = Blueprint("HR_management", __name__)
api.blueprint = blue_ob
api.blueprint_setup = blue_ob

app.register_blueprint(blue_ob)

