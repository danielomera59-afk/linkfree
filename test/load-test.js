import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del escenario de carga
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Subir gradualmente a 50 usuarios concurrentes en 30s
    { duration: '1m',  target: 100 }, // Mantener 100 usuarios durante 1 minuto
    { duration: '30s', target: 0 },   // Bajar a 0 usuarios
  ],
  thresholds: {
    // REQUISITO NO FUNCIONAL: El 95% de las peticiones debe responder en menos de 2000ms (2s)
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  // Reemplaza por la URL pública de tu backend en Render
  const BASE_URL = 'https://tu-app.onrender.com';

  // 1. Probar la ruta pública o de healthcheck
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'status es 200': (r) => r.status === 200,
    'tiempo < 2s': (r) => r.timings.duration < 2000,
  });

  // Pauta de espera entre peticiones simulando interacción humana real (1 segundo)
  sleep(1);
}