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
