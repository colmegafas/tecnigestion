"""
TecniGestión - Backend API
API REST completa para gestión de técnicos profesionales
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import sqlite3
import os
from contextlib import contextmanager

# ============ CONFIGURACIÓN ============
app = FastAPI(
    title="TecniGestión API",
    description="API para gestión de clientes, visitas y presupuestos",
    version="1.0.0"
)

# CORS - Permitir conexiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "tecnigestion-secret-key-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Base de datos
DATABASE_PATH = os.getenv("DATABASE_PATH", "tecnigestion.db")

# ============ BASE DE DATOS ============
@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Tabla usuarios
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellidos TEXT,
                email TEXT UNIQUE NOT NULL,
                telefono TEXT,
                empresa TEXT,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabla clientes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                nombre TEXT NOT NULL,
                apellidos TEXT,
                email TEXT,
                telefono TEXT NOT NULL,
                telefono_secundario TEXT,
                direccion TEXT,
                ciudad TEXT,
                codigo_postal TEXT,
                provincia TEXT,
                tipo TEXT DEFAULT 'particular',
                nif_cif TEXT,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        """)
        
        # Tabla visitas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visitas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                cliente_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                fecha DATE NOT NULL,
                hora TIME,
                tipo TEXT DEFAULT 'reparacion',
                estado TEXT DEFAULT 'pendiente',
                prioridad TEXT DEFAULT 'normal',
                notas_internas TEXT,
                firma_cliente TEXT,
                nombre_firmante TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        """)
        
        # Tabla presupuestos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS presupuestos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                cliente_id INTEGER NOT NULL,
                numero TEXT UNIQUE NOT NULL,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                subtotal REAL DEFAULT 0,
                iva_porcentaje REAL DEFAULT 21,
                aplicar_iva BOOLEAN DEFAULT 1,
                iva_amount REAL DEFAULT 0,
                total REAL DEFAULT 0,
                estado TEXT DEFAULT 'borrador',
                fecha_emision DATE,
                fecha_validez DATE,
                fecha_rechazo TIMESTAMP,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        """)
        
        # Tabla líneas de presupuesto
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS lineas_presupuesto (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                presupuesto_id INTEGER NOT NULL,
                concepto TEXT NOT NULL,
                descripcion TEXT,
                cantidad REAL DEFAULT 1,
                precio_unitario REAL DEFAULT 0,
                total REAL DEFAULT 0,
                orden INTEGER DEFAULT 0,
                FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
            )
        """)
        
        conn.commit()

# Inicializar BD al arrancar
init_db()

# ============ MODELOS PYDANTIC ============

# Auth
class UserRegister(BaseModel):
    nombre: str
    apellidos: Optional[str] = ""
    email: EmailStr
    telefono: Optional[str] = ""
    empresa: Optional[str] = ""
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    apellidos: Optional[str]
    email: str
    telefono: Optional[str]
    empresa: Optional[str]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Clientes
class ClienteCreate(BaseModel):
    nombre: str
    apellidos: Optional[str] = ""
    email: Optional[str] = ""
    telefono: str
    telefono_secundario: Optional[str] = ""
    direccion: Optional[str] = ""
    ciudad: Optional[str] = ""
    codigo_postal: Optional[str] = ""
    provincia: Optional[str] = ""
    tipo: Optional[str] = "particular"
    nif_cif: Optional[str] = ""
    notas: Optional[str] = ""

class ClienteResponse(BaseModel):
    id: int
    nombre: str
    apellidos: Optional[str]
    email: Optional[str]
    telefono: str
    telefono_secundario: Optional[str]
    direccion: Optional[str]
    ciudad: Optional[str]
    codigo_postal: Optional[str]
    provincia: Optional[str]
    tipo: str
    nif_cif: Optional[str]
    notas: Optional[str]
    created_at: Optional[str]

# Visitas
class VisitaCreate(BaseModel):
    cliente_id: int
    titulo: str
    descripcion: Optional[str] = ""
    fecha: str
    hora: Optional[str] = ""
    tipo: Optional[str] = "reparacion"
    estado: Optional[str] = "pendiente"
    prioridad: Optional[str] = "normal"
    notas_internas: Optional[str] = ""

class VisitaResponse(BaseModel):
    id: int
    cliente_id: int
    cliente_nombre: Optional[str]
    cliente_telefono: Optional[str]
    cliente_direccion: Optional[str]
    titulo: str
    descripcion: Optional[str]
    fecha: str
    hora: Optional[str]
    tipo: str
    estado: str
    prioridad: str
    notas_internas: Optional[str]
    firma_cliente: Optional[str]
    nombre_firmante: Optional[str]
    created_at: Optional[str]
    completed_at: Optional[str]

class CompletarVisita(BaseModel):
    firma_cliente: Optional[str] = ""
    nombre_firmante: Optional[str] = ""
    notas_internas: Optional[str] = ""

# Presupuestos
class LineaPresupuesto(BaseModel):
    concepto: str
    descripcion: Optional[str] = ""
    cantidad: float = 1
    precio_unitario: float = 0

class PresupuestoCreate(BaseModel):
    cliente_id: int
    titulo: str
    descripcion: Optional[str] = ""
    aplicar_iva: bool = True
    iva_porcentaje: float = 21
    fecha_validez: Optional[str] = ""
    notas: Optional[str] = ""
    lineas: List[LineaPresupuesto] = []

class PresupuestoResponse(BaseModel):
    id: int
    cliente_id: int
    cliente_nombre: Optional[str]
    numero: str
    titulo: str
    descripcion: Optional[str]
    subtotal: float
    iva_porcentaje: float
    aplicar_iva: bool
    iva_amount: float
    total: float
    estado: str
    fecha_emision: Optional[str]
    fecha_validez: Optional[str]
    fecha_rechazo: Optional[str]
    dias_para_eliminar: Optional[int]
    notas: Optional[str]
    lineas: List[dict] = []
    created_at: Optional[str]

# ============ FUNCIONES AUXILIARES ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"user_id": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

def generar_numero_presupuesto(usuario_id: int) -> str:
    with get_db() as conn:
        cursor = conn.cursor()
        year = datetime.now().year
        cursor.execute(
            "SELECT COUNT(*) FROM presupuestos WHERE usuario_id = ? AND numero LIKE ?",
            (usuario_id, f"PRES-{year}-%")
        )
        count = cursor.fetchone()[0] + 1
        return f"PRES-{year}-{count:04d}"

def calcular_dias_para_eliminar(fecha_rechazo: str) -> Optional[int]:
    if not fecha_rechazo:
        return None
    try:
        fecha = datetime.fromisoformat(fecha_rechazo.replace('Z', '+00:00'))
        fecha_eliminacion = fecha + timedelta(days=30)
        dias = (fecha_eliminacion - datetime.now(fecha.tzinfo)).days
        return max(0, dias)
    except:
        return None

# ============ ENDPOINTS AUTH ============

@app.post("/api/auth/registro", response_model=TokenResponse)
def registro(user: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verificar si existe
        cursor.execute("SELECT id FROM usuarios WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        # Crear usuario
        password_hash = hash_password(user.password)
        cursor.execute(
            """INSERT INTO usuarios (nombre, apellidos, email, telefono, empresa, password_hash)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user.nombre, user.apellidos, user.email, user.telefono, user.empresa, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        token = create_token(user_id)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(
                id=user_id,
                nombre=user.nombre,
                apellidos=user.apellidos,
                email=user.email,
                telefono=user.telefono,
                empresa=user.empresa
            )
        )

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE email = ?", (credentials.email,))
        user = cursor.fetchone()
        
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
        token = create_token(user["id"])
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(
                id=user["id"],
                nombre=user["nombre"],
                apellidos=user["apellidos"],
                email=user["email"],
                telefono=user["telefono"],
                empresa=user["empresa"]
            )
        )

