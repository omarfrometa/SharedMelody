// =============================================
// TIPOS PARA GÉNEROS Y AUTORES
// =============================================

export interface MusicalGenre {
  genreId: string;
  genreName: string;
  genreDescription?: string;
  parentGenreId?: string;
  parentGenre?: MusicalGenre;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface Author {
  authorId: string;
  authorName: string;
  authorBio?: string;
  birthDate?: string;
  deathDate?: string;
  countryId?: string;
  country?: {
    countryId: string;
    countryCode: string;
    countryName: string;
  };
  websiteUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SongType {
  typeId: string;
  typeName: 'Original' | 'Cover' | 'Remix' | 'Instrumental' | 'Acoustic' | 'Live' | 'Demo' | 'Karaoke' | 'Mashup' | 'Tribute';
  typeDescription?: string;
  isActive: boolean;
  createdAt: string;
}

// =============================================
// TIPOS PARA CANCIONES
// =============================================

export interface Song {
  songId: string | number;
  title: string;
  artistName: string;
  authorId?: string;
  author?: Author;
  album?: string;
  releaseYear?: number;
  genreId?: string | number;
  genre?: MusicalGenre;
  typeId?: string;
  type?: SongType;
  lyrics?: string;
  lyricsFormat: 'html' | 'markdown' | 'plain';
  audioFileUrl?: string;
  videoFileUrl?: string;
  sheetMusicUrl?: string;
  durationSeconds?: number;
  language?: string;
  explicitContent: boolean;
  uploadedBy: string;
  uploadedByUser?: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  isCollaboration: boolean;
  originalRequestId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  averageRating: number;
  ratingCount: number;
  comments?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Propiedades adicionales del backend
  artistId?: number;
  albumId?: number;
  albumName?: string;
  genreName?: string;
  duration?: string;
  fileUrl?: string;
  fileSize?: number;
  fileFormat?: string;
  isExplicit?: boolean;
  isPublic?: boolean;
  isApproved?: boolean;
  playsCount?: number;
  uploadDate?: string;
}

export interface SongDetailed extends Song {
  uploadedByUsername: string;
  uploadedByName: string;
}

// =============================================
// TIPOS PARA SOLICITUDES DE CANCIONES
// =============================================

export interface SongRequest {
  requestId: string;
  title: string;
  artistName: string;
  album?: string;
  authorName?: string;
  genrePreference?: string;
  comments?: string;
  priorityLevel: 1 | 2 | 3; // 1=baja, 2=media, 3=alta
  requestedBy: string;
  requestedByUser?: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  fulfilledBy?: string;
  fulfilledByUser?: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  fulfilledSongId?: string;
  fulfilledSong?: Song;
  fulfilledAt?: string;
  notificationSent: boolean;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SongRequestDetailed extends SongRequest {
  requestedByUsername: string;
  requestedByName: string;
  requestedByEmail: string;
  fulfilledByUsername?: string;
  fulfilledByName?: string;
  fulfilledSongTitle?: string;
}

export interface CreateSongRequest {
  title: string;
  artistName: string;
  album?: string;
  authorName?: string;
  genrePreference?: string;
  comments?: string;
  priorityLevel?: 1 | 2 | 3;
}

// =============================================
// TIPOS PARA COLABORACIONES
// =============================================

export interface Collaboration {
  collaborationId: string;
  songId: string;
  song?: Song;
  userId: string;
  user?: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  collaborationType: 'uploader' | 'lyricist' | 'composer' | 'performer' | 'editor' | 'contributor';
  contributionDescription?: string;
  status: 'active' | 'inactive' | 'removed';
  createdAt: string;
  createdBy?: string;
}

export interface CreateCollaboration {
  songId: string;
  userId: string;
  collaborationType: 'uploader' | 'lyricist' | 'composer' | 'performer' | 'editor' | 'contributor';
  contributionDescription?: string;
}

// =============================================
// TIPOS PARA RATINGS Y LIKES
// =============================================

export interface SongRating {
  ratingId: string;
  songId: string;
  song?: Song;
  userId: string;
  user?: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  rating: 1 | 2 | 3 | 4 | 5;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SongLike {
  likeId: string;
  songId: string;
  song?: Song;
  userId: string;
  user?: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface CreateSongRating {
  songId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewComment?: string;
}

// =============================================
// TIPOS PARA SUBIDA DE CANCIONES
// =============================================

export interface CreateSong {
  title: string;
  artistName: string;
  authorId?: string; // ID del autor/artista seleccionado
  album?: string;
  releaseYear?: number;
  genreId?: string;
  typeId?: string;
  lyrics?: string;
  lyricsFormat?: 'html' | 'markdown' | 'plain';
  durationSeconds?: number;
  language?: string;
  explicitContent?: boolean;
  isCollaboration?: boolean;
  originalRequestId?: string;
  comments?: string;
  tags?: string[];
  uploadedBy?: string;
}

export interface UpdateSong extends Partial<CreateSong> {
  songId: string;
}

// =============================================
// TIPOS PARA NOTIFICACIONES
// =============================================

export interface EmailNotification {
  notificationId: string;
  userId: string;
  user?: {
    userId: string;
    username: string;
    email: string;
  };
  emailAddress: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  relatedSongId?: string;
  relatedSong?: Song;
  relatedRequestId?: string;
  relatedRequest?: SongRequest;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  failedReason?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  scheduledFor: string;
}

// =============================================
// TIPOS PARA FILTROS Y BÚSQUEDAS
// =============================================

export interface SongFilters {
  search?: string;
  genreId?: string;
  authorId?: string;
  typeId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'archived';
  uploadedBy?: string;
  isCollaboration?: boolean;
  language?: string;
  explicitContent?: boolean;
  minRating?: number;
  maxRating?: number;
  releaseYearFrom?: number;
  releaseYearTo?: number;
  tags?: string[];
  sortBy?: 'title' | 'artist' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'average_rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SongRequestFilters {
  search?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  requestedBy?: string;
  fulfilledBy?: string;
  priorityLevel?: 1 | 2 | 3;
  genrePreference?: string;
  sortBy?: 'title' | 'artist' | 'created_at' | 'updated_at' | 'priority_level';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================
// TIPOS PARA RESPUESTAS DE API
// =============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
