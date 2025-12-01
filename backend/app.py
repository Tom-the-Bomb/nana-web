from __future__ import annotations

from collections import defaultdict
from typing import TYPE_CHECKING, Callable, TypedDict
from functools import wraps
from os import environ
from io import BytesIO
import datetime

from parsedatetime import Calendar
from flask import Flask, Response, make_response, request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from dotenv import load_dotenv
import jwt
import boto3

if TYPE_CHECKING:
    class Test(TypedDict):
        date: datetime.date
        questions: dict[str, str]

    class Patient(TypedDict):
        patient_id: str
        name: str
        dob: datetime.date
        tests: list[Test]

    class User(TypedDict):
        username: str
        password: str
        patients: list[Patient]

    class LoginData(TypedDict):
        username: str
        password: str

__all__ = ('run',)

app = Flask(__name__)
CORS(app)

calendar = Calendar()

load_dotenv()

mongo_client = MongoClient(environ['MONGO_URI'])
collection = mongo_client['nana']['users']

r2_client = boto3.client('s3', endpoint_url=environ['R2_ENDPOINT'])

R2_BUCKET = environ['R2_BUCKET']
JWT_SECRET = environ['JWT_SECRET']

current_tests = defaultdict(dict)

def _generate_jwt(username: str) -> str:
    """Generate a JWT token for the given username with 24 hours expiration."""
    now = datetime.datetime.now(datetime.timezone.utc)

    payload = {
        'username': username,
        'iat': now,
        'exp': now + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return token

def _auth_required(handler: Callable[[User], Response]) -> Callable[..., Response]:
    @wraps(handler)
    def wrapper() -> Response:
        if auth_header := request.headers.get('Authorization'):
            _, token = auth_header.split()

            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

                if user := collection.find_one({'username': payload['username']}):
                    return handler(user)
                else:
                    return make_response(({'message': 'User not found'}, 404))
            except jwt.ExpiredSignatureError:
                return make_response(({'message': 'Token has expired'}, 401))
            except jwt.InvalidTokenError:
                return make_response(({'message': 'Invalid token'}, 401))
            except Exception as e:
                raise e
                print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
                return make_response(({'message': str(e)}, 500))
        else:
            return make_response(({'message': 'Authorization header missing'}, 401))
    return wrapper

@app.route('/')
@cross_origin()
def root() -> dict[str, str]:
    return {'message': 'NANA web home-page'}

@app.route('/login', methods=['POST'])
@cross_origin()
def login() -> tuple[dict[str, str], int]:
    data: LoginData = request.get_json()

    if user := collection.find_one({'username': data['username']}):
        if checkpw(
            data['password'].encode('utf-8'),
            user['password'].encode('utf-8')
        ):
            return {
                'message': 'Login successful',
                'token': _generate_jwt(data['username']),
                'user': data['username']
            }, 200
        else:
            return {'message': 'Invalid credentials'}, 401
    else:
        return {'message': 'User not found'}, 404

@app.route('/register', methods=['POST'])
@cross_origin()
def register() -> Response:
    data: LoginData = request.get_json()
    hashed_pw = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')

    if collection.find_one({'username': data['username']}):
        return make_response(({'message': 'Username already exists'}, 409))
    else:
        collection.insert_one({
            'username': data['username'],
            'password': hashed_pw,
            'patients': [],
        })
        return make_response(({
            'message': 'Login successful',
            'token': _generate_jwt(data['username']),
            'user': data['username']
        }, 201))

@app.route('/test', methods=['POST'])
@cross_origin()
@_auth_required
def start_test(user: User) -> Response:
    user_tests = current_tests[user['username']]

    data: dict[str, str] = request.get_json()
    device = data['device_id']

    if user_tests[device]:
        return make_response(({'message': 'A test is already in progress'}, 400))

    user_tests[device] = data['patient_id']
    return make_response(({'message': f'Process started with data', 'data': data}, 200))

@app.route('/upload', methods=['POST'])
@cross_origin()
@_auth_required
def upload(user: User) -> Response:
    data = request.form.to_dict()
    video = request.files.get('video')

    user_tests = current_tests[username := user['username']]
    device = data['device_id']

    if current_patient_id := user_tests.get(device):
        if patient := collection.find_one({
            'username': username,
            'patients.patient_id': current_patient_id
        }):
            r2_client.upload_fileobj(
                video.stream,
                R2_BUCKET,
                f'{username}/{current_patient_id}/{len(patient["tests"]) + 1}.mp4'
            )
            collection.update_one(
                {
                    'username': username,
                    'patients.patient_id': current_patient_id
                },
                {
                    '$push': {
                        'patients.$.tests': {
                            'date': datetime.datetime.now().date(),
                            **data
                        }
                    }
                }
            )
            return make_response(({'message': 'Upload successful'}, 200))
        else:
            return make_response(({'message': 'Patient not found'}, 404))
    else:
        del user_tests[device]
        return make_response(({'message': 'No test in progress'}, 400))

@app.route('/patients', methods=['GET', 'POST'])
@cross_origin()
@_auth_required
def patients(user: User) -> Response:
    if request.method == 'POST':
        data: Patient = request.get_json()

        if collection.find_one({
            'username': user['username'],
            'patients.patient_id': data['patient_id']
        }):
            return make_response(({'message': 'Patient ID already exists'}, 409))
        else:
            collection.update_one(
                {'username': user['username']},
                {'$push': {'patients': data}}
            )
            return make_response(({'message': 'Patient added successfully'}, 201))
    else:
        return make_response(({'patients': user['patients']}, 200))

@app.route('/video', methods=['GET'])
@cross_origin()
@_auth_required
def get_video(user: User) -> Response:
    data = request.args
    patient_id = data.get('patient_id')
    test_index = int(data.get('test_index', '0'))

    try:
        buffer = BytesIO()

        r2_client.download_fileobj(
            R2_BUCKET,
            f'{user["username"]}/{patient_id}/{test_index}.mp4',
            buffer
        )
        buffer.seek(0)

        return make_response((buffer.read(), 200, {
            'Content-Type': 'video/mp4',
            'Content-Disposition': f'attachment; filename="{patient_id}_{test_index}.mp4"'
        }))
    except Exception as e:
        return make_response(({'message': str(e)}, 500))

def run(debug: bool = False, port: int | None = None) -> None:
    load_dotenv()

    if not port:
        port = int(environ.get('PORT', 5000))
    app.run(debug=debug, port=port)