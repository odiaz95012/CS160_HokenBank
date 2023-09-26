from flask import Flask, jsonify, request


app = Flask(__name__)

@app.route("/members")
def members():
    return {"members":["Oscar", "Costi", "Tyler", "Dawson", "EJ"]}

@app.route("/members/createMember/<string:name>/<int:age>")
def createMember( name:str, age:int):
    return jsonify({"name" : name, "age" : age})


if __name__ == "__main__":
    app.run(debug=True)