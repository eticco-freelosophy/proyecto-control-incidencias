# 🚀 Control de Incidencias - Santi

Una aplicación web moderna para el control y seguimiento de proyectos empresariales, desarrollada con Next.js y Supabase.

## 📋 Características

- **Gestión de Proyectos**: Visualización de todos los proyectos en tarjetas organizadas
- **Sistema de Marcado**: Marca proyectos como revisados/pendientes con persistencia en base de datos
- **Filtrado Avanzado**: Filtra por tipo de proyecto (ODO, ALF, EJF, BYT, ETI)
- **Búsqueda en Tiempo Real**: Busca por ID, nombre o tipo de proyecto
- **CRUD Completo**: Crear, editar y eliminar proyectos
- **Control de Fechas**: Registro de fechas de última actualización
- **Responsive Design**: Interfaz adaptable a dispositivos móviles y desktop

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js 14](https://nextjs.org/) con App Router
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Lenguaje**: TypeScript
- **Despliegue**: [Vercel](https://vercel.com/)

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm, yarn o pnpm
- Cuenta en Supabase

### Configuración Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/spbarber-eticco/proyecto-control-incidencias.git
   cd proyecto-control-incidencias
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
   ```

4. **Configura la base de datos**
   
   Ejecuta el siguiente SQL en el editor de Supabase:
   ```sql
   -- Crear tabla de proyectos
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     project_id VARCHAR(10) UNIQUE NOT NULL,
     type VARCHAR(3) NOT NULL CHECK (type IN ('ODO', 'ALF', 'EJF', 'BYT', 'ETI')),
     name VARCHAR(255) NOT NULL,
     checked BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Crear tabla de logs de actualización
   CREATE TABLE update_logs (
     id SERIAL PRIMARY KEY,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     description TEXT
   );
   ```

5. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎯 Uso

### Gestión de Proyectos

- **Visualizar**: Todos los proyectos se muestran en tarjetas organizadas
- **Marcar como Revisado**: Haz clic en cualquier parte de la tarjeta
- **Filtrar**: Usa los botones de filtro por tipo de proyecto
- **Buscar**: Utiliza la barra de búsqueda para encontrar proyectos específicos

### Operaciones CRUD

- **Crear**: Botón "Nuevo Proyecto" → Llenar formulario → Guardar
- **Editar**: Icono de lápiz en la tarjeta → Modificar datos → Guardar cambios
- **Eliminar**: Icono de papelera → Confirmar eliminación

### Control de Fechas

- **Actualizar Fecha**: Botón "Actualizar fecha" para registrar última revisión
- **Resetear Fecha**: Botón "Resetear fecha" para limpiar registro
- **Resetear Marcas**: Botón "Resetear marcas" para desmarcar todos los proyectos

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conecta tu repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Selecciona este repositorio

2. **Configura las variables de entorno**
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
   ```

3. **Despliega**
   - Vercel detectará automáticamente la configuración de Next.js
   - El despliegue será automático en cada push a la rama main

## 📊 Estructura del Proyecto

```
proyecto-control-incidencias/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ProjectManager.tsx
│   └── lib/
│       └── supabase.ts
├── public/
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 📈 Roadmap

- [ ] Sistema de autenticación
- [ ] Dashboard con estadísticas
- [ ] Exportación a CSV/Excel
- [ ] Historial de cambios
- [ ] Notificaciones
- [ ] API REST para integración externa

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

**Desarrollador**: Santi  
**Proyecto**: Control de Incidencias  
**Link del Proyecto**: [https://github.com/spbarber-eticco/proyecto-control-incidencias](https://github.com/spbarber-eticco/proyecto-control-incidencias)

---

⭐ Si este proyecto te ha sido útil, ¡no olvides darle una estrella!