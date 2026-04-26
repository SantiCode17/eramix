/**
 * ════════════════════════════════════════════════════
 *  Mock Data — Datos de ejemplo para previsualización
 *  Usuarios, eventos, historias, chats, comunidades
 * ════════════════════════════════════════════════════
 */

import type { User } from "@/types/user";
import type { EventData } from "@/types/events";
import type { ConversationData, MessageData } from "@/types/chat";
import type { CommunityData } from "@/types/communities";
import type { UserStories, StoryData } from "@/types/stories";
import type { FriendRequestResponse } from "@/types/discover";

// ═══ Usuarios mock ═══
export const MOCK_USERS: User[] = [
  {
    id: 101, email: "marie@erasmus.eu", firstName: "Marie", lastName: "Dupont",
    dateOfBirth: "2001-03-15", bio: "Étudiante en arts à Paris 🎨 Erasmus à Barcelona!",
    destinationCity: "Barcelona", destinationCountry: "España",
    homeUniversity: { id: 1, name: "Sorbonne Université", city: "Paris", country: "Francia" },
    hostUniversity: { id: 2, name: "Universitat de Barcelona", city: "Barcelona", country: "España" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 41.3874, longitude: 2.1686, isActive: true, isVerified: true,
    interests: [
      { id: 1, name: "Arte", category: "cultura", icon: "🎨" },
      { id: 2, name: "Fotografía", category: "cultura", icon: "📸" },
      { id: 5, name: "Viajes", category: "lifestyle", icon: "✈️" },
    ],
    languages: [
      { id: 1, code: "fr", name: "Français", proficiencyLevel: "NATIVE" },
      { id: 2, code: "es", name: "Español", proficiencyLevel: "B2" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "C1" },
    ],
    friendCount: 47, eventCount: 12,
  },
  {
    id: 102, email: "luca@erasmus.eu", firstName: "Luca", lastName: "Rossi",
    dateOfBirth: "2000-07-22", bio: "Ingegneria informatica 💻 Milano → Madrid. Pizza lover 🍕",
    destinationCity: "Madrid", destinationCountry: "España",
    homeUniversity: { id: 3, name: "Politecnico di Milano", city: "Milano", country: "Italia" },
    hostUniversity: { id: 4, name: "Universidad Politécnica de Madrid", city: "Madrid", country: "España" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 40.4168, longitude: -3.7038, isActive: true, isVerified: true,
    interests: [
      { id: 3, name: "Programación", category: "tech", icon: "💻" },
      { id: 4, name: "Fútbol", category: "deporte", icon: "⚽" },
      { id: 6, name: "Cocina", category: "lifestyle", icon: "🍳" },
    ],
    languages: [
      { id: 4, code: "it", name: "Italiano", proficiencyLevel: "NATIVE" },
      { id: 2, code: "es", name: "Español", proficiencyLevel: "B1" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "B2" },
    ],
    friendCount: 63, eventCount: 8,
  },
  {
    id: 103, email: "anna@erasmus.eu", firstName: "Anna", lastName: "Müller",
    dateOfBirth: "2001-11-03", bio: "Medizinstudentin aus Berlin 🏥 Erasmus in Sevilla 🌻",
    destinationCity: "Sevilla", destinationCountry: "España",
    homeUniversity: { id: 5, name: "Charité – Universitätsmedizin Berlin", city: "Berlín", country: "Alemania" },
    hostUniversity: { id: 6, name: "Universidad de Sevilla", city: "Sevilla", country: "España" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-02-28",
    latitude: 37.3891, longitude: -5.9845, isActive: true, isVerified: true,
    interests: [
      { id: 7, name: "Medicina", category: "academico", icon: "🏥" },
      { id: 8, name: "Yoga", category: "deporte", icon: "🧘" },
      { id: 9, name: "Flamenco", category: "cultura", icon: "💃" },
    ],
    languages: [
      { id: 5, code: "de", name: "Deutsch", proficiencyLevel: "NATIVE" },
      { id: 2, code: "es", name: "Español", proficiencyLevel: "A2" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "C2" },
    ],
    friendCount: 31, eventCount: 5,
  },
  {
    id: 104, email: "sofia@erasmus.eu", firstName: "Sofia", lastName: "Kowalska",
    dateOfBirth: "2002-01-18", bio: "Psicología 🧠 Kraków → Lisboa. Amo la música y el surf 🏄‍♀️",
    destinationCity: "Lisboa", destinationCountry: "Portugal",
    homeUniversity: { id: 7, name: "Uniwersytet Jagielloński", city: "Kraków", country: "Polonia" },
    hostUniversity: { id: 8, name: "Universidade de Lisboa", city: "Lisboa", country: "Portugal" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 38.7223, longitude: -9.1393, isActive: true, isVerified: true,
    interests: [
      { id: 10, name: "Surf", category: "deporte", icon: "🏄" },
      { id: 11, name: "Psicología", category: "academico", icon: "🧠" },
      { id: 12, name: "Música", category: "cultura", icon: "🎵" },
    ],
    languages: [
      { id: 6, code: "pl", name: "Polski", proficiencyLevel: "NATIVE" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "C1" },
      { id: 7, code: "pt", name: "Português", proficiencyLevel: "A2" },
    ],
    friendCount: 52, eventCount: 15,
  },
  {
    id: 105, email: "erik@erasmus.eu", firstName: "Erik", lastName: "Johansson",
    dateOfBirth: "2000-05-30", bio: "Design student from Stockholm 🎭 Living my best life in Roma 🇮🇹",
    destinationCity: "Roma", destinationCountry: "Italia",
    homeUniversity: { id: 9, name: "Kungliga Tekniska högskolan", city: "Stockholm", country: "Suecia" },
    hostUniversity: { id: 10, name: "Sapienza Università di Roma", city: "Roma", country: "Italia" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 41.9028, longitude: 12.4964, isActive: true, isVerified: true,
    interests: [
      { id: 13, name: "Diseño UX", category: "tech", icon: "🎨" },
      { id: 14, name: "Arquitectura", category: "cultura", icon: "🏛️" },
      { id: 15, name: "Fotografía", category: "cultura", icon: "📸" },
    ],
    languages: [
      { id: 8, code: "sv", name: "Svenska", proficiencyLevel: "NATIVE" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "C2" },
      { id: 4, code: "it", name: "Italiano", proficiencyLevel: "B1" },
    ],
    friendCount: 89, eventCount: 22,
  },
  {
    id: 106, email: "chloe@erasmus.eu", firstName: "Chloé", lastName: "Martin",
    dateOfBirth: "2001-09-12", bio: "Erasmus en Praga 🇨🇿 J'adore la bière et les voyages 🍻✈️",
    destinationCity: "Praga", destinationCountry: "República Checa",
    homeUniversity: { id: 11, name: "Sciences Po", city: "Paris", country: "Francia" },
    hostUniversity: { id: 12, name: "Univerzita Karlova", city: "Praga", country: "República Checa" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 50.0755, longitude: 14.4378, isActive: true, isVerified: true,
    interests: [
      { id: 16, name: "Política", category: "academico", icon: "🏛️" },
      { id: 5, name: "Viajes", category: "lifestyle", icon: "✈️" },
      { id: 17, name: "Cerveza artesanal", category: "lifestyle", icon: "🍺" },
    ],
    languages: [
      { id: 1, code: "fr", name: "Français", proficiencyLevel: "NATIVE" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "C1" },
      { id: 9, code: "cs", name: "Čeština", proficiencyLevel: "A1" },
    ],
    friendCount: 38, eventCount: 9,
  },
  {
    id: 107, email: "pedro@erasmus.eu", firstName: "Pedro", lastName: "García",
    dateOfBirth: "2000-12-05", bio: "Derecho en Granada 📚 De intercambio en Ámsterdam 🇳🇱🚲",
    destinationCity: "Ámsterdam", destinationCountry: "Países Bajos",
    homeUniversity: { id: 13, name: "Universidad de Granada", city: "Granada", country: "España" },
    hostUniversity: { id: 14, name: "Universiteit van Amsterdam", city: "Ámsterdam", country: "Países Bajos" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 52.3676, longitude: 4.9041, isActive: true, isVerified: true,
    interests: [
      { id: 18, name: "Derecho", category: "academico", icon: "⚖️" },
      { id: 19, name: "Ciclismo", category: "deporte", icon: "🚴" },
      { id: 20, name: "Cine", category: "cultura", icon: "🎬" },
    ],
    languages: [
      { id: 2, code: "es", name: "Español", proficiencyLevel: "NATIVE" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "B2" },
      { id: 10, code: "nl", name: "Nederlands", proficiencyLevel: "A1" },
    ],
    friendCount: 44, eventCount: 7,
  },
  {
    id: 108, email: "katarina@erasmus.eu", firstName: "Katarina", lastName: "Novak",
    dateOfBirth: "2001-04-25", bio: "Biología marina 🐠 Zagreb → Marsella. Diving enthusiast 🤿",
    destinationCity: "Marsella", destinationCountry: "Francia",
    homeUniversity: { id: 15, name: "Sveučilište u Zagrebu", city: "Zagreb", country: "Croacia" },
    hostUniversity: { id: 16, name: "Aix-Marseille Université", city: "Marsella", country: "Francia" },
    mobilityStartDate: "2025-09-01", mobilityEndDate: "2026-06-30",
    latitude: 43.2965, longitude: 5.3698, isActive: true, isVerified: true,
    interests: [
      { id: 21, name: "Biología marina", category: "academico", icon: "🐠" },
      { id: 22, name: "Buceo", category: "deporte", icon: "��" },
      { id: 5, name: "Viajes", category: "lifestyle", icon: "✈️" },
    ],
    languages: [
      { id: 11, code: "hr", name: "Hrvatski", proficiencyLevel: "NATIVE" },
      { id: 1, code: "fr", name: "Français", proficiencyLevel: "B1" },
      { id: 3, code: "en", name: "English", proficiencyLevel: "C1" },
    ],
    friendCount: 29, eventCount: 11,
  },
];

// ═══ Eventos mock ═══
const now = new Date();
const d = (days: number, hours = 20) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + days);
  dt.setHours(hours, 0, 0, 0);
  return dt.toISOString();
};

export const MOCK_EVENTS: EventData[] = [
  {
    id: 201, creatorId: 101, creatorFirstName: "Marie", creatorLastName: "Dupont", creatorProfilePhotoUrl: null,
    title: "🎨 Noche de Pintura & Vino", description: "Trae tu creatividad, nosotros ponemos el vino y los lienzos. Ideal para desconectar del estrés académico.",
    category: "cultura", location: "Art Studio BCN, Carrer de la Princesa 21", latitude: 41.3851, longitude: 2.1734,
    startDatetime: d(1, 20), endDatetime: d(1, 23), maxParticipants: 25, isPublic: true,
    participantCount: 18, currentUserStatus: null, createdAt: d(-2),
  },
  {
    id: 202, creatorId: 102, creatorFirstName: "Luca", creatorLastName: "Rossi", creatorProfilePhotoUrl: null,
    title: "⚽ Torneo de Fútbol Erasmus", description: "¡5v5! Forma tu equipo internacional. Premios para los ganadores 🏆",
    category: "deporte", location: "Camp Municipal de Les Corts", latitude: 41.3809, longitude: 2.1228,
    startDatetime: d(2, 16), endDatetime: d(2, 19), maxParticipants: 40, isPublic: true,
    participantCount: 32, currentUserStatus: "GOING", createdAt: d(-3),
  },
  {
    id: 203, creatorId: 103, creatorFirstName: "Anna", creatorLastName: "Müller", creatorProfilePhotoUrl: null,
    title: "🍕 Noche Italiana — Cocina Auténtica", description: "Luca nos enseña a hacer pasta carbonara de verdad. Ingredientes incluidos.",
    category: "comida", location: "Cocina Comunitaria Erasmus Hub", latitude: 41.3917, longitude: 2.1649,
    startDatetime: d(3, 19), endDatetime: d(3, 22), maxParticipants: 15, isPublic: true,
    participantCount: 14, currentUserStatus: null, createdAt: d(-1),
  },
  {
    id: 204, creatorId: 104, creatorFirstName: "Sofia", creatorLastName: "Kowalska", creatorProfilePhotoUrl: null,
    title: "🏄‍♀️ Excursión de Surf — Sitges", description: "Día de playa y surf para principiantes y avanzados. Transporte compartido desde Barcelona.",
    category: "deporte", location: "Playa de Sitges", latitude: 41.2370, longitude: 1.8111,
    startDatetime: d(5, 9), endDatetime: d(5, 18), maxParticipants: 20, isPublic: true,
    participantCount: 11, currentUserStatus: null, createdAt: d(-1),
  },
  {
    id: 205, creatorId: 105, creatorFirstName: "Erik", creatorLastName: "Johansson", creatorProfilePhotoUrl: null,
    title: "🎶 Erasmus Music Jam", description: "Open mic + jam session. Trae tu instrumento o solo ven a disfrutar. Todas las culturas, un escenario.",
    category: "musica", location: "Café del Teatre, Gracia", latitude: 41.4036, longitude: 2.1563,
    startDatetime: d(4, 21), endDatetime: d(5, 1), maxParticipants: 60, isPublic: true,
    participantCount: 43, currentUserStatus: "GOING", createdAt: d(-4),
  },
  {
    id: 206, creatorId: 106, creatorFirstName: "Chloé", creatorLastName: "Martin", creatorProfilePhotoUrl: null,
    title: "🎉 Fiesta Erasmus — Bienvenida Primavera", description: "DJ set + terraza + cocktails internacionales. Dress code: blanco ⚪",
    category: "fiesta", location: "Eclipse Rooftop Bar", latitude: 41.3730, longitude: 2.1852,
    startDatetime: d(6, 23), endDatetime: d(7, 4), maxParticipants: 150, isPublic: true,
    participantCount: 87, currentUserStatus: null, createdAt: d(-5),
  },
  {
    id: 207, creatorId: 107, creatorFirstName: "Pedro", creatorLastName: "García", creatorProfilePhotoUrl: null,
    title: "📚 Grupo de Estudio — Exámenes de Junio", description: "Biblioteca central, 3er piso. Sesión de pomodoro grupal. Café incluido ☕",
    category: "academico", location: "Biblioteca CRAI UB", latitude: 41.3862, longitude: 2.1645,
    startDatetime: d(1, 10), endDatetime: d(1, 14), maxParticipants: 30, isPublic: true,
    participantCount: 12, currentUserStatus: null, createdAt: d(-1),
  },
  {
    id: 208, creatorId: 108, creatorFirstName: "Katarina", creatorLastName: "Novak", creatorProfilePhotoUrl: null,
    title: "✈️ Weekend Trip — Costa Brava", description: "Dos días en Tossa de Mar. Senderismo, kayak y playa. 45€ todo incluido.",
    category: "viaje", location: "Salida: Estación de Sants", latitude: 41.3794, longitude: 2.1404,
    startDatetime: d(8, 8), endDatetime: d(9, 20), maxParticipants: 16, isPublic: true,
    participantCount: 14, currentUserStatus: null, createdAt: d(-6),
  },
];

// ═══ Conversaciones mock ═══
export const MOCK_CONVERSATIONS: ConversationData[] = [
  {
    id: 301, otherUserId: 101, otherUserFirstName: "Marie", otherUserLastName: "Dupont",
    otherUserProfilePhotoUrl: null, otherUserOnline: true, unreadCount: 3,
    lastMessageAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    lastMessage: {
      id: 3001, conversationId: 301, senderId: 101, senderFirstName: "Marie", senderLastName: "Dupont",
      content: "¿Vienes al evento de pintura mañana? 🎨", type: "TEXT",
      mediaUrl: null, latitude: null, longitude: null, isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
  },
  {
    id: 302, otherUserId: 102, otherUserFirstName: "Luca", otherUserLastName: "Rossi",
    otherUserProfilePhotoUrl: null, otherUserOnline: true, unreadCount: 1,
    lastMessageAt: new Date(now.getTime() - 15 * 60000).toISOString(),
    lastMessage: {
      id: 3002, conversationId: 302, senderId: 102, senderFirstName: "Luca", senderLastName: "Rossi",
      content: "Nos falta un jugador para el torneo, ¿te apuntas?", type: "TEXT",
      mediaUrl: null, latitude: null, longitude: null, isRead: false,
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
  },
  {
    id: 303, otherUserId: 104, otherUserFirstName: "Sofia", otherUserLastName: "Kowalska",
    otherUserProfilePhotoUrl: null, otherUserOnline: false, unreadCount: 0,
    lastMessageAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    lastMessage: {
      id: 3003, conversationId: 303, senderId: 1, senderFirstName: "Tú", senderLastName: "",
      content: "¡Genial! Nos vemos en la parada de surf 🏄‍♀️", type: "TEXT",
      mediaUrl: null, latitude: null, longitude: null, isRead: true,
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
  },
  {
    id: 304, otherUserId: 105, otherUserFirstName: "Erik", otherUserLastName: "Johansson",
    otherUserProfilePhotoUrl: null, otherUserOnline: true, unreadCount: 2,
    lastMessageAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    lastMessage: {
      id: 3004, conversationId: 304, senderId: 105, senderFirstName: "Erik", senderLastName: "Johansson",
      content: "He encontrado un sitio increíble para fotos 📸", type: "TEXT",
      mediaUrl: null, latitude: null, longitude: null, isRead: false,
      createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    },
  },
  {
    id: 305, otherUserId: 106, otherUserFirstName: "Chloé", otherUserLastName: "Martin",
    otherUserProfilePhotoUrl: null, otherUserOnline: false, unreadCount: 0,
    lastMessageAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
    lastMessage: {
      id: 3005, conversationId: 305, senderId: 1, senderFirstName: "Tú", senderLastName: "",
      content: "¡Nos vemos en la fiesta! 🎉", type: "TEXT",
      mediaUrl: null, latitude: null, longitude: null, isRead: true,
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
    },
  },
  {
    id: 306, otherUserId: 103, otherUserFirstName: "Anna", otherUserLastName: "Müller",
    otherUserProfilePhotoUrl: null, otherUserOnline: false, unreadCount: 0,
    lastMessageAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    lastMessage: {
      id: 3006, conversationId: 306, senderId: 103, senderFirstName: "Anna", senderLastName: "Müller",
      content: "Danke! La receta quedó genial 🍝", type: "TEXT",
      mediaUrl: null, latitude: null, longitude: null, isRead: true,
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    },
  },
];

// ═══ Comunidades mock ═══
export const MOCK_COMMUNITIES: CommunityData[] = [
  {
    id: 401, name: "Erasmus Barcelona 2025/26", description: "Comunidad oficial de Erasmus en Barcelona. Eventos, tips y más.",
    category: "CITY", coverImageUrl: null, isPublic: true, memberCount: 342, createdAt: d(-90),
    currentUserRole: "MEMBER", isMember: true,
    membersPreview: [
      { userId: 101, firstName: "Marie", lastName: "Dupont", profilePhotoUrl: null },
      { userId: 102, firstName: "Luca", lastName: "Rossi", profilePhotoUrl: null },
      { userId: 104, firstName: "Sofia", lastName: "Kowalska", profilePhotoUrl: null },
    ],
  },
  {
    id: 402, name: "Tech Erasmus Europe", description: "Para estudiantes de informática, ingeniería y tech. Hackathons, proyectos y networking.",
    category: "INTEREST", coverImageUrl: null, isPublic: true, memberCount: 189, createdAt: d(-120),
    currentUserRole: null, isMember: false,
    membersPreview: [
      { userId: 102, firstName: "Luca", lastName: "Rossi", profilePhotoUrl: null },
      { userId: 105, firstName: "Erik", lastName: "Johansson", profilePhotoUrl: null },
    ],
  },
  {
    id: 403, name: "UB — Universitat de Barcelona", description: "Estudiantes Erasmus en la UB. Horarios, grupos de estudio, quedadas.",
    category: "UNIVERSITY", coverImageUrl: null, isPublic: true, memberCount: 156, createdAt: d(-80),
    currentUserRole: "MEMBER", isMember: true,
    membersPreview: [
      { userId: 101, firstName: "Marie", lastName: "Dupont", profilePhotoUrl: null },
    ],
  },
  {
    id: 404, name: "Foodies Erasmus 🍕", description: "Cocina internacional, cenas compartidas y rutas gastronómicas por toda Europa.",
    category: "INTEREST", coverImageUrl: null, isPublic: true, memberCount: 278, createdAt: d(-60),
    currentUserRole: null, isMember: false,
    membersPreview: [
      { userId: 103, firstName: "Anna", lastName: "Müller", profilePhotoUrl: null },
      { userId: 102, firstName: "Luca", lastName: "Rossi", profilePhotoUrl: null },
      { userId: 106, firstName: "Chloé", lastName: "Martin", profilePhotoUrl: null },
    ],
  },
  {
    id: 405, name: "Deportes & Outdoor", description: "Senderismo, surf, escalada, fútbol... ¡Mueve el body! 💪",
    category: "INTEREST", coverImageUrl: null, isPublic: true, memberCount: 201, createdAt: d(-45),
    currentUserRole: "MEMBER", isMember: true,
    membersPreview: [
      { userId: 104, firstName: "Sofia", lastName: "Kowalska", profilePhotoUrl: null },
      { userId: 108, firstName: "Katarina", lastName: "Novak", profilePhotoUrl: null },
    ],
  },
  {
    id: 406, name: "Erasmus Photography Club 📸", description: "Comparte tus mejores fotos de tu experiencia Erasmus. Photo walks mensuales.",
    category: "INTEREST", coverImageUrl: null, isPublic: true, memberCount: 134, createdAt: d(-30),
    currentUserRole: null, isMember: false,
    membersPreview: [
      { userId: 105, firstName: "Erik", lastName: "Johansson", profilePhotoUrl: null },
      { userId: 101, firstName: "Marie", lastName: "Dupont", profilePhotoUrl: null },
    ],
  },
  {
    id: 407, name: "Madrid Erasmus Life", description: "Todo sobre Madrid: residencias, transporte, ocio nocturno, cultura.",
    category: "CITY", coverImageUrl: null, isPublic: true, memberCount: 289, createdAt: d(-100),
    currentUserRole: null, isMember: false,
    membersPreview: [
      { userId: 102, firstName: "Luca", lastName: "Rossi", profilePhotoUrl: null },
      { userId: 107, firstName: "Pedro", lastName: "García", profilePhotoUrl: null },
    ],
  },
  {
    id: 408, name: "Language Exchange Hub", description: "Intercambio de idiomas entre Erasmus. Tandems, clubs de conversación y más.",
    category: "GENERAL", coverImageUrl: null, isPublic: true, memberCount: 412, createdAt: d(-150),
    currentUserRole: "MEMBER", isMember: true,
    membersPreview: [
      { userId: 101, firstName: "Marie", lastName: "Dupont", profilePhotoUrl: null },
      { userId: 103, firstName: "Anna", lastName: "Müller", profilePhotoUrl: null },
      { userId: 107, firstName: "Pedro", lastName: "García", profilePhotoUrl: null },
    ],
  },
];

// ═══ Historias mock ═══
const storyTime = (hoursAgo: number) => {
  const t = new Date(now.getTime() - hoursAgo * 3600000);
  return t.toISOString();
};
const storyExpiry = (hoursAgo: number) => {
  const t = new Date(now.getTime() - hoursAgo * 3600000 + 24 * 3600000);
  return t.toISOString();
};

export const MOCK_STORIES: UserStories[] = [
  {
    userId: 101, userName: "Marie", userPhoto: null, hasUnviewed: true,
    stories: [
      { id: 501, userId: 101, userFirstName: "Marie", userLastName: "Dupont", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story1/400/700", caption: "Pintando en el Gótico 🎨✨",
        createdAt: storyTime(2), expiresAt: storyExpiry(2), viewCount: 34, viewedByCurrentUser: false },
      { id: 502, userId: 101, userFirstName: "Marie", userLastName: "Dupont", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story2/400/700", caption: "Atardecer desde Montjuïc 🌅",
        createdAt: storyTime(1), expiresAt: storyExpiry(1), viewCount: 28, viewedByCurrentUser: false },
    ],
  },
  {
    userId: 102, userName: "Luca", userPhoto: null, hasUnviewed: true,
    stories: [
      { id: 503, userId: 102, userFirstName: "Luca", userLastName: "Rossi", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story3/400/700", caption: "Pizza casera level: master 🍕👨‍🍳",
        createdAt: storyTime(3), expiresAt: storyExpiry(3), viewCount: 56, viewedByCurrentUser: false },
    ],
  },
  {
    userId: 105, userName: "Erik", userPhoto: null, hasUnviewed: true,
    stories: [
      { id: 504, userId: 105, userFirstName: "Erik", userLastName: "Johansson", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story4/400/700", caption: "Roma by night 🌙",
        createdAt: storyTime(4), expiresAt: storyExpiry(4), viewCount: 42, viewedByCurrentUser: false },
      { id: 505, userId: 105, userFirstName: "Erik", userLastName: "Johansson", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story5/400/700", caption: "Colosseo views 🏟️",
        createdAt: storyTime(1.5), expiresAt: storyExpiry(1.5), viewCount: 18, viewedByCurrentUser: false },
    ],
  },
  {
    userId: 104, userName: "Sofia", userPhoto: null, hasUnviewed: false,
    stories: [
      { id: 506, userId: 104, userFirstName: "Sofia", userLastName: "Kowalska", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story6/400/700", caption: "Beach day in Cascais 🏖️",
        createdAt: storyTime(8), expiresAt: storyExpiry(8), viewCount: 67, viewedByCurrentUser: true },
    ],
  },
  {
    userId: 106, userName: "Chloé", userPhoto: null, hasUnviewed: true,
    stories: [
      { id: 507, userId: 106, userFirstName: "Chloé", userLastName: "Martin", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story7/400/700", caption: "Prague is magical ✨🇨��",
        createdAt: storyTime(5), expiresAt: storyExpiry(5), viewCount: 51, viewedByCurrentUser: false },
    ],
  },
  {
    userId: 108, userName: "Katarina", userPhoto: null, hasUnviewed: true,
    stories: [
      { id: 508, userId: 108, userFirstName: "Katarina", userLastName: "Novak", userProfilePhotoUrl: null,
        mediaUrl: "https://picsum.photos/seed/story8/400/700", caption: "Diving en les Calanques 🤿🐟",
        createdAt: storyTime(6), expiresAt: storyExpiry(6), viewCount: 39, viewedByCurrentUser: false },
    ],
  },
];

// ═══ Friend requests mock ═══
export const MOCK_RECEIVED_REQUESTS: FriendRequestResponse[] = [
  {
    id: 601, senderId: 103, senderFirstName: "Anna", senderLastName: "Müller", senderProfilePhotoUrl: undefined,
    receiverId: 1, receiverFirstName: "Tú", receiverLastName: "", receiverProfilePhotoUrl: undefined,
    status: "PENDING", createdAt: storyTime(2),
  },
  {
    id: 602, senderId: 106, senderFirstName: "Chloé", senderLastName: "Martin", senderProfilePhotoUrl: undefined,
    receiverId: 1, receiverFirstName: "Tú", receiverLastName: "", receiverProfilePhotoUrl: undefined,
    status: "PENDING", createdAt: storyTime(12),
  },
  {
    id: 603, senderId: 108, senderFirstName: "Katarina", senderLastName: "Novak", senderProfilePhotoUrl: undefined,
    receiverId: 1, receiverFirstName: "Tú", receiverLastName: "", receiverProfilePhotoUrl: undefined,
    status: "PENDING", createdAt: storyTime(24),
  },
];

export const MOCK_SENT_REQUESTS: FriendRequestResponse[] = [
  {
    id: 604, senderId: 1, senderFirstName: "Tú", senderLastName: "", senderProfilePhotoUrl: undefined,
    receiverId: 107, receiverFirstName: "Pedro", receiverLastName: "García", receiverProfilePhotoUrl: undefined,
    status: "PENDING", createdAt: storyTime(6),
  },
];
