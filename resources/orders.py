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