@app.get("/api/auth/perfil", response_model=UserResponse)
def get_perfil(user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return UserResponse(**dict(user))

# ============ ENDPOINTS CLIENTES ============

@app.get("/api/clientes", response_model=List[ClienteResponse])
def listar_clientes(user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM clientes WHERE usuario_id = ? ORDER BY nombre",
            (user_id,)
        )
        return [ClienteResponse(**dict(row)) for row in cursor.fetchall()]

@app.get("/api/clientes/{cliente_id}", response_model=ClienteResponse)
def obtener_cliente(cliente_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM clientes WHERE id = ? AND usuario_id = ?",
            (cliente_id, user_id)
        )
        cliente = cursor.fetchone()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return ClienteResponse(**dict(cliente))

@app.post("/api/clientes", response_model=ClienteResponse)
def crear_cliente(cliente: ClienteCreate, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO clientes (usuario_id, nombre, apellidos, email, telefono, 
               telefono_secundario, direccion, ciudad, codigo_postal, provincia, tipo, nif_cif, notas)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, cliente.nombre, cliente.apellidos, cliente.email, cliente.telefono,
             cliente.telefono_secundario, cliente.direccion, cliente.ciudad, cliente.codigo_postal,
             cliente.provincia, cliente.tipo, cliente.nif_cif, cliente.notas)
        )
        conn.commit()
        cliente_id = cursor.lastrowid
        
        cursor.execute("SELECT * FROM clientes WHERE id = ?", (cliente_id,))
        return ClienteResponse(**dict(cursor.fetchone()))

