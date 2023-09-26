from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/members")
def members():
    return {"members" : ["Oscar", "Kevin", "Elena", "Nhat", "Huyen"]}

if __name__ == "__main__":
    app.run(debug=True, port=8000, host="0.0.0.0")