# 🔧 TecniGestión - App de Gestión para Técnicos

Aplicación web progresiva (PWA) completa para gestión de clientes, visitas y presupuestos.

## 📋 Características

- ✅ **Clientes**: Crear, editar, eliminar, ver presupuestos asociados
- ✅ **Visitas**: Programar, cambiar estado, ver detalles, crear con cliente nuevo
- ✅ **Presupuestos**: Crear con líneas de detalle, IVA opcional, descargar PDF
- ✅ **Dashboard**: Estadísticas, facturación del mes, accesos rápidos
- ✅ **PWA**: Se instala como app en el móvil
- ✅ **Responsive**: Funciona en móvil, tablet y PC
- ✅ **Autenticación**: Login y registro de usuarios

---

## 🚀 INSTALACIÓN RÁPIDA

### Opción 1: Despliegue Local (para probar)

#### Requisitos:
- Python 3.9 o superior
- Node.js 18 o superior
- npm o yarn

#### Paso 1: Backend

```bash
# Entrar en carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará en: http://localhost:8000

#### Paso 2: Frontend

```bash
# En otra terminal, entrar en carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La app estará en: http://localhost:5173

---

### Opción 2: Despliegue en la Nube (GRATIS)

#### Backend en Railway (gratis)

1. Crea cuenta en https://railway.app
2. Conecta tu GitHub
3. Sube la carpeta `backend` a un repositorio
4. En Railway: "New Project" → "Deploy from GitHub"
5. Railway detectará automáticamente que es Python
6. La URL será algo como: `https://tu-app.railway.app`

#### Frontend en Vercel (gratis)

1. Crea cuenta en https://vercel.com
2. Conecta tu GitHub
3. Sube la carpeta `frontend` a un repositorio
4. En Vercel: "New Project" → Importar repositorio
5. Configura la variable de entorno:
   - `VITE_API_URL` = `https://tu-backend.railway.app/api`
6. Deploy!

---

### Opción 3: Docker (recomendado para producción)

```bash
# En la carpeta raíz del proyecto
docker-compose up -d
```

Esto levantará:
- Backend en puerto 8000
- Frontend en puerto 3000

---

## 📱 INSTALAR COMO APP EN EL MÓVIL

### Android:
1. Abre la web en Chrome
2. Toca el menú (3 puntos)
3. "Añadir a pantalla de inicio"

### iPhone:
1. Abre la web en Safari
2. Toca el botón compartir
3. "Añadir a pantalla de inicio"

---

## 🔧 CONFIGURACIÓN

### Variables de entorno Backend (.env)

```env
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura
DATABASE_PATH=tecnigestion.db
```

### Variables de entorno Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
tecnigestion_pwa/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── requirements.txt     # Dependencias Python
│   └── Dockerfile
├── frontend/
│   ├── public/              # Archivos estáticos
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── context/         # Context de autenticación
│   │   ├── pages/           # Páginas de la app
│   │   ├── services/        # Servicios API
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Punto de entrada
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔐 API ENDPOINTS

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/{id}` - Obtener cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente

### Visitas
- `GET /api/visitas` - Listar visitas
- `POST /api/visitas` - Crear visita
- `PATCH /api/visitas/{id}/estado` - Cambiar estado
- `DELETE /api/visitas/{id}` - Eliminar visita

### Presupuestos
- `GET /api/presupuestos` - Listar presupuestos
- `POST /api/presupuestos` - Crear presupuesto
- `PATCH /api/presupuestos/{id}/estado` - Cambiar estado
- `GET /api/presupuestos/cliente/{id}` - Presupuestos de un cliente

### Dashboard
- `GET /api/dashboard` - Estadísticas del dashboard

---

## 🆘 SOPORTE

Si tienes problemas:

1. Verifica que el backend está corriendo (http://localhost:8000)
2. Verifica las variables de entorno
3. Revisa la consola del navegador para errores
4. Revisa los logs del backend

---

## 📄 LICENCIA

MIT License - Uso libre para proyectos personales y comerciales.

---

Creado con ❤️ para técnicos profesionales.
