import os
from flask import Flask
from src.models.user import db
from src.models.betting import Sport, Event, BettingOption, Bet, Transaction

# Create a Flask app context for database operations
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'abazabet-backend', 'src', 'database', 'app.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    # Drop all existing tables
    db.drop_all()
    print("Dropped all existing database tables.")

    # Create all tables
    db.create_all()
    print("Created all database tables.")

    # Populate sample data
    print("Populating sample data...")

    # Sports
    sports_data = [
        {"name": "Football"},
        {"name": "Basketball"},
        {"name": "Tennis"},
        {"name": "Baseball"},
        {"name": "Soccer"},
        {"name": "Hockey"},
        {"name": "Boxing"},
        {"name": "Golf"},
    ]
    sports = []
    for s_data in sports_data:
        sport = Sport(**s_data)
        db.session.add(sport)
        sports.append(sport)
    db.session.commit()
    print(f"Created {len(sports)} sports.")

    # Events
    events_data = [
        {"home_team": "Chelsea", "away_team": "Arsenal", "sport_id": sports[0].id, "start_time": "2025-07-01T19:00:00Z", "status": "live"},
        {"home_team": "Lakers", "away_team": "Warriors", "sport_id": sports[1].id, "start_time": "2025-07-02T20:00:00Z", "status": "upcoming"},
        {"home_team": "Novak Djokovic", "away_team": "Rafael Nadal", "sport_id": sports[2].id, "start_time": "2025-07-03T14:00:00Z", "status": "upcoming"},
        {"home_team": "Yankees", "away_team": "Red Sox", "sport_id": sports[3].id, "start_time": "2025-07-04T18:00:00Z", "status": "upcoming"},
        {"home_team": "Barcelona", "away_team": "Real Madrid", "sport_id": sports[0].id, "start_time": "2025-07-05T21:00:00Z", "status": "upcoming"},
        {"home_team": "Bulls", "away_team": "Celtics", "sport_id": sports[1].id, "start_time": "2025-07-06T19:30:00Z", "status": "upcoming"},
        {"home_team": "Serena Williams", "away_team": "Naomi Osaka", "sport_id": sports[2].id, "start_time": "2025-07-07T15:00:00Z", "status": "upcoming"},
        {"home_team": "Dodgers", "away_team": "Giants", "sport_id": sports[3].id, "start_time": "2025-07-08T17:00:00Z", "status": "upcoming"},
    ]
    events = []
    for e_data in events_data:
        event = Event(**e_data)
        db.session.add(event)
        events.append(event)
    db.session.commit()
    print(f"Created {len(events)} events.")

    # Betting Options (simplified for example)
    betting_options_data = [
        {"event_id": events[0].id, "option_name": "Home Win", "option_value": "1", "odds": 2.10},
        {"event_id": events[0].id, "option_name": "Draw", "option_value": "X", "odds": 3.50},
        {"event_id": events[0].id, "option_name": "Away Win", "option_value": "2", "odds": 3.20},
        {"event_id": events[1].id, "option_name": "Home Win", "option_value": "1", "odds": 1.80},
        {"event_id": events[1].id, "option_name": "Away Win", "option_value": "2", "odds": 2.50},
    ]
    for bo_data in betting_options_data:
        betting_option = BettingOption(**bo_data)
        db.session.add(betting_option)
    db.session.commit()
    print("Populated betting options.")

    print("Database setup and sample data populated successfully!")