@app.put("/api/clientes/{cliente_id}", response_model=ClienteResponse)
def actualizar_cliente(cliente_id: int, cliente: ClienteCreate, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE clientes SET nombre=?, apellidos=?, email=?, telefono=?, 
               telefono_secundario=?, direccion=?, ciudad=?, codigo_postal=?, 
               provincia=?, tipo=?, nif_cif=?, notas=?
               WHERE id=? AND usuario_id=?""",
            (cliente.nombre, cliente.apellidos, cliente.email, cliente.telefono,
             cliente.telefono_secundario, cliente.direccion, cliente.ciudad, cliente.codigo_postal,
             cliente.provincia, cliente.tipo, cliente.nif_cif, cliente.notas,
             cliente_id, user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        cursor.execute("SELECT * FROM clientes WHERE id = ?", (cliente_id,))
        return ClienteResponse(**dict(cursor.fetchone()))

@app.delete("/api/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM clientes WHERE id = ? AND usuario_id = ?",
            (cliente_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return {"message": "Cliente eliminado"}

# ============ ENDPOINTS VISITAS ============

@app.get("/api/visitas", response_model=List[VisitaResponse])
def listar_visitas(
    fecha: Optional[str] = None,
    estado: Optional[str] = None,
    user_id: int = Depends(get_current_user)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT v.*, c.nombre || ' ' || COALESCE(c.apellidos, '') as cliente_nombre,
                   c.telefono as cliente_telefono, c.direccion || ', ' || c.ciudad as cliente_direccion
            FROM visitas v
            JOIN clientes c ON v.cliente_id = c.id
            WHERE v.usuario_id = ?
        """
        params = [user_id]
        
        if fecha:
            query += " AND v.fecha = ?"
            params.append(fecha)
        if estado:
            query += " AND v.estado = ?"
            params.append(estado)
        
        query += " ORDER BY v.fecha DESC, v.hora"
        cursor.execute(query, params)
        
        return [VisitaResponse(**dict(row)) for row in cursor.fetchall()]

@app.get("/api/visitas/hoy", response_model=List[VisitaResponse])
def visitas_hoy(user_id: int = Depends(get_current_user)):
    hoy = datetime.now().strftime("%Y-%m-%d")
    return listar_visitas(fecha=hoy, user_id=user_id)

@app.get("/api/visitas/{visita_id}", response_model=VisitaResponse)
def obtener_visita(visita_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT v.*, c.nombre || ' ' || COALESCE(c.apellidos, '') as cliente_nombre,
                      c.telefono as cliente_telefono, c.direccion || ', ' || c.ciudad as cliente_direccion
               FROM visitas v
               JOIN clientes c ON v.cliente_id = c.id
               WHERE v.id = ? AND v.usuario_id = ?""",
            (visita_id, user_id)
        )
        visita = cursor.fetchone()
        if not visita:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        return VisitaResponse(**dict(visita))

@app.post("/api/visitas", response_model=VisitaResponse)
def crear_visita(visita: VisitaCreate, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO visitas (usuario_id, cliente_id, titulo, descripcion, fecha, hora, tipo, estado, prioridad, notas_internas)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, visita.cliente_id, visita.titulo, visita.descripcion, visita.fecha,
             visita.hora, visita.tipo, visita.estado, visita.prioridad, visita.notas_internas)
        )
        conn.commit()
        visita_id = cursor.lastrowid
        return obtener_visita(visita_id, user_id)

@app.put("/api/visitas/{visita_id}", response_model=VisitaResponse)
def actualizar_visita(visita_id: int, visita: VisitaCreate, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE visitas SET cliente_id=?, titulo=?, descripcion=?, fecha=?, hora=?, 
               tipo=?, estado=?, prioridad=?, notas_internas=?
               WHERE id=? AND usuario_id=?""",
            (visita.cliente_id, visita.titulo, visita.descripcion, visita.fecha, visita.hora,
             visita.tipo, visita.estado, visita.prioridad, visita.notas_internas,
             visita_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        return obtener_visita(visita_id, user_id)

@app.patch("/api/visitas/{visita_id}/estado")
def cambiar_estado_visita(visita_id: int, estado: str, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        completed_at = datetime.now().isoformat() if estado == "completada" else None
        cursor.execute(
            "UPDATE visitas SET estado = ?, completed_at = ? WHERE id = ? AND usuario_id = ?",
            (estado, completed_at, visita_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        return {"message": "Estado actualizado"}

@app.patch("/api/visitas/{visita_id}/completar")
def completar_visita(visita_id: int, data: CompletarVisita, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE visitas SET estado = 'completada', completed_at = ?, 
               firma_cliente = ?, nombre_firmante = ?, notas_internas = ?
               WHERE id = ? AND usuario_id = ?""",
            (datetime.now().isoformat(), data.firma_cliente, data.nombre_firmante,
             data.notas_internas, visita_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        return {"message": "Visita completada"}

@app.delete("/api/visitas/{visita_id}")
def eliminar_visita(visita_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM visitas WHERE id = ? AND usuario_id = ?", (visita_id, user_id))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        return {"message": "Visita eliminada"}

# ============ ENDPOINTS PRESUPUESTOS ============

@app.get("/api/presupuestos", response_model=List[PresupuestoResponse])
def listar_presupuestos(estado: Optional[str] = None, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT p.*, c.nombre || ' ' || COALESCE(c.apellidos, '') as cliente_nombre
            FROM presupuestos p
            JOIN clientes c ON p.cliente_id = c.id
            WHERE p.usuario_id = ?
        """
        params = [user_id]
        
        if estado:
            query += " AND p.estado = ?"
            params.append(estado)
        
        query += " ORDER BY p.created_at DESC"
        cursor.execute(query, params)
        
        presupuestos = []
        for row in cursor.fetchall():
            pres_dict = dict(row)
            pres_dict['dias_para_eliminar'] = calcular_dias_para_eliminar(pres_dict.get('fecha_rechazo'))
            
            # Obtener líneas
            cursor.execute("SELECT * FROM lineas_presupuesto WHERE presupuesto_id = ? ORDER BY orden", (pres_dict['id'],))
            pres_dict['lineas'] = [dict(l) for l in cursor.fetchall()]
            
            presupuestos.append(PresupuestoResponse(**pres_dict))
        
        return presupuestos

@app.get("/api/presupuestos/cliente/{cliente_id}", response_model=List[PresupuestoResponse])
def presupuestos_cliente(cliente_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT p.*, c.nombre || ' ' || COALESCE(c.apellidos, '') as cliente_nombre
               FROM presupuestos p
               JOIN clientes c ON p.cliente_id = c.id
               WHERE p.usuario_id = ? AND p.cliente_id = ?
               ORDER BY p.created_at DESC""",
            (user_id, cliente_id)
        )
        
        presupuestos = []
        for row in cursor.fetchall():
            pres_dict = dict(row)
            pres_dict['dias_para_eliminar'] = calcular_dias_para_eliminar(pres_dict.get('fecha_rechazo'))
            cursor.execute("SELECT * FROM lineas_presupuesto WHERE presupuesto_id = ? ORDER BY orden", (pres_dict['id'],))
            pres_dict['lineas'] = [dict(l) for l in cursor.fetchall()]
            presupuestos.append(PresupuestoResponse(**pres_dict))
        
        return presupuestos

@app.get("/api/presupuestos/{presupuesto_id}", response_model=PresupuestoResponse)
def obtener_presupuesto(presupuesto_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT p.*, c.nombre || ' ' || COALESCE(c.apellidos, '') as cliente_nombre
               FROM presupuestos p
               JOIN clientes c ON p.cliente_id = c.id
               WHERE p.id = ? AND p.usuario_id = ?""",
            (presupuesto_id, user_id)
        )
        pres = cursor.fetchone()
        if not pres:
            raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
        
        pres_dict = dict(pres)
        pres_dict['dias_para_eliminar'] = calcular_dias_para_eliminar(pres_dict.get('fecha_rechazo'))
        cursor.execute("SELECT * FROM lineas_presupuesto WHERE presupuesto_id = ? ORDER BY orden", (presupuesto_id,))
        pres_dict['lineas'] = [dict(l) for l in cursor.fetchall()]
        
        return PresupuestoResponse(**pres_dict)

@app.post("/api/presupuestos", response_model=PresupuestoResponse)
def crear_presupuesto(presupuesto: PresupuestoCreate, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Calcular totales
        subtotal = sum(l.cantidad * l.precio_unitario for l in presupuesto.lineas)
        iva_amount = subtotal * (presupuesto.iva_porcentaje / 100) if presupuesto.aplicar_iva else 0
        total = subtotal + iva_amount
        
        numero = generar_numero_presupuesto(user_id)
        fecha_emision = datetime.now().strftime("%Y-%m-%d")
        
        cursor.execute(
            """INSERT INTO presupuestos (usuario_id, cliente_id, numero, titulo, descripcion,
               subtotal, iva_porcentaje, aplicar_iva, iva_amount, total, estado, fecha_emision, fecha_validez, notas)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', ?, ?, ?)""",
            (user_id, presupuesto.cliente_id, numero, presupuesto.titulo, presupuesto.descripcion,
             subtotal, presupuesto.iva_porcentaje, presupuesto.aplicar_iva, iva_amount, total,
             fecha_emision, presupuesto.fecha_validez, presupuesto.notas)
        )
        presupuesto_id = cursor.lastrowid
        
        # Insertar líneas
        for i, linea in enumerate(presupuesto.lineas):
            total_linea = linea.cantidad * linea.precio_unitario
            cursor.execute(
                """INSERT INTO lineas_presupuesto (presupuesto_id, concepto, descripcion, cantidad, precio_unitario, total, orden)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (presupuesto_id, linea.concepto, linea.descripcion, linea.cantidad, linea.precio_unitario, total_linea, i)
            )
        
        conn.commit()
        return obtener_presupuesto(presupuesto_id, user_id)

@app.patch("/api/presupuestos/{presupuesto_id}/estado")
def cambiar_estado_presupuesto(presupuesto_id: int, estado: str, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Si se rechaza, guardar fecha
        fecha_rechazo = datetime.now().isoformat() if estado == "rechazado" else None
        
        if fecha_rechazo:
            cursor.execute(
                "UPDATE presupuestos SET estado = ?, fecha_rechazo = ? WHERE id = ? AND usuario_id = ?",
                (estado, fecha_rechazo, presupuesto_id, user_id)
            )
        else:
            cursor.execute(
                "UPDATE presupuestos SET estado = ?, fecha_rechazo = NULL WHERE id = ? AND usuario_id = ?",
                (estado, presupuesto_id, user_id)
            )
        
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
        return {"message": "Estado actualizado"}

@app.delete("/api/presupuestos/{presupuesto_id}")
def eliminar_presupuesto(presupuesto_id: int, user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM presupuestos WHERE id = ? AND usuario_id = ?", (presupuesto_id, user_id))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
        return {"message": "Presupuesto eliminado"}

# ============ ENDPOINT DASHBOARD ============

@app.get("/api/dashboard")
def get_dashboard(user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        hoy = datetime.now().strftime("%Y-%m-%d")
        
        # Visitas hoy
        cursor.execute("SELECT COUNT(*) FROM visitas WHERE usuario_id = ? AND fecha = ?", (user_id, hoy))
        visitas_hoy = cursor.fetchone()[0]
        
        # Visitas pendientes
        cursor.execute("SELECT COUNT(*) FROM visitas WHERE usuario_id = ? AND estado IN ('pendiente', 'confirmada')", (user_id,))
        visitas_pendientes = cursor.fetchone()[0]
        
        # Total clientes
        cursor.execute("SELECT COUNT(*) FROM clientes WHERE usuario_id = ?", (user_id,))
        total_clientes = cursor.fetchone()[0]
        
        # Presupuestos pendientes
        cursor.execute("SELECT COUNT(*) FROM presupuestos WHERE usuario_id = ? AND estado IN ('borrador', 'enviado')", (user_id,))
        presupuestos_pendientes = cursor.fetchone()[0]
        
        # Facturación mes (presupuestos aceptados)
        mes_actual = datetime.now().strftime("%Y-%m")
        cursor.execute(
            "SELECT COALESCE(SUM(total), 0) FROM presupuestos WHERE usuario_id = ? AND estado = 'aceptado' AND fecha_emision LIKE ?",
            (user_id, f"{mes_actual}%")
        )
        facturacion_mes = cursor.fetchone()[0]
        
        return {
            "visitas_hoy": visitas_hoy,
            "visitas_pendientes": visitas_pendientes,
            "total_clientes": total_clientes,
            "presupuestos_pendientes": presupuestos_pendientes,
            "facturacion_mes": facturacion_mes
        }

# ============ ENDPOINT ESTADÍSTICAS ============

@app.get("/api/estadisticas/presupuestos")
def estadisticas_presupuestos(user_id: int = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM presupuestos WHERE usuario_id = ?", (user_id,))
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM presupuestos WHERE usuario_id = ? AND estado = 'aceptado'", (user_id,))
        aceptados = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM presupuestos WHERE usuario_id = ? AND estado IN ('borrador', 'enviado')", (user_id,))
        pendientes = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM presupuestos WHERE usuario_id = ? AND estado = 'rechazado'", (user_id,))
        rechazados = cursor.fetchone()[0]
        
        tasa_conversion = (aceptados / total * 100) if total > 0 else 0
        
        return {
            "total": total,
            "aceptados": aceptados,
            "pendientes": pendientes,
            "rechazados": rechazados,
            "tasa_conversion": round(tasa_conversion, 1)
        }

# ============ HEALTH CHECK ============

@app.get("/")
def root():
    return {"status": "ok", "app": "TecniGestión API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
