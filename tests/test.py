import requests

with open("tests/test.mp4", "rb") as f:
    file = {
        "video": f.read(),
    }

    data = {
        "questions": {
            "What is your name?": "Chloe James",
            "What is your date of birth?": "April 19, 1973",
            "Why are you in the hospital?": "concussion",
            "What is your address?": "4hundred thirty seven Riverside Boulevard"
        },
        "pauses": 46.200053736613825,
        "Stutter Data": [
            {
                "text": "uh",
                "count": 4
            },
            {
                "text": "um",
                "count": 2
            }
        ]

    }
    x = requests.post('http://localhost:5000/login', json={"username": "BOB", "password": "123"})
    token = x.json()['token']

    x = requests.post('http://localhost:5000/start', headers={"Authorization": f'Bearer {token}'})
    print(x.status_code)

    r = requests.post('http://localhost:5000/upload', files=file, json=data, headers={"Authorization": f'Bearer {token}'})

    print(r.status_code)
    print(r.json())