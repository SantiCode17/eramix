import { create } from "zustand";
import { fetchCountryStats } from "@/api/globe";
import type { CountryStats, CountryPin } from "@/types/globe";

// ── Static worldwide Erasmus+ data ───────────────────────────────────────────
// Garantiza que el globo siempre tenga pins en todos los continentes,
// incluso sin conexión al backend. El API los sobreescribirá cuando responda.
let _uid = 1000;
const uid = () => _uid++;

const WORLDWIDE_PINS: CountryPin[] = [
  // ════ EUROPA ════
  {
    country: "Spain", latitude: 40.4, longitude: -3.7, studentCount: 1340,
    universities: [
      { id: uid(), name: "Universidad Complutense de Madrid", city: "Madrid", latitude: 40.44, longitude: -3.72, studentCount: 340 },
      { id: uid(), name: "Universitat de Barcelona", city: "Barcelona", latitude: 41.39, longitude: 2.15, studentCount: 310 },
      { id: uid(), name: "Universidad de Sevilla", city: "Sevilla", latitude: 37.38, longitude: -5.97, studentCount: 230 },
      { id: uid(), name: "Universidad de Valencia", city: "Valencia", latitude: 39.47, longitude: -0.38, studentCount: 200 },
      { id: uid(), name: "Universidad de Salamanca", city: "Salamanca", latitude: 40.96, longitude: -5.66, studentCount: 260 },
    ],
  },
  {
    country: "Italy", latitude: 41.9, longitude: 12.5, studentCount: 1050,
    universities: [
      { id: uid(), name: "La Sapienza Università di Roma", city: "Roma", latitude: 41.90, longitude: 12.51, studentCount: 290 },
      { id: uid(), name: "Università degli Studi di Milano", city: "Milán", latitude: 45.46, longitude: 9.19, studentCount: 260 },
      { id: uid(), name: "Università di Bologna", city: "Bolonia", latitude: 44.49, longitude: 11.34, studentCount: 240 },
      { id: uid(), name: "Università degli Studi di Firenze", city: "Florencia", latitude: 43.77, longitude: 11.25, studentCount: 160 },
      { id: uid(), name: "Politecnico di Milano", city: "Milán", latitude: 45.48, longitude: 9.23, studentCount: 100 },
    ],
  },
  {
    country: "France", latitude: 48.8, longitude: 2.3, studentCount: 970,
    universities: [
      { id: uid(), name: "Université Paris-Sorbonne", city: "París", latitude: 48.85, longitude: 2.34, studentCount: 280 },
      { id: uid(), name: "Sciences Po", city: "París", latitude: 48.85, longitude: 2.31, studentCount: 210 },
      { id: uid(), name: "Université Aix-Marseille", city: "Marsella", latitude: 43.30, longitude: 5.38, studentCount: 190 },
      { id: uid(), name: "Université Lyon 1", city: "Lyon", latitude: 45.78, longitude: 4.86, studentCount: 170 },
      { id: uid(), name: "Université de Bordeaux", city: "Burdeos", latitude: 44.84, longitude: -0.58, studentCount: 120 },
    ],
  },
  {
    country: "Germany", latitude: 52.5, longitude: 13.4, studentCount: 1120,
    universities: [
      { id: uid(), name: "Freie Universität Berlin", city: "Berlín", latitude: 52.45, longitude: 13.29, studentCount: 310 },
      { id: uid(), name: "LMU München", city: "Múnich", latitude: 48.15, longitude: 11.58, studentCount: 290 },
      { id: uid(), name: "Universität Hamburg", city: "Hamburgo", latitude: 53.56, longitude: 9.97, studentCount: 220 },
      { id: uid(), name: "Ruprecht-Karls-Universität Heidelberg", city: "Heidelberg", latitude: 49.41, longitude: 8.71, studentCount: 180 },
      { id: uid(), name: "RWTH Aachen University", city: "Aquisgrán", latitude: 50.78, longitude: 6.07, studentCount: 120 },
    ],
  },
  {
    country: "Portugal", latitude: 38.7, longitude: -9.1, studentCount: 760,
    universities: [
      { id: uid(), name: "Universidade de Lisboa", city: "Lisboa", latitude: 38.75, longitude: -9.14, studentCount: 280 },
      { id: uid(), name: "Universidade do Porto", city: "Oporto", latitude: 41.15, longitude: -8.61, studentCount: 240 },
      { id: uid(), name: "Universidade de Coimbra", city: "Coímbra", latitude: 40.21, longitude: -8.42, studentCount: 150 },
      { id: uid(), name: "Universidade Nova de Lisboa", city: "Lisboa", latitude: 38.66, longitude: -9.21, studentCount: 90 },
    ],
  },
  {
    country: "Netherlands", latitude: 52.1, longitude: 5.3, studentCount: 840,
    universities: [
      { id: uid(), name: "Universiteit van Amsterdam", city: "Ámsterdam", latitude: 52.36, longitude: 4.91, studentCount: 310 },
      { id: uid(), name: "Delft University of Technology", city: "Delft", latitude: 52.00, longitude: 4.36, studentCount: 240 },
      { id: uid(), name: "Leiden University", city: "Leiden", latitude: 52.15, longitude: 4.48, studentCount: 180 },
      { id: uid(), name: "Erasmus University Rotterdam", city: "Rotterdam", latitude: 51.91, longitude: 4.47, studentCount: 110 },
    ],
  },
  {
    country: "Poland", latitude: 52.2, longitude: 21.0, studentCount: 680,
    universities: [
      { id: uid(), name: "Uniwersytet Warszawski", city: "Varsovia", latitude: 52.24, longitude: 21.01, studentCount: 240 },
      { id: uid(), name: "Jagiellonian University", city: "Cracovia", latitude: 50.06, longitude: 19.94, studentCount: 220 },
      { id: uid(), name: "AGH University of Science", city: "Cracovia", latitude: 50.07, longitude: 19.91, studentCount: 130 },
      { id: uid(), name: "Politechnika Warszawska", city: "Varsovia", latitude: 52.22, longitude: 21.01, studentCount: 90 },
    ],
  },
  {
    country: "Czech Republic", latitude: 50.1, longitude: 14.4, studentCount: 560,
    universities: [
      { id: uid(), name: "Charles University Prague", city: "Praga", latitude: 50.07, longitude: 14.42, studentCount: 230 },
      { id: uid(), name: "Czech Technical University", city: "Praga", latitude: 50.10, longitude: 14.39, studentCount: 180 },
      { id: uid(), name: "Masaryk University", city: "Brno", latitude: 49.21, longitude: 16.61, studentCount: 150 },
    ],
  },
  {
    country: "Austria", latitude: 48.2, longitude: 16.4, studentCount: 610,
    universities: [
      { id: uid(), name: "Universität Wien", city: "Viena", latitude: 48.21, longitude: 16.35, studentCount: 270 },
      { id: uid(), name: "TU Wien", city: "Viena", latitude: 48.20, longitude: 16.37, studentCount: 200 },
      { id: uid(), name: "Karl-Franzens-Universität Graz", city: "Graz", latitude: 47.08, longitude: 15.45, studentCount: 140 },
    ],
  },
  {
    country: "Denmark", latitude: 55.7, longitude: 12.6, studentCount: 490,
    universities: [
      { id: uid(), name: "University of Copenhagen", city: "Copenhague", latitude: 55.68, longitude: 12.57, studentCount: 210 },
      { id: uid(), name: "DTU - Technical University of Denmark", city: "Kongens Lyngby", latitude: 55.79, longitude: 12.52, studentCount: 170 },
      { id: uid(), name: "Aarhus University", city: "Aarhus", latitude: 56.16, longitude: 10.20, studentCount: 110 },
    ],
  },
  {
    country: "Belgium", latitude: 50.8, longitude: 4.4, studentCount: 520,
    universities: [
      { id: uid(), name: "KU Leuven", city: "Lovaina", latitude: 50.88, longitude: 4.70, studentCount: 220 },
      { id: uid(), name: "Université Libre de Bruxelles", city: "Bruselas", latitude: 50.81, longitude: 4.38, studentCount: 180 },
      { id: uid(), name: "Ghent University", city: "Gante", latitude: 51.05, longitude: 3.72, studentCount: 120 },
    ],
  },
  {
    country: "Finland", latitude: 60.2, longitude: 24.9, studentCount: 430,
    universities: [
      { id: uid(), name: "University of Helsinki", city: "Helsinki", latitude: 60.20, longitude: 24.96, studentCount: 200 },
      { id: uid(), name: "Aalto University", city: "Espoo", latitude: 60.18, longitude: 24.83, studentCount: 150 },
      { id: uid(), name: "University of Turku", city: "Turku", latitude: 60.45, longitude: 22.27, studentCount: 80 },
    ],
  },
  {
    country: "Ireland", latitude: 53.3, longitude: -6.3, studentCount: 510,
    universities: [
      { id: uid(), name: "University College Dublin", city: "Dublín", latitude: 53.31, longitude: -6.22, studentCount: 210 },
      { id: uid(), name: "Trinity College Dublin", city: "Dublín", latitude: 53.34, longitude: -6.25, studentCount: 190 },
      { id: uid(), name: "NUI Galway", city: "Galway", latitude: 53.28, longitude: -9.06, studentCount: 110 },
    ],
  },
  {
    country: "Sweden", latitude: 59.3, longitude: 18.1, studentCount: 570,
    universities: [
      { id: uid(), name: "Stockholm University", city: "Estocolmo", latitude: 59.36, longitude: 18.06, studentCount: 220 },
      { id: uid(), name: "KTH Royal Institute of Technology", city: "Estocolmo", latitude: 59.35, longitude: 18.07, studentCount: 190 },
      { id: uid(), name: "Lund University", city: "Lund", latitude: 55.71, longitude: 13.20, studentCount: 160 },
    ],
  },
  {
    country: "Greece", latitude: 37.9, longitude: 23.7, studentCount: 490,
    universities: [
      { id: uid(), name: "National and Kapodistrian University of Athens", city: "Atenas", latitude: 37.97, longitude: 23.73, studentCount: 210 },
      { id: uid(), name: "Aristotle University of Thessaloniki", city: "Tesalónica", latitude: 40.62, longitude: 22.96, studentCount: 180 },
      { id: uid(), name: "University of Crete", city: "Heraklion", latitude: 35.31, longitude: 25.11, studentCount: 100 },
    ],
  },
  {
    country: "Romania", latitude: 44.4, longitude: 26.1, studentCount: 380,
    universities: [
      { id: uid(), name: "University of Bucharest", city: "Bucarest", latitude: 44.43, longitude: 26.10, studentCount: 180 },
      { id: uid(), name: "Babeș-Bolyai University", city: "Cluj-Napoca", latitude: 46.77, longitude: 23.59, studentCount: 140 },
      { id: uid(), name: "Alexandru Ioan Cuza University", city: "Iași", latitude: 47.16, longitude: 27.59, studentCount: 60 },
    ],
  },
  {
    country: "Hungary", latitude: 47.5, longitude: 19.1, studentCount: 420,
    universities: [
      { id: uid(), name: "Eötvös Loránd University", city: "Budapest", latitude: 47.47, longitude: 19.06, studentCount: 200 },
      { id: uid(), name: "Budapest University of Technology", city: "Budapest", latitude: 47.48, longitude: 19.06, studentCount: 160 },
      { id: uid(), name: "University of Debrecen", city: "Debrecen", latitude: 47.55, longitude: 21.63, studentCount: 60 },
    ],
  },
  {
    country: "Croatia", latitude: 45.8, longitude: 16.0, studentCount: 310,
    universities: [
      { id: uid(), name: "University of Zagreb", city: "Zagreb", latitude: 45.81, longitude: 15.98, studentCount: 170 },
      { id: uid(), name: "University of Split", city: "Split", latitude: 43.51, longitude: 16.44, studentCount: 90 },
      { id: uid(), name: "University of Rijeka", city: "Rijeka", latitude: 45.33, longitude: 14.44, studentCount: 50 },
    ],
  },
  {
    country: "Norway", latitude: 59.9, longitude: 10.8, studentCount: 370,
    universities: [
      { id: uid(), name: "University of Oslo", city: "Oslo", latitude: 59.94, longitude: 10.72, studentCount: 170 },
      { id: uid(), name: "NTNU – Norwegian University of Science", city: "Trondheim", latitude: 63.41, longitude: 10.40, studentCount: 140 },
      { id: uid(), name: "University of Bergen", city: "Bergen", latitude: 60.39, longitude: 5.33, studentCount: 60 },
    ],
  },
  {
    country: "Slovakia", latitude: 48.1, longitude: 17.1, studentCount: 260,
    universities: [
      { id: uid(), name: "Comenius University Bratislava", city: "Bratislava", latitude: 48.14, longitude: 17.10, studentCount: 130 },
      { id: uid(), name: "Slovak University of Technology", city: "Bratislava", latitude: 48.15, longitude: 17.07, studentCount: 80 },
      { id: uid(), name: "Pavol Jozef Šafárik University", city: "Košice", latitude: 48.72, longitude: 21.26, studentCount: 50 },
    ],
  },
  {
    country: "Slovenia", latitude: 46.1, longitude: 14.5, studentCount: 240,
    universities: [
      { id: uid(), name: "University of Ljubljana", city: "Liubliana", latitude: 46.05, longitude: 14.50, studentCount: 130 },
      { id: uid(), name: "University of Maribor", city: "Maribor", latitude: 46.56, longitude: 15.65, studentCount: 70 },
      { id: uid(), name: "University of Nova Gorica", city: "Nova Gorica", latitude: 45.96, longitude: 13.65, studentCount: 40 },
    ],
  },
  {
    country: "Bulgaria", latitude: 42.7, longitude: 23.3, studentCount: 280,
    universities: [
      { id: uid(), name: "Sofia University St. Kliment Ohridski", city: "Sofía", latitude: 42.69, longitude: 23.33, studentCount: 140 },
      { id: uid(), name: "Technical University of Sofia", city: "Sofía", latitude: 42.65, longitude: 23.35, studentCount: 90 },
      { id: uid(), name: "Plovdiv University", city: "Plovdiv", latitude: 42.15, longitude: 24.75, studentCount: 50 },
    ],
  },
  {
    country: "Latvia", latitude: 56.9, longitude: 24.1, studentCount: 190,
    universities: [
      { id: uid(), name: "University of Latvia", city: "Riga", latitude: 56.95, longitude: 24.11, studentCount: 100 },
      { id: uid(), name: "Riga Technical University", city: "Riga", latitude: 56.94, longitude: 24.09, studentCount: 60 },
      { id: uid(), name: "Riga Stradiņš University", city: "Riga", latitude: 56.95, longitude: 24.07, studentCount: 30 },
    ],
  },
  {
    country: "Lithuania", latitude: 54.7, longitude: 25.3, studentCount: 200,
    universities: [
      { id: uid(), name: "Vilnius University", city: "Vilna", latitude: 54.68, longitude: 25.27, studentCount: 100 },
      { id: uid(), name: "Kaunas University of Technology", city: "Kaunas", latitude: 54.90, longitude: 23.90, studentCount: 60 },
      { id: uid(), name: "Vytautas Magnus University", city: "Kaunas", latitude: 54.91, longitude: 23.91, studentCount: 40 },
    ],
  },
  {
    country: "Estonia", latitude: 59.4, longitude: 24.7, studentCount: 170,
    universities: [
      { id: uid(), name: "University of Tartu", city: "Tartu", latitude: 58.38, longitude: 26.72, studentCount: 90 },
      { id: uid(), name: "Tallinn University of Technology", city: "Tallin", latitude: 59.40, longitude: 24.66, studentCount: 50 },
      { id: uid(), name: "Tallinn University", city: "Tallin", latitude: 59.42, longitude: 24.67, studentCount: 30 },
    ],
  },
  {
    country: "Malta", latitude: 35.9, longitude: 14.5, studentCount: 130,
    universities: [
      { id: uid(), name: "University of Malta", city: "Msida", latitude: 35.90, longitude: 14.48, studentCount: 90 },
      { id: uid(), name: "Malta College of Arts, Science and Technology", city: "Paola", latitude: 35.87, longitude: 14.50, studentCount: 40 },
    ],
  },
  {
    country: "Cyprus", latitude: 35.2, longitude: 33.4, studentCount: 150,
    universities: [
      { id: uid(), name: "University of Cyprus", city: "Nicosia", latitude: 35.16, longitude: 33.35, studentCount: 90 },
      { id: uid(), name: "Cyprus University of Technology", city: "Limassol", latitude: 34.68, longitude: 33.04, studentCount: 60 },
    ],
  },
  {
    country: "Switzerland", latitude: 46.9, longitude: 7.4, studentCount: 460,
    universities: [
      { id: uid(), name: "ETH Zurich", city: "Zúrich", latitude: 47.41, longitude: 8.51, studentCount: 200 },
      { id: uid(), name: "University of Zurich", city: "Zúrich", latitude: 47.37, longitude: 8.55, studentCount: 150 },
      { id: uid(), name: "University of Geneva", city: "Ginebra", latitude: 46.20, longitude: 6.14, studentCount: 110 },
    ],
  },
  {
    country: "Turkey", latitude: 39.9, longitude: 32.9, studentCount: 540,
    universities: [
      { id: uid(), name: "Boğaziçi University", city: "Estambul", latitude: 41.08, longitude: 29.04, studentCount: 200 },
      { id: uid(), name: "Middle East Technical University", city: "Ankara", latitude: 39.89, longitude: 32.77, studentCount: 180 },
      { id: uid(), name: "Istanbul Technical University", city: "Estambul", latitude: 41.10, longitude: 29.02, studentCount: 160 },
    ],
  },
  {
    country: "Serbia", latitude: 44.8, longitude: 20.5, studentCount: 230,
    universities: [
      { id: uid(), name: "University of Belgrade", city: "Belgrado", latitude: 44.80, longitude: 20.47, studentCount: 130 },
      { id: uid(), name: "University of Novi Sad", city: "Novi Sad", latitude: 45.25, longitude: 19.84, studentCount: 60 },
      { id: uid(), name: "University of Niš", city: "Niš", latitude: 43.32, longitude: 21.90, studentCount: 40 },
    ],
  },
  {
    country: "Iceland", latitude: 64.1, longitude: -21.9, studentCount: 110,
    universities: [
      { id: uid(), name: "University of Iceland", city: "Reikiavik", latitude: 64.13, longitude: -21.95, studentCount: 70 },
      { id: uid(), name: "Reykjavik University", city: "Reikiavik", latitude: 64.12, longitude: -21.92, studentCount: 40 },
    ],
  },
  // ════ ORIENTE MEDIO / NORTE DE ÁFRICA ════
  {
    country: "Morocco", latitude: 34.0, longitude: -6.8, studentCount: 290,
    universities: [
      { id: uid(), name: "Université Mohammed V de Rabat", city: "Rabat", latitude: 34.01, longitude: -6.85, studentCount: 130 },
      { id: uid(), name: "Université Hassan II de Casablanca", city: "Casablanca", latitude: 33.59, longitude: -7.62, studentCount: 100 },
      { id: uid(), name: "Université Cadi Ayyad", city: "Marrakech", latitude: 31.63, longitude: -8.01, studentCount: 60 },
    ],
  },
  {
    country: "Tunisia", latitude: 36.8, longitude: 10.2, studentCount: 200,
    universities: [
      { id: uid(), name: "Université de Tunis El Manar", city: "Túnez", latitude: 36.83, longitude: 10.20, studentCount: 110 },
      { id: uid(), name: "Université de Carthage", city: "Cartago", latitude: 36.86, longitude: 10.33, studentCount: 90 },
    ],
  },
  {
    country: "Egypt", latitude: 30.1, longitude: 31.2, studentCount: 280,
    universities: [
      { id: uid(), name: "Cairo University", city: "El Cairo", latitude: 30.03, longitude: 31.21, studentCount: 130 },
      { id: uid(), name: "American University in Cairo", city: "El Cairo", latitude: 30.02, longitude: 31.50, studentCount: 90 },
      { id: uid(), name: "Alexandria University", city: "Alejandría", latitude: 31.20, longitude: 29.95, studentCount: 60 },
    ],
  },
  {
    country: "Jordan", latitude: 31.9, longitude: 35.9, studentCount: 150,
    universities: [
      { id: uid(), name: "University of Jordan", city: "Amán", latitude: 31.97, longitude: 35.88, studentCount: 90 },
      { id: uid(), name: "Jordan University of Science and Technology", city: "Irbid", latitude: 32.48, longitude: 35.99, studentCount: 60 },
    ],
  },
  {
    country: "Lebanon", latitude: 33.9, longitude: 35.5, studentCount: 160,
    universities: [
      { id: uid(), name: "American University of Beirut", city: "Beirut", latitude: 33.90, longitude: 35.48, studentCount: 90 },
      { id: uid(), name: "Université Saint-Joseph", city: "Beirut", latitude: 33.88, longitude: 35.51, studentCount: 70 },
    ],
  },
  {
    country: "Israel", latitude: 31.8, longitude: 35.2, studentCount: 180,
    universities: [
      { id: uid(), name: "The Hebrew University of Jerusalem", city: "Jerusalén", latitude: 31.77, longitude: 35.19, studentCount: 90 },
      { id: uid(), name: "Tel Aviv University", city: "Tel Aviv", latitude: 32.11, longitude: 34.80, studentCount: 90 },
    ],
  },
  // ════ LATINOAMÉRICA ════
  {
    country: "Mexico", latitude: 19.4, longitude: -99.1, studentCount: 430,
    universities: [
      { id: uid(), name: "UNAM – Universidad Nacional Autónoma", city: "Ciudad de México", latitude: 19.33, longitude: -99.19, studentCount: 160 },
      { id: uid(), name: "Tecnológico de Monterrey", city: "Monterrey", latitude: 25.65, longitude: -100.29, studentCount: 140 },
      { id: uid(), name: "Universidad de Guadalajara", city: "Guadalajara", latitude: 20.67, longitude: -103.34, studentCount: 80 },
      { id: uid(), name: "Universidad Iberoamericana", city: "Ciudad de México", latitude: 19.36, longitude: -99.26, studentCount: 50 },
    ],
  },
  {
    country: "Brazil", latitude: -23.5, longitude: -46.6, studentCount: 510,
    universities: [
      { id: uid(), name: "Universidade de São Paulo (USP)", city: "São Paulo", latitude: -23.56, longitude: -46.73, studentCount: 200 },
      { id: uid(), name: "Universidade Federal do Rio de Janeiro", city: "Río de Janeiro", latitude: -22.91, longitude: -43.17, studentCount: 170 },
      { id: uid(), name: "Universidade Estadual de Campinas", city: "Campinas", latitude: -22.82, longitude: -47.07, studentCount: 90 },
      { id: uid(), name: "Pontificia Universidade Católica", city: "São Paulo", latitude: -23.53, longitude: -46.66, studentCount: 50 },
    ],
  },
  {
    country: "Argentina", latitude: -34.6, longitude: -58.4, studentCount: 340,
    universities: [
      { id: uid(), name: "Universidad de Buenos Aires (UBA)", city: "Buenos Aires", latitude: -34.60, longitude: -58.38, studentCount: 160 },
      { id: uid(), name: "Universidad Nacional de Córdoba", city: "Córdoba", latitude: -31.44, longitude: -64.18, studentCount: 110 },
      { id: uid(), name: "Universidad Austral", city: "Buenos Aires", latitude: -34.55, longitude: -58.48, studentCount: 70 },
    ],
  },
  {
    country: "Colombia", latitude: 4.7, longitude: -74.1, studentCount: 290,
    universities: [
      { id: uid(), name: "Universidad de los Andes", city: "Bogotá", latitude: 4.60, longitude: -74.07, studentCount: 130 },
      { id: uid(), name: "Universidad Nacional de Colombia", city: "Bogotá", latitude: 4.64, longitude: -74.08, studentCount: 100 },
      { id: uid(), name: "Universidad Javeriana", city: "Bogotá", latitude: 4.63, longitude: -74.06, studentCount: 60 },
    ],
  },
  {
    country: "Chile", latitude: -33.5, longitude: -70.7, studentCount: 260,
    universities: [
      { id: uid(), name: "Universidad de Chile", city: "Santiago", latitude: -33.45, longitude: -70.65, studentCount: 130 },
      { id: uid(), name: "Pontificia Universidad Católica de Chile", city: "Santiago", latitude: -33.44, longitude: -70.62, studentCount: 90 },
      { id: uid(), name: "Universidad de Concepción", city: "Concepción", latitude: -36.83, longitude: -73.06, studentCount: 40 },
    ],
  },
  {
    country: "Peru", latitude: -12.0, longitude: -77.0, studentCount: 200,
    universities: [
      { id: uid(), name: "Pontificia Universidad Católica del Perú", city: "Lima", latitude: -12.07, longitude: -76.95, studentCount: 110 },
      { id: uid(), name: "Universidad Nacional Mayor de San Marcos", city: "Lima", latitude: -12.05, longitude: -77.08, studentCount: 90 },
    ],
  },
  {
    country: "Ecuador", latitude: -0.2, longitude: -78.5, studentCount: 150,
    universities: [
      { id: uid(), name: "Universidad San Francisco de Quito", city: "Quito", latitude: -0.21, longitude: -78.49, studentCount: 80 },
      { id: uid(), name: "Escuela Politécnica Nacional", city: "Quito", latitude: -0.21, longitude: -78.50, studentCount: 70 },
    ],
  },
  // ════ NORTEAMÉRICA ════
  {
    country: "United States", latitude: 40.7, longitude: -74.0, studentCount: 780,
    universities: [
      { id: uid(), name: "New York University (NYU)", city: "Nueva York", latitude: 40.73, longitude: -73.99, studentCount: 200 },
      { id: uid(), name: "University of California, Los Angeles", city: "Los Ángeles", latitude: 34.07, longitude: -118.44, studentCount: 180 },
      { id: uid(), name: "University of Chicago", city: "Chicago", latitude: 41.79, longitude: -87.60, studentCount: 140 },
      { id: uid(), name: "Georgetown University", city: "Washington D.C.", latitude: 38.91, longitude: -77.07, studentCount: 130 },
      { id: uid(), name: "Boston University", city: "Boston", latitude: 42.35, longitude: -71.11, studentCount: 130 },
    ],
  },
  {
    country: "Canada", latitude: 45.4, longitude: -75.7, studentCount: 480,
    universities: [
      { id: uid(), name: "University of Toronto", city: "Toronto", latitude: 43.66, longitude: -79.40, studentCount: 200 },
      { id: uid(), name: "McGill University", city: "Montreal", latitude: 45.51, longitude: -73.58, studentCount: 170 },
      { id: uid(), name: "University of British Columbia", city: "Vancouver", latitude: 49.26, longitude: -123.25, studentCount: 110 },
    ],
  },
  // ════ ASIA-PACÍFICO ════
  {
    country: "Japan", latitude: 35.7, longitude: 139.7, studentCount: 560,
    universities: [
      { id: uid(), name: "University of Tokyo", city: "Tokio", latitude: 35.71, longitude: 139.76, studentCount: 200 },
      { id: uid(), name: "Kyoto University", city: "Kioto", latitude: 35.03, longitude: 135.78, studentCount: 180 },
      { id: uid(), name: "Waseda University", city: "Tokio", latitude: 35.71, longitude: 139.72, studentCount: 100 },
      { id: uid(), name: "Osaka University", city: "Osaka", latitude: 34.82, longitude: 135.52, studentCount: 80 },
    ],
  },
  {
    country: "South Korea", latitude: 37.6, longitude: 127.0, studentCount: 440,
    universities: [
      { id: uid(), name: "Seoul National University", city: "Seúl", latitude: 37.46, longitude: 126.95, studentCount: 180 },
      { id: uid(), name: "Yonsei University", city: "Seúl", latitude: 37.57, longitude: 126.94, studentCount: 150 },
      { id: uid(), name: "KAIST", city: "Daejeon", latitude: 36.37, longitude: 127.36, studentCount: 110 },
    ],
  },
  {
    country: "China", latitude: 39.9, longitude: 116.4, studentCount: 620,
    universities: [
      { id: uid(), name: "Peking University", city: "Pekín", latitude: 39.99, longitude: 116.31, studentCount: 230 },
      { id: uid(), name: "Tsinghua University", city: "Pekín", latitude: 40.00, longitude: 116.33, studentCount: 210 },
      { id: uid(), name: "Fudan University", city: "Shanghái", latitude: 31.30, longitude: 121.50, studentCount: 180 },
    ],
  },
  {
    country: "India", latitude: 28.6, longitude: 77.2, studentCount: 490,
    universities: [
      { id: uid(), name: "University of Delhi", city: "Nueva Delhi", latitude: 28.69, longitude: 77.22, studentCount: 180 },
      { id: uid(), name: "Indian Institute of Technology Bombay", city: "Bombai", latitude: 19.13, longitude: 72.91, studentCount: 160 },
      { id: uid(), name: "Jawaharlal Nehru University", city: "Nueva Delhi", latitude: 28.54, longitude: 77.17, studentCount: 100 },
      { id: uid(), name: "University of Hyderabad", city: "Hyderabad", latitude: 17.45, longitude: 78.33, studentCount: 50 },
    ],
  },
  {
    country: "Australia", latitude: -33.9, longitude: 151.2, studentCount: 500,
    universities: [
      { id: uid(), name: "University of Sydney", city: "Sídney", latitude: -33.89, longitude: 151.19, studentCount: 190 },
      { id: uid(), name: "University of Melbourne", city: "Melbourne", latitude: -37.80, longitude: 144.96, studentCount: 180 },
      { id: uid(), name: "Australian National University", city: "Canberra", latitude: -35.28, longitude: 149.12, studentCount: 130 },
    ],
  },
  {
    country: "New Zealand", latitude: -36.9, longitude: 174.8, studentCount: 190,
    universities: [
      { id: uid(), name: "University of Auckland", city: "Auckland", latitude: -36.85, longitude: 174.77, studentCount: 110 },
      { id: uid(), name: "Victoria University of Wellington", city: "Wellington", latitude: -41.29, longitude: 174.77, studentCount: 80 },
    ],
  },
  {
    country: "Thailand", latitude: 13.8, longitude: 100.5, studentCount: 240,
    universities: [
      { id: uid(), name: "Chulalongkorn University", city: "Bangkok", latitude: 13.74, longitude: 100.53, studentCount: 120 },
      { id: uid(), name: "Mahidol University", city: "Bangkok", latitude: 13.79, longitude: 100.32, studentCount: 80 },
      { id: uid(), name: "Chiang Mai University", city: "Chiang Mai", latitude: 18.80, longitude: 98.95, studentCount: 40 },
    ],
  },
  {
    country: "Malaysia", latitude: 3.1, longitude: 101.7, studentCount: 210,
    universities: [
      { id: uid(), name: "University of Malaya", city: "Kuala Lumpur", latitude: 3.12, longitude: 101.65, studentCount: 110 },
      { id: uid(), name: "Universiti Teknologi Malaysia", city: "Johor Bahru", latitude: 1.55, longitude: 103.64, studentCount: 70 },
      { id: uid(), name: "Universiti Putra Malaysia", city: "Serdang", latitude: 3.00, longitude: 101.71, studentCount: 30 },
    ],
  },
  {
    country: "Singapore", latitude: 1.3, longitude: 103.8, studentCount: 280,
    universities: [
      { id: uid(), name: "National University of Singapore", city: "Singapur", latitude: 1.30, longitude: 103.77, studentCount: 150 },
      { id: uid(), name: "Nanyang Technological University", city: "Singapur", latitude: 1.35, longitude: 103.68, studentCount: 130 },
    ],
  },
  {
    country: "Vietnam", latitude: 21.0, longitude: 105.8, studentCount: 160,
    universities: [
      { id: uid(), name: "Vietnam National University Hanoi", city: "Hanói", latitude: 21.04, longitude: 105.79, studentCount: 90 },
      { id: uid(), name: "Ho Chi Minh City University", city: "Ho Chi Minh", latitude: 10.77, longitude: 106.70, studentCount: 70 },
    ],
  },
  {
    country: "Indonesia", latitude: -6.2, longitude: 106.8, studentCount: 200,
    universities: [
      { id: uid(), name: "Universitas Indonesia", city: "Yakarta", latitude: -6.36, longitude: 106.83, studentCount: 100 },
      { id: uid(), name: "Institut Teknologi Bandung", city: "Bandung", latitude: -6.89, longitude: 107.61, studentCount: 70 },
      { id: uid(), name: "Universitas Gadjah Mada", city: "Yogyakarta", latitude: -7.77, longitude: 110.37, studentCount: 30 },
    ],
  },
  {
    country: "Georgia", latitude: 41.7, longitude: 44.8, studentCount: 170,
    universities: [
      { id: uid(), name: "Tbilisi State University", city: "Tiflis", latitude: 41.70, longitude: 44.77, studentCount: 100 },
      { id: uid(), name: "Georgian Technical University", city: "Tiflis", latitude: 41.73, longitude: 44.74, studentCount: 70 },
    ],
  },
  {
    country: "Armenia", latitude: 40.2, longitude: 44.5, studentCount: 140,
    universities: [
      { id: uid(), name: "Yerevan State University", city: "Ereván", latitude: 40.18, longitude: 44.51, studentCount: 80 },
      { id: uid(), name: "Armenian State University of Economics", city: "Ereván", latitude: 40.19, longitude: 44.52, studentCount: 60 },
    ],
  },
  // ════ ÁFRICA SUBSAHARIANA ════
  {
    country: "South Africa", latitude: -25.7, longitude: 28.2, studentCount: 260,
    universities: [
      { id: uid(), name: "University of Cape Town", city: "Ciudad del Cabo", latitude: -33.96, longitude: 18.46, studentCount: 110 },
      { id: uid(), name: "University of Pretoria", city: "Pretoria", latitude: -25.75, longitude: 28.23, studentCount: 90 },
      { id: uid(), name: "University of the Witwatersrand", city: "Johannesburgo", latitude: -26.19, longitude: 28.03, studentCount: 60 },
    ],
  },
  {
    country: "Kenya", latitude: -1.3, longitude: 36.8, studentCount: 160,
    universities: [
      { id: uid(), name: "University of Nairobi", city: "Nairobi", latitude: -1.28, longitude: 36.82, studentCount: 90 },
      { id: uid(), name: "Kenyatta University", city: "Nairobi", latitude: -1.18, longitude: 36.93, studentCount: 70 },
    ],
  },
  {
    country: "Senegal", latitude: 14.7, longitude: -17.5, studentCount: 120,
    universities: [
      { id: uid(), name: "Université Cheikh Anta Diop de Dakar", city: "Dakar", latitude: 14.69, longitude: -17.47, studentCount: 80 },
      { id: uid(), name: "Université Gaston Berger", city: "Saint-Louis", latitude: 16.05, longitude: -16.47, studentCount: 40 },
    ],
  },
  {
    country: "Ghana", latitude: 5.6, longitude: -0.2, studentCount: 140,
    universities: [
      { id: uid(), name: "University of Ghana", city: "Acra", latitude: 5.65, longitude: -0.19, studentCount: 80 },
      { id: uid(), name: "Kwame Nkrumah University of Science", city: "Kumasi", latitude: 6.67, longitude: -1.57, studentCount: 60 },
    ],
  },
  {
    country: "Ethiopia", latitude: 9.0, longitude: 38.7, studentCount: 110,
    universities: [
      { id: uid(), name: "Addis Ababa University", city: "Adís Abeba", latitude: 9.02, longitude: 38.75, studentCount: 70 },
      { id: uid(), name: "Jimma University", city: "Jimma", latitude: 7.67, longitude: 36.83, studentCount: 40 },
    ],
  },
  {
    country: "Cameroon", latitude: 3.9, longitude: 11.5, studentCount: 100,
    universities: [
      { id: uid(), name: "University of Yaoundé I", city: "Yaundé", latitude: 3.87, longitude: 11.52, studentCount: 60 },
      { id: uid(), name: "University of Buea", city: "Buea", latitude: 4.16, longitude: 9.23, studentCount: 40 },
    ],
  },
  {
    country: "Ukraine", latitude: 50.4, longitude: 30.5, studentCount: 320,
    universities: [
      { id: uid(), name: "Taras Shevchenko National University of Kyiv", city: "Kiev", latitude: 50.44, longitude: 30.52, studentCount: 150 },
      { id: uid(), name: "National Technical University of Ukraine", city: "Kiev", latitude: 50.45, longitude: 30.46, studentCount: 100 },
      { id: uid(), name: "Lviv Polytechnic National University", city: "Lviv", latitude: 49.82, longitude: 24.02, studentCount: 70 },
    ],
  },
  {
    country: "Moldova", latitude: 47.0, longitude: 28.8, studentCount: 130,
    universities: [
      { id: uid(), name: "Moldova State University", city: "Chișinău", latitude: 47.02, longitude: 28.84, studentCount: 80 },
      { id: uid(), name: "Technical University of Moldova", city: "Chișinău", latitude: 47.05, longitude: 28.87, studentCount: 50 },
    ],
  },
  {
    country: "Kazakhstan", latitude: 51.2, longitude: 71.5, studentCount: 180,
    universities: [
      { id: uid(), name: "Nazarbayev University", city: "Astana", latitude: 51.09, longitude: 71.40, studentCount: 100 },
      { id: uid(), name: "Al-Farabi Kazakh National University", city: "Almaty", latitude: 43.21, longitude: 76.93, studentCount: 80 },
    ],
  },
  {
    country: "Uzbekistan", latitude: 41.3, longitude: 69.3, studentCount: 140,
    universities: [
      { id: uid(), name: "National University of Uzbekistan", city: "Tashkent", latitude: 41.34, longitude: 69.29, studentCount: 80 },
      { id: uid(), name: "Westminster International University Tashkent", city: "Tashkent", latitude: 41.31, longitude: 69.27, studentCount: 60 },
    ],
  },
];

