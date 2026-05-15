import requests

response = requests.post("http://127.0.0.1:8000/api/auth/login/", json={
    "email": "akshaytr31@gmail.com",
    "password": "Password123!"  # or some placeholder to see the response structure
})

print(response.status_code)
print(response.json())
