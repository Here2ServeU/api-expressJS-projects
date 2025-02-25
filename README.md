# Building a RESTful E-commerce API with Flask for T2S Services

We will create a RESTful API for T2S Services that supports product management, user authentication, and order processing, similar to APIs used by Amazon, Shopify, and BigCommerce.

---

## Step 1: Set Up the Project

- First, install Flask and required dependencies:
```bash
mkdir t2s-ecommerce-api
cd t2s-ecommerce-api
python3 -m venv venv
source venv/bin/activate  # On Windows, use venv\Scripts\activate
pip install flask flask-restful flask-jwt-extended flask-sqlalchemy
```

## Step 2: Create the API Structure
```plaintext
t2s-ecommerce-api/
│── app.py
│── models.py
│── resources/
│   ├── products.py
│   ├── users.py
│   ├── orders.py
│── database.py
│── config.py
│── requirements.txt
```

## Step 3: Configure the Database (config.py)

- We will use SQLite for simplicity, but you can replace it with PostgreSQL or MySQL.

```python
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = 'supersecretkey'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

## Step 4: Define Database Models (models.py)

- Create models for Users, Products, and Orders.
```phyton
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
```

## Step 5: Create the API Endpoints (resources/)

### 1. User Authentication (resources/users.py)

```python
from flask import request, jsonify
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import User, db

class RegisterUser(Resource):
    def post(self):
        data = request.get_json()
        hashed_password = generate_password_hash(data['password'])
        new_user = User(username=data['username'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return {"message": "User created successfully"}, 201

class LoginUser(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity=user.id)
            return {"access_token": access_token}, 200
        return {"message": "Invalid credentials"}, 401
```

### 2. Product Management (resources/products.py)
```python
from flask import request, jsonify
from flask_restful import Resource
from models import Product, db
from flask_jwt_extended import jwt_required

class ProductList(Resource):
    def get(self):
        products = Product.query.all()
        return jsonify([{"id": p.id, "name": p.name, "price": p.price, "stock": p.stock} for p in products])

    @jwt_required()
    def post(self):
        data = request.get_json()
        new_product = Product(name=data['name'], description=data['description'], price=data['price'], stock=data['stock'])
        db.session.add(new_product)
        db.session.commit()
        return {"message": "Product added successfully"}, 201

class ProductDetail(Resource):
    def get(self, product_id):
        product = Product.query.get_or_404(product_id)
        return jsonify({"id": product.id, "name": product.name, "price": product.price, "stock": product.stock})

    @jwt_required()
    def delete(self, product_id):
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        return {"message": "Product deleted successfully"}, 200
```

### 3. Order Processing (resources/orders.py)
```python
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Order, Product, db

class OrderResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        product = Product.query.get_or_404(data['product_id'])

        if product.stock < data['quantity']:
            return {"message": "Not enough stock"}, 400

        total_price = product.price * data['quantity']
        new_order = Order(user_id=user_id, product_id=product.id, quantity=data['quantity'], total_price=total_price)
        
        product.stock -= data['quantity']
        db.session.add(new_order)
        db.session.commit()

        return {"message": "Order placed successfully"}, 201

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        orders = Order.query.filter_by(user_id=user_id).all()
        return jsonify([{"id": o.id, "product_id": o.product_id, "quantity": o.quantity, "total_price": o.total_price} for o in orders])
```

## Step 6: Set Up Flask Application (app.py)
```python
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
```

## Step 7: Testing the API

### 1. Run the API
```bash
python app.py
```

### 2. Test with cURL or Postman
#### 1.	Register a User
```json
POST /register
{
    "username": "testuser",
    "password": "password123"
}
```

#### 2.	Login
```json
POST /login
{
    "username": "testuser",
    "password": "password123"
}
```
- Get JWT Token from response.

#### 3. Add a Product (Auth Required)
```json
POST /products
{
    "name": "Laptop",
    "description": "High-end gaming laptop",
    "price": 1500.99,
    "stock": 5
}
```
- Include JWT Token in Authorization: Bearer 

#### 4. Place an Order
```json
POST /orders
{
    "product_id": 1,
    "quantity": 1
}
```

---

## Conclusion

This Flask RESTful API for T2S Services is a real-world e-commerce solution that supports user authentication, product management, and order processing, similar to Amazon, Shopify, and BigCommerce.