interface GlobeState {
  countryPins: CountryPin[];
  selectedCountry: CountryPin | null;
  loading: boolean;
  error: string | null;
  nightMode: boolean;
  autoRotate: boolean;
  favoriteCountries: string[];

  fetchStats: () => Promise<void>;
  selectCountry: (pin: CountryPin | null) => void;
  clearSelection: () => void;
  toggleNightMode: () => void;
  toggleAutoRotate: () => void;
  toggleFavorite: (country: string) => void;
  isFavorite: (country: string) => boolean;
}

export const useGlobeStore = create<GlobeState>((set, get) => ({
  // Seed with worldwide static data so the globe always shows pins
  countryPins: WORLDWIDE_PINS,
  selectedCountry: null,
  loading: false,
  error: null,
  nightMode: false,
  autoRotate: true,
  favoriteCountries: [],

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await fetchCountryStats();
      const apiPins: CountryPin[] = stats.map((s: CountryStats) => ({
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        studentCount: s.studentCount,
        universities: s.universities,
      }));
      // Merge: API pins take priority, static pins fill missing countries
      const apiCountries = new Set(apiPins.map((p) => p.country));
      const staticFill = WORLDWIDE_PINS.filter((p) => !apiCountries.has(p.country));
      set({ countryPins: [...apiPins, ...staticFill], loading: false });
    } catch (e: any) {
      // On error, keep static data — just clear loading flag
      set({
        error: e?.message ?? "Error al cargar datos del globo",
        loading: false,
      });
    }
  },

  selectCountry: (pin) => set({ selectedCountry: pin }),
  clearSelection: () => set({ selectedCountry: null }),
  toggleNightMode: () => set((s) => ({ nightMode: !s.nightMode })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  toggleFavorite: (country) =>
    set((s) => ({
      favoriteCountries: s.favoriteCountries.includes(country)
        ? s.favoriteCountries.filter((c) => c !== country)
        : [...s.favoriteCountries, country],
    })),
  isFavorite: (country) => get().favoriteCountries.includes(country),
}));
