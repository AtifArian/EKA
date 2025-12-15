from flask import Blueprint, request, jsonify
from app.models import db, Donation
from datetime import datetime

donations_bp = Blueprint('donations', __name__)

@donations_bp.route('/donations', methods=['POST'])
def create_donation():
    """Create a new donation record - no authentication required"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # Validate required fields
        if not data.get('amount'):
            return jsonify({'error': 'amount is required'}), 400
        if not data.get('payment_method'):
            return jsonify({'error': 'payment_method is required'}), 400
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
            if amount > 1000000:
                return jsonify({'error': 'Amount exceeds maximum limit'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount format'}), 400
        
        # Validate payment method
        valid_payment_methods = ['bkash', 'nagad', 'rocket', 'bank', 'card']
        if data['payment_method'].lower() not in valid_payment_methods:
            return jsonify({'error': 'Invalid payment method'}), 400
        
        # Check if anonymous donation
        is_anonymous = data.get('is_anonymous', False)
        if is_anonymous or not data.get('donor_name'):
            is_anonymous = True
            donor_name = None
            donor_email = None
        else:
            donor_name = data.get('donor_name')
            donor_email = data.get('donor_email')
        
        # Create donation
        donation = Donation(
            donor_name=donor_name,
            donor_email=donor_email,
            amount=amount,
            currency=data.get('currency', 'BDT'),
            payment_method=data['payment_method'],
            transaction_id=data.get('transaction_id'),
            phone_number=data.get('phone_number'),
            message=data.get('message'),
            is_anonymous=is_anonymous,
            status=data.get('status', 'pending')
        )
        
        db.session.add(donation)
        db.session.commit()
        
        return jsonify({
            'message': 'Donation received successfully',
            'donation': donation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@donations_bp.route('/donations', methods=['GET'])
def get_donations():
    """Get all donations with pagination and filters"""
    try:
        # Optional filters
        status = request.args.get('status')
        payment_method = request.args.get('payment_method')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        
        query = Donation.query
        
        if status:
            query = query.filter_by(status=status)
        if payment_method:
            query = query.filter_by(payment_method=payment_method)
        
        # Order by most recent first
        query = query.order_by(Donation.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'donations': [d.to_dict() for d in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@donations_bp.route('/donations/<int:donation_id>', methods=['GET'])
def get_donation(donation_id):
    """Get a specific donation by ID"""
    try:
        donation = Donation.query.get(donation_id)
        
        if not donation:
            return jsonify({'error': 'Donation not found'}), 404
        
        return jsonify(donation.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@donations_bp.route('/donations/<int:donation_id>', methods=['PUT'])
def update_donation(donation_id):
    """Update donation status (admin only in production)"""
    try:
        donation = Donation.query.get(donation_id)
        
        if not donation:
            return jsonify({'error': 'Donation not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            if data['status'] not in ['pending', 'completed', 'failed']:
                return jsonify({'error': 'Invalid status'}), 400
            donation.status = data['status']
        
        if 'transaction_id' in data:
            donation.transaction_id = data['transaction_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Donation updated successfully',
            'donation': donation.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@donations_bp.route('/donations/stats', methods=['GET'])
def get_donation_stats():
    """Get donation statistics"""
    try:
        total_donations = db.session.query(db.func.count(Donation.id)).scalar()
        total_amount = db.session.query(db.func.sum(Donation.amount)).filter_by(status='completed').scalar() or 0
        pending_count = db.session.query(db.func.count(Donation.id)).filter_by(status='pending').scalar()
        completed_count = db.session.query(db.func.count(Donation.id)).filter_by(status='completed').scalar()
        
        return jsonify({
            'total_donations': total_donations,
            'total_amount': float(total_amount),
            'pending_count': pending_count,
            'completed_count': completed_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
