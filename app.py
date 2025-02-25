from flask import Flask
from flask_restful import Api
from flask_jwt_extended import JWTManager
from models import db
from config import Config
from resources.users import RegisterUser, LoginUser
from resources.products import ProductList, ProductDetail
from resources.orders import OrderResource

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
api = Api(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# Routes
api.add_resource(RegisterUser, "/register")
api.add_resource(LoginUser, "/login")
api.add_resource(ProductList, "/products")
api.add_resource(ProductDetail, "/products/<int:product_id>")
api.add_resource(OrderResource, "/orders")

if __name__ == "__main__":
    app.run(debug=True)

@app.route('/')
def home():
    return {"message": "Welcome to T2S E-Commerce API"}, 200

if __name__ == "__main__":
    app.run(debug=True)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=True)
