from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.betting import Transaction
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/deposit', methods=['POST'])
def deposit():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.json
        amount = float(data['amount'])
        payment_method = data.get('payment_method', 'card')
        
        if amount <= 0:
            return jsonify({'error': 'Invalid deposit amount'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # In a real application, you would integrate with a payment processor here
        # For demo purposes, we'll just add the amount to the user's balance
        
        user.balance += amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            transaction_type='deposit',
            amount=amount,
            description=f'Deposit via {payment_method}'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Deposit successful',
            'new_balance': user.balance,
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/withdraw', methods=['POST'])
def withdraw():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.json
        amount = float(data['amount'])
        withdrawal_method = data.get('withdrawal_method', 'bank')
        
        if amount <= 0:
            return jsonify({'error': 'Invalid withdrawal amount'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.balance < amount:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # In a real application, you would integrate with a payment processor here
        # For demo purposes, we'll just subtract the amount from the user's balance
        
        user.balance -= amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            transaction_type='withdrawal',
            amount=-amount,
            description=f'Withdrawal via {withdrawal_method}'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Withdrawal successful',
            'new_balance': user.balance,
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transaction-history', methods=['GET'])
def get_transaction_history():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        transaction_type = request.args.get('type')
        
        query = Transaction.query.filter_by(user_id=user_id)
        
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        
        transactions = query.order_by(
            Transaction.created_at.desc()
        ).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'transactions': [transaction.to_dict() for transaction in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/wallet-summary', methods=['GET'])
def get_wallet_summary():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate summary statistics
        total_deposits = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'deposit'
        ).scalar() or 0
        
        total_withdrawals = abs(db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'withdrawal'
        ).scalar() or 0)
        
        total_bets = abs(db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'bet'
        ).scalar() or 0)
        
        total_payouts = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'payout'
        ).scalar() or 0
        
        return jsonify({
            'current_balance': user.balance,
            'total_deposits': total_deposits,
            'total_withdrawals': total_withdrawals,
            'total_bets': total_bets,
            'total_payouts': total_payouts,
            'net_profit': total_payouts - total_bets
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

