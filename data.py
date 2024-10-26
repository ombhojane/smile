import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from faker import Faker
import string

# Set random seed for reproducibility
np.random.seed(42)
fake = Faker(['en_IN', 'hi_IN'])  # Using multiple Indian locales
Faker.seed(42)

def generate_unique_phone():
    """Generate unique Indian format phone numbers"""
    prefixes = ['91', '92', '93', '94', '95', '96', '97', '98', '99', '70', '80', '89']
    used_numbers = set()
    
    def generate_number():
        prefix = random.choice(prefixes)
        suffix = ''.join(random.choices(string.digits, k=8))
        return f"+91-{prefix}{suffix}"
    
    number = generate_number()
    while number in used_numbers:
        number = generate_number()
    used_numbers.add(number)
    return number

# Expanded lists for more variety
occupations = [
    'Software Engineer', 'Data Scientist', 'Doctor', 'Surgeon', 'Teacher', 'Professor',
    'Business Owner', 'Entrepreneur', 'Student', 'Sales Executive', 'Marketing Manager',
    'Consultant', 'Retired', 'Homemaker', 'Manager', 'Architect', 'Designer',
    'Financial Analyst', 'Lawyer', 'Chef', 'Artist', 'Writer', 'Journalist',
    'HR Professional', 'Accountant', 'Civil Engineer', 'Pharmacist', 'Real Estate Agent'
]

cities_by_region = {
    'North': [
        'Delhi', 'Gurgaon', 'Noida', 'Chandigarh', 'Lucknow', 'Kanpur', 'Jaipur',
        'Varanasi', 'Agra', 'Dehradun', 'Meerut', 'Amritsar', 'Ludhiana'
    ],
    'South': [
        'Bangalore', 'Chennai', 'Hyderabad', 'Mysore', 'Coimbatore', 'Kochi',
        'Thiruvananthapuram', 'Visakhapatnam', 'Mangalore', 'Madurai', 'Ooty'
    ],
    'East': [
        'Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati', 'Ranchi', 'Siliguri',
        'Cuttack', 'Asansol', 'Dhanbad', 'Gangtok'
    ],
    'West': [
        'Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Vadodara', 'Nashik', 'Nagpur',
        'Indore', 'Bhopal', 'Raipur', 'Goa'
    ]
}

states_by_region = {
    'North': ['Delhi', 'Uttar Pradesh', 'Rajasthan', 'Punjab', 'Haryana', 'Uttarakhand'],
    'South': ['Karnataka', 'Tamil Nadu', 'Telangana', 'Kerala', 'Andhra Pradesh'],
    'East': ['West Bengal', 'Odisha', 'Bihar', 'Assam', 'Jharkhand'],
    'West': ['Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Goa', 'Chhattisgarh']
}

product_categories = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Smartwatches', 'Headphones', 'Cameras', 'Gaming Consoles'],
    'Clothing': ['Casual Wear', 'Formal Wear', 'Ethnic Wear', 'Sports Wear', 'Winter Wear', 'Accessories'],
    'Home Decor': ['Furniture', 'Lighting', 'Wall Art', 'Carpets', 'Plants', 'Kitchen Decor'],
    'Beauty': ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Organic Products'],
    'Books': ['Fiction', 'Non-Fiction', 'Academic', 'Self-Help', 'Children Books'],
    'Sports': ['Fitness Equipment', 'Sports Gear', 'Outdoor Equipment', 'Yoga Accessories'],
    'Kitchen': ['Appliances', 'Cookware', 'Dining', 'Storage', 'Small Appliances']
}

payment_methods = {
    'Digital': ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'Mobile Wallet'],
    'Traditional': ['Cash on Delivery', 'Bank Transfer', 'EMI', 'Gift Card']
}

festivals_by_region = {
    'North': ['Diwali', 'Holi', 'Lohri', 'Karva Chauth', 'Dussehra'],
    'South': ['Pongal', 'Onam', 'Ugadi', 'Sankranti', 'Navratri'],
    'East': ['Durga Puja', 'Chhath', 'Bihu', 'Jagannath Rath Yatra'],
    'West': ['Ganesh Chaturthi', 'Gudi Padwa', 'Navratri', 'Diwali']
}

languages_by_region = {
    'North': ['Hindi', 'Punjabi', 'Haryanvi', 'English'],
    'South': ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'English'],
    'East': ['Bengali', 'Odia', 'Assamese', 'English'],
    'West': ['Marathi', 'Gujarati', 'Hindi', 'English']
}

channels = ['Email', 'SMS', 'WhatsApp', 'Phone Call', 'Social Media', 'Mobile App', 
           'Website', 'Direct Mail', 'Video Call', 'In-Store']

