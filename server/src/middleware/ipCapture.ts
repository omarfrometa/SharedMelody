import { Request, Response, NextFunction } from 'express';

// Los tipos están definidos en src/types/express.d.ts

/**
 * Middleware para capturar la dirección IP externa real del cliente
 * Considera proxies, load balancers, CDNs y simula IPs externas en desarrollo
 */
export const captureClientIP = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Orden de prioridad para obtener la IP real
    const ipSources = [
      req.headers['cf-connecting-ip'], // Cloudflare
      req.headers['x-real-ip'], // Nginx proxy
      req.headers['x-forwarded-for'], // Standard proxy header
      req.headers['x-client-ip'], // Apache mod_proxy
      req.headers['x-cluster-client-ip'], // Cluster
      req.headers['x-forwarded'], // General forwarded
      req.headers['forwarded-for'], // RFC 7239
      req.headers['forwarded'], // RFC 7239
      req.connection?.remoteAddress, // Direct connection
      req.socket?.remoteAddress, // Socket connection
      req.ip // Express default
    ];

    let clientIP: string | undefined;

    // Buscar la primera IP válida
    for (const source of ipSources) {
      if (source && typeof source === 'string') {
        // Si hay múltiples IPs (x-forwarded-for), tomar la primera (IP original del cliente)
        const ip = source.split(',')[0].trim();

        // En desarrollo, simular IP externa si es privada
        if (process.env.NODE_ENV === 'development' && isPrivateIP(ip)) {
          clientIP = getSimulatedExternalIP();
          console.log(`🧪 IP privada detectada (${ip}), usando IP simulada: ${clientIP}`);
          break;
        }

        // Validar que sea una IP válida y pública
        if (isValidPublicIP(ip)) {
          clientIP = ip;
          break;
        }
      }
    }

    // Fallback final
    if (!clientIP) {
      if (process.env.NODE_ENV === 'development') {
        clientIP = getSimulatedExternalIP();
        console.log(`🧪 No se encontró IP válida, usando IP simulada: ${clientIP}`);
      } else {
        clientIP = '127.0.0.1'; // En producción, usar localhost como último recurso
      }
    }

    (req as any).clientIP = clientIP;

    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 External IP captured: ${(req as any).clientIP} for ${req.method} ${req.path}`);
    }

    next();
  } catch (error) {
    console.error('Error capturing client IP:', error);
    (req as any).clientIP = process.env.NODE_ENV === 'development' ? getSimulatedExternalIP() : '127.0.0.1';
    next();
  }
};



/**
 * Valida si una cadena es una dirección IP pública válida
 */
function isValidPublicIP(ip: string): boolean {
  // Regex para IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Regex para IPv6 (simplificado)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  // Verificar que sea una IP válida
  const isValid = ipv4Regex.test(ip) || ipv6Regex.test(ip);

  // Verificar que sea pública (no privada)
  const isPublic = !isPrivateIP(ip);

  return isValid && isPublic;
}

/**
 * Verifica si una IP es privada/local/reservada
 */
function isPrivateIP(ip: string): boolean {
  if (!ip) return true;

  // Rangos IPv4 privados y reservados
  const privateRanges = [
    /^127\./, // 127.0.0.0/8 (localhost)
    /^10\./, // 10.0.0.0/8 (private)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (private)
    /^192\.168\./, // 192.168.0.0/16 (private)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
    /^0\./, // 0.0.0.0/8 (this network)
    /^224\./, // 224.0.0.0/4 (multicast)
    /^240\./, // 240.0.0.0/4 (reserved)
    /^255\.255\.255\.255$/, // broadcast
    /^::1$/, // IPv6 localhost
    /^::/, // IPv6 unspecified
    /^fe80:/, // IPv6 link-local
    /^fc00:/, // IPv6 unique local
    /^fd00:/, // IPv6 unique local
    /^ff00:/ // IPv6 multicast
  ];

  return privateRanges.some(range => range.test(ip));
}

/**
 * Obtiene información adicional del request para tracking
 */
export const getRequestInfo = (req: Request) => {
  return {
    ip: (req as any).clientIP || '127.0.0.1',
    userAgent: req.headers['user-agent'] || '',
    referrer: req.headers.referer || req.headers.referrer || '',
    sessionId: req.sessionID || '',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  };
};

/**
 * Genera una IP externa simulada para desarrollo
 * Simula diferentes usuarios con IPs públicas reales
 */
function getSimulatedExternalIP(): string {
  const simulatedIPs = [
    '203.0.113.1',    // Documentación RFC 5737 - Usuario 1
    '198.51.100.1',   // Documentación RFC 5737 - Usuario 2
    '192.0.2.1',      // Documentación RFC 5737 - Usuario 3
    '8.8.8.8',        // Google DNS - Usuario 4
    '1.1.1.1',        // Cloudflare DNS - Usuario 5
    '208.67.222.222', // OpenDNS - Usuario 6
    '185.228.168.1',  // CleanBrowsing - Usuario 7
    '76.76.19.19',    // Alternate DNS - Usuario 8
    '9.9.9.9',        // Quad9 DNS - Usuario 9
    '64.6.64.6'       // Verisign DNS - Usuario 10
  ];

  // Cambiar IP cada 30 segundos para simular diferentes usuarios
  const index = Math.floor(Date.now() / 30000) % simulatedIPs.length;
  return simulatedIPs[index];
}

/**
 * Middleware específico para logging de requests importantes
 */
export const logImportantRequest = (req: Request, _res: Response, next: NextFunction) => {
  const info = getRequestInfo(req);

  // Log solo para rutas importantes (canciones, etc.)
  if (req.path.includes('/songs/') && req.method === 'GET') {
    console.log(`📊 Important request: ${info.method} ${info.path} from ${info.ip}`);
  }

  next();
};

export default captureClientIP;
