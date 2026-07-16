import os
import random
import string
import sqlite3
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all origins

# Vercel serverless environments have a read-only filesystem except for /tmp
if "VERCEL" in os.environ:
    DATABASE = '/tmp/shop.db'
else:
    DATABASE = 'shop.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db_dir = os.path.dirname(DATABASE)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    conn = get_db()
    cursor = conn.cursor()
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            price REAL,
            icon TEXT,
            tag TEXT,
            description TEXT,
            features TEXT,
            image_url TEXT
        )
    ''')
    
    # Create orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE,
            items TEXT,
            total_price REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Seed data
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        seed_products = [
            (
                "WORK STATION (For Kids)",
                1000.00,
                "fas fa-briefcase",
                "Electronics Kit",
                "A fun and educational workshop organizer specifically designed for kids. It helps children learn the basics of assembly, organization, and safety when working on small electronics and robotics projects.",
                "Built-in tool storage slots and compartments|Sturdy, child-safe structural material|Perfect companion for DIY electronics projects",
                "images/WhatsApp Image 2026-07-13 at 1.22.24 PM.jpeg"
            ),
            (
                "IOT Trainer Kit",
                5299.00,
                "fas fa-microchip",
                "IoT Development",
                "A comprehensive educational trainer kit for learning IoT concepts and cloud integrations. Equipped with development boards and a wide array of sensors.",
                "ESP32 core development board with Wi-Fi & Bluetooth|Sensors: Temperature, Humidity, Soil Moisture, and Ultrasonic|128x64 OLED Display and dynamic RGB LED controls|Full guide and code templates included",
                "images/IOT Trainer Kit.png"
            ),
            (
                "AUDAPS — Underwater Platform",
                12000.00,
                "fas fa-water",
                "Marine Technology",
                "Our premier autonomous data collection platform designed for sub-surface monitoring. Configurable with custom scientific sensor payloads.",
                "IP68 rated modular structural body|Sensors: Water Temperature, Turbidity, and pH levels|Continuous data logging to internal flash memory|Wireless data transmission when surfaced",
                "images/AUDAPS 3.png"
            ),
            (
                "Robotic Dog Kit",
                1000.00,
                "fas fa-dog",
                "Robotics Kit",
                "An interactive, quadruped robot kit that teaches servo control, motor alignment, and basic walk cycle coding.",
                "4-legged chassis with SG90 micro servos|Ultrasonic sensor for obstacle avoidance|Programmable walk, sit, and dance sequences|Easy assembly with screw-together parts",
                "images/Robotic dog.png"
            )
        ]
        cursor.executemany('''
            INSERT INTO products (name, price, icon, tag, description, features, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', seed_products)
        conn.commit()
        
    conn.close()

# Initialize DB on startup
init_db()

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products")
        rows = cursor.fetchall()
        products = []
        for row in rows:
            products.append({
                'id': row['id'],
                'name': row['name'],
                'price': row['price'],
                'icon': row['icon'],
                'tag': row['tag'],
                'description': row['description'],
                'features': row['features'].split('|') if row['features'] else [],
                'image_url': row['image_url']
            })
        conn.close()
        return jsonify(products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        if not data or 'items' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        items = data['items']
        total_price = sum(item.get('price', 0) * item.get('qty', 1) for item in items)
        
        # Generate a unique Order ID: ORY-XXXXXX
        digits = ''.join(random.choices(string.digits, k=6))
        order_id = f"ORY-{digits}"
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Save order to DB
        cursor.execute('''
            INSERT INTO orders (order_id, items, total_price)
            VALUES (?, ?, ?)
        ''', (order_id, json.dumps(items), total_price))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'order_id': order_id,
            'total_price': total_price
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
