# StockTrack - Sistema de Control de Stock Asignado a Sucursales

StockTrack es una aplicación web full stack desarrollada como proyecto final para demostrar el uso de frontend React, backend Node.js/Express, API REST, autenticación JWT, roles, validaciones, ORM Prisma, PostgreSQL y despliegue en una VM AWS.

La aplicación permite a un equipo de Mesa de Ayuda registrar artículos tecnológicos, controlar stock disponible y asignar cantidades a sucursales. El caso de uso principal es mantener trazabilidad cuando se compran artículos para montaje de sucursales y luego esos artículos se asignan, liberan o reasignan.

---

## 1. Objetivo del proyecto

El objetivo es construir una aplicación que permita:

- Registrar artículos con código, nombre, descripción, categoría y stock mínimo.
- Registrar sucursales con código, nombre, estado y disponibilidad.
- Registrar ingresos de stock.
- Asignar stock disponible a una sucursal.
- Liberar asignaciones cuando una sucursal se cancela o el stock vuelve a estar disponible.
- Visualizar dashboard con indicadores principales.
- Consultar historial de movimientos con filtros.
- Proteger la API mediante JWT y control de roles.

---

## 2. Tecnologías utilizadas

### Frontend

- React
- Vite
- React Router DOM
- Axios
- SweetAlert2
- CSS propio con paleta verde/azul inspirada en entorno corporativo

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT)
- Zod para validación de datos
- bcryptjs para hash de contraseñas
- CORS y dotenv

### Despliegue

- VM AWS Ubuntu
- GitHub Actions con runner self-hosted
- PM2 para ejecutar backend
- Nginx para servir frontend y proxy de API
- PostgreSQL instalado en la VM

---

## 3. Arquitectura general

```txt
Usuario
  ->
Frontend React + Vite
  -> Axios con Bearer Token
API REST Node.js + Express
  -> Prisma ORM
PostgreSQL
```

Estructura principal:

```txt
proyecto_final_idt/
|---- client/                  # Frontend React
|   |---- src/
|   |   |---- api/
|   |   |---- components/
|   |   |---- context/
|   |   |---- pages/
|   |   `---- utils/
|   `---- package.json
|
|---- server/                  # Backend Express MVC
|   |---- prisma/
|   |   |---- schema.prisma
|   |   `---- seed.js
|   |---- src/
|   |   |---- config/
|   |   |---- controllers/
|   |   |---- middlewares/
|   |   |---- routes/
|   |   |---- schemas/
|   |   |---- services/
|   |   |---- app.js
|   |   `---- server.js
|   `---- package.json
|
`---- .github/workflows/deploy.yml
```

---

## 4. Módulos implementados

### Autenticación

- Login con email y contraseña.
- Generación de token JWT.
- Persistencia del token en `localStorage`.
- Middleware de autenticación en backend.

### Roles

Roles previstos:

- `ADMIN`
- `OPERADOR`
- `CONSULTA`

El backend ya contempla control de permisos por rol mediante middleware. Para la versión MVP se creó un usuario administrador inicial mediante seed. La pantalla de administración de usuarios no forma parte del alcance actual y queda documentada como mejora futura.

### Categorías

- Listado de categorías.
- Creación de categorías.
- Validación con Zod.
- Protección con JWT y rol admin para creación.

### Artículos

- Crear artículo.
- Editar artículo.
- Activar/desactivar artículo mediante borrado lógico.
- Listar artículos.
- Relacionar artículo con categoría.
- Confirmaciones con SweetAlert2.

### Sucursales

- Crear sucursal.
- Editar sucursal.
- Activar/desactivar sucursal.
- Estados: `PLANIFICADA`, `ACTIVA`, `PAUSADA`, `CANCELADA`.

### Stock

- Registrar ingreso de stock.
- Consultar stock general.
- Consultar stock por artículo.
- Asignar stock a sucursal.
- Liberar asignaciones.
- Validar stock disponible antes de asignar.

### Movimientos

- Historial de ingresos, asignaciones y liberaciones.
- Filtros por artículo, sucursal y tipo de movimiento.

### Dashboard

- Artículos activos.
- Sucursales activas.
- Stock total.
- Stock asignado.
- Stock disponible.
- Artículos bajo stock.
- Últimos movimientos.

---

## 5. Modelo de datos principal

Tablas principales:

```txt
roles
users
categories
items
branches
stock_movements
branch_assignments
```

Relaciones:

```txt
Role 1 -> N User
Category 1 -> N Item
Item 1 -> N StockMovement
Item 1 -> N BranchAssignment
Branch 1 -> N StockMovement
Branch 1 -> N BranchAssignment
User 1 -> N StockMovement
User 1 -> N BranchAssignment
```

Estados usados en asignaciones:

```txt
RESERVADO
ENVIADO
LIBERADO
REASIGNADO
CANCELADO
```

Tipos de movimiento:

```txt
INGRESO
ASIGNACION
LIBERACION
SALIDA
```

---

## 6. Lógica de stock

La aplicación calcula el stock de forma derivada:

```txt
Stock total = ingresos - salidas
Stock asignado = asignaciones activas con estado RESERVADO o ENVIADO
Stock disponible = stock total - stock asignado
```

Esta estrategia permite mantener trazabilidad y evita alterar directamente el stock sin registrar movimiento.

---

## 7. Variables de entorno

### Backend: `server/.env`

```env
PORT=3001
DATABASE_URL="postgresql://stocktrack_user:stocktrack123@localhost:5432/stocktrack?schema=public"
JWT_SECRET="stocktrack_secret_key_2026_produccion"
JWT_EXPIRES_IN="8h"
```

