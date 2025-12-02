#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from src.main import app
from src.models.user import db
from src.models.betting import Sport, Event, BettingOption

def populate_sample_data():
    with app.app_context():
        # Clear existing data
        BettingOption.query.delete()
        Event.query.delete()
        Sport.query.delete()
        
        # Create sports
        sports_data = [
            {'name': 'Football', 'icon': '⚽'},
            {'name': 'Basketball', 'icon': '🏀'},
            {'name': 'Tennis', 'icon': '🎾'},
            {'name': 'Baseball', 'icon': '⚾'},
            {'name': 'Hockey', 'icon': '🏒'},
            {'name': 'Boxing', 'icon': '🥊'},
            {'name': 'MMA', 'icon': '🥋'},
            {'name': 'Cricket', 'icon': '🏏'},
        ]
        
        sports = []
        for sport_data in sports_data:
            sport = Sport(name=sport_data['name'], icon=sport_data['icon'])
            db.session.add(sport)
            sports.append(sport)
        
        db.session.commit()
        
        # Create events
        now = datetime.utcnow()
        events_data = [
            # Football events
            {
                'sport_id': sports[0].id,
                'home_team': 'Manchester United',
                'away_team': 'Liverpool',
                'start_time': now + timedelta(hours=2),
                'status': 'upcoming'
            },
            {
                'sport_id': sports[0].id,
                'home_team': 'Barcelona',
                'away_team': 'Real Madrid',
                'start_time': now + timedelta(hours=5),
                'status': 'upcoming'
            },
            {
                'sport_id': sports[0].id,
                'home_team': 'Chelsea',
                'away_team': 'Arsenal',
                'start_time': now + timedelta(minutes=30),
                'status': 'live'
            },
            # Basketball events
            {
                'sport_id': sports[1].id,
                'home_team': 'Lakers',
                'away_team': 'Warriors',
                'start_time': now + timedelta(hours=3),
                'status': 'upcoming'
            },
            {
                'sport_id': sports[1].id,
                'home_team': 'Bulls',
                'away_team': 'Celtics',
                'start_time': now + timedelta(hours=6),
                'status': 'upcoming'
            },
            # Tennis events
            {
                'sport_id': sports[2].id,
                'home_team': 'Novak Djokovic',
                'away_team': 'Rafael Nadal',
                'start_time': now + timedelta(hours=4),
                'status': 'upcoming'
            },
            {
                'sport_id': sports[2].id,
                'home_team': 'Serena Williams',
                'away_team': 'Naomi Osaka',
                'start_time': now + timedelta(hours=7),
                'status': 'upcoming'
            },
            # Baseball events
            {
                'sport_id': sports[3].id,
                'home_team': 'Yankees',
                'away_team': 'Red Sox',
                'start_time': now + timedelta(hours=8),
                'status': 'upcoming'
            },
        ]
        
        events = []
        for event_data in events_data:
            event = Event(**event_data)
            db.session.add(event)
            events.append(event)
        
        db.session.commit()
        
        # Create betting options for each event
        for event in events:
            if event.sport.name in ['Football', 'Basketball', 'Baseball', 'Hockey']:
                # Team sports with draw possibility (except basketball and baseball)
                if event.sport.name == 'Football':
                    betting_options = [
                        BettingOption(event_id=event.id, option_type='win', option_value='home', odds=2.1),
                        BettingOption(event_id=event.id, option_type='win', option_value='away', odds=3.2),
                        BettingOption(event_id=event.id, option_type='win', option_value='draw', odds=3.5),
                        BettingOption(event_id=event.id, option_type='total_goals', option_value='over_2.5', odds=1.8),
                        BettingOption(event_id=event.id, option_type='total_goals', option_value='under_2.5', odds=2.0),
                    ]
                else:
                    # Basketball, Baseball, Hockey (no draw)
                    betting_options = [
                        BettingOption(event_id=event.id, option_type='win', option_value='home', odds=1.9),
                        BettingOption(event_id=event.id, option_type='win', option_value='away', odds=1.9),
                        BettingOption(event_id=event.id, option_type='total_points', option_value='over_200', odds=1.85),
                        BettingOption(event_id=event.id, option_type='total_points', option_value='under_200', odds=1.95),
                    ]
            else:
                # Individual sports like Tennis, Boxing, MMA
                betting_options = [
                    BettingOption(event_id=event.id, option_type='win', option_value='home', odds=1.7),
                    BettingOption(event_id=event.id, option_type='win', option_value='away', odds=2.1),
                    BettingOption(event_id=event.id, option_type='sets', option_value='over_3.5', odds=2.2),
                    BettingOption(event_id=event.id, option_type='sets', option_value='under_3.5', odds=1.6),
                ]
            
            for option_data in betting_options:
                db.session.add(option_data)
        
        db.session.commit()
        
        print("Sample data populated successfully!")
        print(f"Created {len(sports)} sports")
        print(f"Created {len(events)} events")
        print(f"Created betting options for all events")

if __name__ == '__main__':
    populate_sample_data()

