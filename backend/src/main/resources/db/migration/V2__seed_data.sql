-- =============================================
-- EraMix — V2: Seed initial catalogue data
-- =============================================

-- -----------------------------------------------
-- Idiomas (ISO 639-1)
-- -----------------------------------------------
INSERT INTO language (code, name) VALUES
('en', 'English'),
('es', 'Spanish'),
('fr', 'French'),
('de', 'German'),
('it', 'Italian'),
('pt', 'Portuguese'),
('nl', 'Dutch'),
('pl', 'Polish'),
('ro', 'Romanian'),
('sv', 'Swedish'),
('da', 'Danish'),
('fi', 'Finnish'),
('el', 'Greek'),
('cs', 'Czech'),
('hu', 'Hungarian'),
('hr', 'Croatian'),
('bg', 'Bulgarian'),
('sk', 'Slovak'),
('sl', 'Slovenian'),
('et', 'Estonian'),
('lv', 'Latvian'),
('lt', 'Lithuanian'),
('ga', 'Irish'),
('mt', 'Maltese'),
('tr', 'Turkish'),
('no', 'Norwegian'),
('uk', 'Ukrainian'),
('ru', 'Russian'),
('ar', 'Arabic'),
('zh', 'Chinese');

-- -----------------------------------------------
-- Intereses
-- -----------------------------------------------
INSERT INTO interest (name, category, emoji) VALUES
-- Deportes
('Football', 'SPORTS', '⚽'),
('Basketball', 'SPORTS', '🏀'),
('Tennis', 'SPORTS', '🎾'),
('Swimming', 'SPORTS', '🏊'),
('Running', 'SPORTS', '🏃'),
('Cycling', 'SPORTS', '🚴'),
('Yoga', 'SPORTS', '🧘'),
('Hiking', 'SPORTS', '🥾'),
('Volleyball', 'SPORTS', '🏐'),
('Skiing', 'SPORTS', '⛷️'),
-- Música
('Rock', 'MUSIC', '🎸'),
('Electronic', 'MUSIC', '🎧'),
('Jazz', 'MUSIC', '🎷'),
('Classical', 'MUSIC', '🎻'),
('Pop', 'MUSIC', '🎤'),
('Hip Hop', 'MUSIC', '🎶'),
-- Arte y Cultura
('Photography', 'ART', '📷'),
('Painting', 'ART', '🎨'),
('Cinema', 'ART', '🎬'),
('Theater', 'ART', '🎭'),
('Literature', 'ART', '📚'),
('Museums', 'ART', '🏛️'),
-- Gastronomía
('Cooking', 'FOOD', '👨‍🍳'),
('Wine Tasting', 'FOOD', '🍷'),
('Coffee', 'FOOD', '☕'),
('Street Food', 'FOOD', '🌮'),
('Vegetarian', 'FOOD', '🥗'),
('Baking', 'FOOD', '🧁'),
-- Viajes
('Backpacking', 'TRAVEL', '🎒'),
('Beach', 'TRAVEL', '🏖️'),
('City Trips', 'TRAVEL', '🏙️'),
('Road Trips', 'TRAVEL', '🚗'),
('Cultural Tourism', 'TRAVEL', '🗺️'),
-- Tecnología
('Programming', 'TECH', '💻'),
('Gaming', 'TECH', '🎮'),
('AI & ML', 'TECH', '🤖'),
('Startups', 'TECH', '🚀'),
('Blockchain', 'TECH', '🔗'),
-- Idiomas
('Language Exchange', 'LANGUAGES', '🗣️'),
('Tandem Partners', 'LANGUAGES', '🤝'),
-- Social
('Volunteering', 'SOCIAL', '❤️'),
('Nightlife', 'SOCIAL', '🌃'),
('Board Games', 'SOCIAL', '🎲'),
('Book Club', 'SOCIAL', '📖');

-- -----------------------------------------------
-- Universidades europeas populares en Erasmus+
-- -----------------------------------------------
INSERT INTO university (name, city, country, latitude, longitude) VALUES
-- España
('Universidad de Granada', 'Granada', 'Spain', 37.1773363, -3.5985571),
('Universidad Complutense de Madrid', 'Madrid', 'Spain', 40.4492352, -3.7266747),
('Universitat de Barcelona', 'Barcelona', 'Spain', 41.3862268, 2.1649876),
('Universidad de Sevilla', 'Seville', 'Spain', 37.3616284, -5.9867089),
('Universidad de Valencia', 'Valencia', 'Spain', 39.4799019, -0.3627157),
('Universidad de Salamanca', 'Salamanca', 'Spain', 40.9627274, -5.6694778),
-- Italia
('Università di Bologna', 'Bologna', 'Italy', 44.4963935, 11.3563533),
('Sapienza Università di Roma', 'Rome', 'Italy', 41.9017382, 12.5133816),
('Politecnico di Milano', 'Milan', 'Italy', 45.4783597, 9.2275791),
('Università degli Studi di Padova', 'Padua', 'Italy', 45.4077172, 11.8768444),
-- Francia
('Sorbonne Université', 'Paris', 'France', 48.8487948, 2.3466729),
('Université de Strasbourg', 'Strasbourg', 'France', 48.5799275, 7.7639834),
('Université de Lyon', 'Lyon', 'France', 45.7578137, 4.8320114),
('Université de Montpellier', 'Montpellier', 'France', 43.6311532, 3.8625715),
-- Alemania
('Technische Universität München', 'Munich', 'Germany', 48.1497437, 11.5685414),
('Humboldt-Universität zu Berlin', 'Berlin', 'Germany', 52.5182606, 13.3936229),
('Universität Heidelberg', 'Heidelberg', 'Germany', 49.4105226, 8.7066448),
('Freie Universität Berlin', 'Berlin', 'Germany', 52.4526529, 13.2904779),
-- Portugal
('Universidade de Lisboa', 'Lisbon', 'Portugal', 38.7533591, -9.1571357),
('Universidade do Porto', 'Porto', 'Portugal', 41.1527671, -8.6393921),
-- Países Bajos
('Universiteit van Amsterdam', 'Amsterdam', 'Netherlands', 52.3558539, 4.9558482),
('Universiteit Utrecht', 'Utrecht', 'Netherlands', 52.0855221, 5.1685898),
-- Polonia
('Uniwersytet Jagielloński', 'Krakow', 'Poland', 50.0617866, 19.9354107),
('Uniwersytet Warszawski', 'Warsaw', 'Poland', 52.2396759, 21.0152025),
-- Otros
('Charles University', 'Prague', 'Czech Republic', 50.0857599, 14.4171071),
('University of Vienna', 'Vienna', 'Austria', 48.2131698, 16.3609116),
('University of Copenhagen', 'Copenhagen', 'Denmark', 55.6801622, 12.5724616),
('KU Leuven', 'Leuven', 'Belgium', 50.8776379, 4.7004176),
('University of Helsinki', 'Helsinki', 'Finland', 60.1709813, 24.9416023),
('Trinity College Dublin', 'Dublin', 'Ireland', 53.3437935, -6.2546186);