### Frontend local: `client/.env`

```env
VITE_API_URL=http://localhost:3001/api
```

### Frontend producción: `client/.env.production`

```env
VITE_API_URL=/api
```

---

## 8. Instalación local

### 8.1 Clonar repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto_final_idt
```

### 8.2 Backend

```bash
cd server
npm install
```

Crear archivo `.env` con la configuración de base de datos.

Ejecutar migraciones:

```bash
npx prisma migrate dev
```

Ejecutar seed:

```bash
npx prisma db seed
```

Levantar backend:

```bash
npm run dev
```

Validar:

```bash
curl http://localhost:3001/health
```

### 8.3 Frontend

```bash
cd client
npm install
npm run dev
```

Abrir:

```txt
http://localhost:5173
```

---

## 9. Usuario de prueba

Usuario administrador creado por seed:

```txt
Email: admin@stocktrack.com
Password: admin123
Rol: ADMIN
```

Nota sobre usuarios y roles:

El sistema implementa la autenticación y la autorización por roles a nivel backend. Para la demo se creó un usuario administrador inicial. Los roles `OPERADOR` y `CONSULTA` están previstos en la base y en la lógica de permisos, pero la pantalla de administración/registro de usuarios se deja como mejora futura para mantener el alcance del MVP.

Si el evaluador exige demostrar múltiples roles, se puede crear usuarios adicionales mediante seed o mediante un endpoint de usuarios que puede agregarse como mejora posterior.

---

## 10. Endpoints principales

### Auth

```txt
POST /api/auth/login
```

### Categorías

```txt
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Artículos

```txt
GET    /api/items
GET    /api/items/:id
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
```

### Sucursales

```txt
GET    /api/branches
GET    /api/branches/:id
POST   /api/branches
PUT    /api/branches/:id
DELETE /api/branches/:id
```

### Stock

```txt
GET  /api/stock
GET  /api/stock/item/:itemId
POST /api/stock/in
POST /api/stock/assign
POST /api/stock/assignments/:id/release
GET  /api/stock/assignments
GET  /api/stock/movements
```

### Dashboard

```txt
GET /api/dashboard/summary
```

---

## 11. Prueba rápida de API

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@stocktrack.com","password":"admin123"}'
```

### Health

```bash
curl http://localhost:3001/health
```

Respuesta esperada:

```json
{
  "status": "OK",
  "message": "API StockTrack funcionando correctamente"
}
```

---

## 12. Flujo recomendado para probar la aplicación

1. Iniciar sesión con el usuario admin.
2. Crear una categoría o usar una existente.
3. Crear un artículo.
4. Crear una sucursal activa.
5. Registrar ingreso de stock para el artículo.
6. Asignar parte del stock a una sucursal.
7. Verificar que el stock disponible disminuye y el asignado aumenta.
8. Liberar la asignación.
9. Verificar que el stock disponible vuelve a aumentar.
10. Revisar el historial en la pantalla de movimientos.

---

## 13. Despliegue en VM AWS

La aplicación se desplegó en una VM AWS con:

- Backend ejecutado por PM2.
- Frontend compilado con Vite y servido por Nginx.
- Nginx actuando como proxy inverso para `/api`.
- PostgreSQL instalado en la misma VM.
- GitHub Actions self-hosted runner para desplegar en cada push a `main`.

### Backend con PM2

```bash
pm2 start src/server.js --name stocktrack-api
pm2 save
pm2 status
```

### Nginx

Configuración base:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/stocktrack;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 14. GitHub Actions

El workflow se encuentra en:

```txt
.github/workflows/deploy.yml
```

Responsabilidades del workflow:

- Hacer checkout del repositorio.
- Crear `.env` del backend usando GitHub Secrets.
- Instalar dependencias del backend.
- Ejecutar Prisma generate, migrate deploy y seed.
- Reiniciar backend con PM2.
- Crear `.env.production` del frontend.
- Compilar frontend.
- Publicar el build en `/var/www/stocktrack`.
- Reiniciar Nginx.

Secrets requeridos:

```txt
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
```

---

## 15. Seguridad y validaciones

- Contraseñas encriptadas con bcryptjs.
- JWT para autenticación.
- Middleware de roles para rutas protegidas.
- Zod para validar datos antes de llegar a la base.
- Prisma para acceso controlado a PostgreSQL.
- Borrado lógico mediante campo `active` para conservar historial.

---

## 16. Limitaciones conocidas

- No se implementó pantalla de administración de usuarios.
- No se implementó registro público de usuarios.
- No se implementaron notificaciones en tiempo real con WebSockets.
- No se implementó exportación a Excel/PDF.
- No se implementó HTTPS, aunque se recomienda configurarlo con Certbot para producción real.

Estas limitaciones están alineadas con un MVP académico y pueden presentarse como mejoras futuras.

---

## 17. Mejoras futuras

- CRUD de usuarios desde el panel admin.
- Creación de usuarios OPERADOR y CONSULTA desde interfaz.
- Exportación de movimientos a Excel.
- Dashboard con gráficos.
- Auditoría avanzada por usuario.
- HTTPS con certificado SSL.
- WebSockets para actualización en tiempo real.
- Filtros por rango de fechas.
- Módulo de reasignación directa entre sucursales.

---

## 18. Estado del proyecto

Estado actual:

```txt
Backend funcional: completo para MVP
Frontend funcional: completo para MVP
Deploy: operativo en VM AWS
Pendiente: mejoras futuras y endurecimiento de seguridad
```

El sistema está listo para demostración académica y puede ser probado mediante navegador y endpoints REST.
