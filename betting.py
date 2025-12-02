from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Sport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    events = db.relationship('Event', backref='sport', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'is_active': self.is_active
        }

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sport_id = db.Column(db.Integer, db.ForeignKey('sport.id'), nullable=False)
    home_team = db.Column(db.String(100), nullable=False)
    away_team = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='upcoming')  # upcoming, live, finished, cancelled
    home_score = db.Column(db.Integer, default=0)
    away_score = db.Column(db.Integer, default=0)
    
    # Relationships
    betting_options = db.relationship('BettingOption', backref='event', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'sport_id': self.sport_id,
            'sport_name': self.sport.name if self.sport else None,
            'home_team': self.home_team,
            'away_team': self.away_team,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'status': self.status,
            'home_score': self.home_score,
            'away_score': self.away_score
        }

class BettingOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    option_type = db.Column(db.String(50), nullable=False)  # win, draw, over_under, etc.
    option_value = db.Column(db.String(100), nullable=False)  # home, away, over 2.5, etc.
    odds = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    bets = db.relationship('Bet', backref='betting_option', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'option_type': self.option_type,
            'option_value': self.option_value,
            'odds': self.odds,
            'is_active': self.is_active
        }

class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    betting_option_id = db.Column(db.Integer, db.ForeignKey('betting_option.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    odds = db.Column(db.Float, nullable=False)
    potential_payout = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, won, lost, cancelled
    placed_at = db.Column(db.DateTime, default=datetime.utcnow)
    settled_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'betting_option_id': self.betting_option_id,
            'amount': self.amount,
            'odds': self.odds,
            'potential_payout': self.potential_payout,
            'status': self.status,
            'placed_at': self.placed_at.isoformat() if self.placed_at else None,
            'settled_at': self.settled_at.isoformat() if self.settled_at else None
        }

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # deposit, withdrawal, bet, payout
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

