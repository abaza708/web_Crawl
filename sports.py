from flask import Blueprint, jsonify, request
from src.models.betting import Sport, Event, BettingOption, db
from datetime import datetime, timedelta

sports_bp = Blueprint('sports', __name__)

@sports_bp.route('/sports', methods=['GET'])
def get_sports():
    try:
        sports = Sport.query.filter_by(is_active=True).all()
        return jsonify([sport.to_dict() for sport in sports]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sports_bp.route('/sports/<int:sport_id>/events', methods=['GET'])
def get_events_by_sport(sport_id):
    try:
        status = request.args.get('status', 'upcoming')
        events = Event.query.filter_by(sport_id=sport_id, status=status).all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sports_bp.route('/events', methods=['GET'])
def get_events():
    try:
        status = request.args.get('status', 'upcoming')
        limit = request.args.get('limit', 50, type=int)
        
        events = Event.query.filter_by(status=status).limit(limit).all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sports_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        betting_options = BettingOption.query.filter_by(event_id=event_id, is_active=True).all()
        
        event_data = event.to_dict()
        event_data['betting_options'] = [option.to_dict() for option in betting_options]
        
        return jsonify(event_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sports_bp.route('/events/live', methods=['GET'])
def get_live_events():
    try:
        events = Event.query.filter_by(status='live').all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sports_bp.route('/events/popular', methods=['GET'])
def get_popular_events():
    try:
        # Get events starting in the next 24 hours
        tomorrow = datetime.utcnow() + timedelta(days=1)
        events = Event.query.filter(
            Event.start_time <= tomorrow,
            Event.status == 'upcoming'
        ).limit(10).all()
        
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin routes for creating sample data
@sports_bp.route('/admin/sports', methods=['POST'])
def create_sport():
    try:
        data = request.json
        sport = Sport(
            name=data['name'],
            icon=data.get('icon', ''),
            is_active=data.get('is_active', True)
        )
        db.session.add(sport)
        db.session.commit()
        return jsonify(sport.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sports_bp.route('/admin/events', methods=['POST'])
def create_event():
    try:
        data = request.json
        event = Event(
            sport_id=data['sport_id'],
            home_team=data['home_team'],
            away_team=data['away_team'],
            start_time=datetime.fromisoformat(data['start_time']),
            status=data.get('status', 'upcoming')
        )
        db.session.add(event)
        db.session.commit()
        
        # Create default betting options
        betting_options = [
            BettingOption(event_id=event.id, option_type='win', option_value='home', odds=2.1),
            BettingOption(event_id=event.id, option_type='win', option_value='away', odds=3.2),
            BettingOption(event_id=event.id, option_type='win', option_value='draw', odds=3.5),
        ]
        
        for option in betting_options:
            db.session.add(option)
        
        db.session.commit()
        
        return jsonify(event.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