segments = {
    'Value': ['Budget Buyer', 'Value Seeker', 'Discount Hunter', 'Seasonal Shopper'],
    'Premium': ['Luxury Buyer', 'Premium Member', 'VIP Customer', 'High-Value Client'],
    'Loyalty': ['Loyal Customer', 'Regular Buyer', 'Brand Advocate', 'Long-term Client'],
    'New': ['New Customer', 'First-time Buyer', 'Trial User', 'Recent Convert']
}

def generate_crm_data(n_records=1000):
    """Generate synthetic CRM data with realistic relationships between fields"""
    
    data = []
    for i in range(n_records):
        # Select region first to maintain geographical consistency
        region = np.random.choice(list(cities_by_region.keys()))
        city = np.random.choice(cities_by_region[region])
        state = np.random.choice(states_by_region[region])
        
        # Select age group and create appropriate occupation probability
        age_group = np.random.choice(['18-25', '26-35', '36-45', '46-55', '55+'])
        if age_group == '18-25':
            occupation_weights = [3 if x in ['Student', 'Software Engineer', 'Sales Executive'] else 1 for x in occupations]
        elif age_group == '55+':
            occupation_weights = [3 if x in ['Retired', 'Business Owner', 'Consultant'] else 1 for x in occupations]
        else:
            occupation_weights = [1 for _ in occupations]
        occupation = np.random.choice(occupations, p=np.array(occupation_weights)/sum(occupation_weights))
        
        # Generate purchase details
        main_category = np.random.choice(list(product_categories.keys()))
        product = f"{main_category} - {np.random.choice(product_categories[main_category])}"
        
        # Determine payment method based on age
        if age_group in ['18-25', '26-35']:
            payment_type = 'Digital'
        else:
            payment_type = np.random.choice(['Digital', 'Traditional'], p=[0.7, 0.3])
        payment = np.random.choice(payment_methods[payment_type])
        
        # Create realistic purchase amount based on product category and segment
        base_amount = {
            'Electronics': (15000, 150000),
            'Clothing': (1000, 15000),
            'Home Decor': (2000, 50000),
            'Beauty': (500, 10000),
            'Books': (200, 2000),
            'Sports': (1000, 20000),
            'Kitchen': (1000, 30000)
        }
        min_amt, max_amt = base_amount[main_category]
        purchase_amount = round(random.uniform(min_amt, max_amt), -2)  # Round to nearest 100
        
        # Select segment based on purchase amount and frequency
        if purchase_amount > max_amt * 0.8:
            segment_type = 'Premium'
        elif purchase_amount < min_amt * 1.2:
            segment_type = 'Value'
        else:
            segment_type = np.random.choice(['Value', 'Premium', 'Loyalty', 'New'])
        segment = np.random.choice(segments[segment_type])
        
        # Generate dates
        created_date = datetime.now() - timedelta(days=random.randint(30, 730))
        purchase_date = created_date + timedelta(days=random.randint(1, 365))
        
        # Create record
        record = {
            'ContactID': f'CID{str(i+1).zfill(5)}',
            'FullName': fake.name(),
            'Email': fake.email(),
            'Phone': generate_unique_phone(),
            'Gender': np.random.choice(['M', 'F']),
            'AgeGroup': age_group,
            'Occupation': occupation,
            'City': city,
            'State': state,
            'Region': region,
            'Tier': 'Tier 1' if city in ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'] else 
                   'Tier 2' if city in ['Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'] else 'Tier 3',
            'PurchaseID': f'PID{str(i+1).zfill(5)}',
            'ProductCategory': main_category,
            'ProductName': product,
            'PurchaseAmount': purchase_amount,
            'PurchaseDate': purchase_date.strftime('%Y-%m-%d'),
            'PaymentMethod': payment,
            'PreferredChannel': np.random.choice(channels),
            'PreferredLanguage': np.random.choice(languages_by_region[region]),
            'ContactFrequency': np.random.choice(['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly']),
            'Rating': np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.1, 0.15, 0.3, 0.4]),
            'Sentiment': np.random.choice(['Positive', 'Neutral', 'Negative'], p=[0.6, 0.3, 0.1]),
            'PreferredFestival': np.random.choice(festivals_by_region[region]),
            'SegmentName': segment,
            'CreatedDate': created_date.strftime('%Y-%m-%d')
        }
        data.append(record)
    
    return pd.DataFrame(data)

# Generate data
df = generate_crm_data(1000)

# Export to CSV
df.to_csv('crm_synthetic_data.csv', index=False)

# Display summary statistics
print("\nDataset Summary:")
print(f"Total Records: {len(df)}")
print("\nSample of unique values per column:")
for column in df.columns:
    unique_count = df[column].nunique()
    print(f"{column}: {unique_count} unique values")

# Display some basic analytics
print("\nRegional Distribution:")
print(df['Region'].value_counts(normalize=True))

print("\nSegment Distribution:")
print(df['SegmentName'].value_counts(normalize=True))

print("\nAverage Purchase Amount by Segment:")
print(df.groupby('SegmentName')['PurchaseAmount'].mean().round(2))