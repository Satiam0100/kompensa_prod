# Kompensa Frontend

Panel web en **Next.js 16** + **TypeScript** + **Tailwind CSS v4** para crear órdenes de transmisión contra el mismo backend **Supabase** que usan los flujos n8n.

## Estructura

La app Next.js vive en la **raíz del repositorio** (junto a los flujos n8n y SQL), para que Vercel detecte Next.js sin configurar Root Directory.

```
├── public/
│   └── kompensa-logo.jpeg
├── src/
│   ├── app/
│   │   ├── actions/ordenes.ts      # Server Action → Supabase
│   │   ├── ordenes/page.tsx        # Listado de cuñas registradas
│   │   ├── ordenes/nueva/page.tsx  # Formulario principal
│   │   ├── layout.tsx
│   │   ├── globals.css             # Design tokens (tema oscuro)
│   │   └── page.tsx                # Redirige a /ordenes/nueva
│   ├── components/
│   │   ├── layout/                 # Sidebar, TopBar, AppShell
│   │   ├── ordenes/                # Formulario y acordeón avanzado
│   │   └── ui/                     # MaterialIcon, FormField, SectionCard
│   └── lib/
│       ├── supabase/               # Cliente browser y servidor
│       └── types/                  # Tipos alineados con ordenes_transmision
├── .env.example
└── package.json
```

## Requisitos

- Node.js 20+
- pnpm
- Proyecto Supabase con `supabase-migrations.sql` aplicado (tabla `ordenes_transmision`)

## Iconos

Los iconos usan [@mui/icons-material](https://mui.com/material-ui/material-icons/) (Material Icons oficiales en React). El mapa de nombres está en `src/components/ui/icons.tsx`; el componente `MaterialIcon` los renderiza como SVG.

## Configuración

```bash
cp .env.example .env.local
# Editar .env.local: AUTH_* (login) y Supabase
pnpm install
pnpm dev
```

### Login

Ruta: `/login`. Credenciales por variables de entorno:

| Variable | Descripción |
|----------|-------------|
| `AUTH_USER` | Usuario (por defecto `admin`) |
| `AUTH_PASSWORD` | Contraseña del panel |
| `AUTH_SECRET` | Secreto para firmar la sesión (mín. 16 caracteres; recomendado 32+) |

Todas las demás rutas quedan protegidas por middleware hasta iniciar sesión.

Abrir [http://localhost:3000](http://localhost:3000) → redirige a `/ordenes/nueva`.

| Ruta | Descripción |
|------|-------------|
| `/ordenes/nueva` | Formulario de nueva orden |
| `/ordenes` | Listado de todas las cuñas / órdenes registradas |

### Variables de entorno

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional; recomendado en Server Actions para insert sin depender de RLS |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Desarrollo con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint |

## Deploy en Vercel

1. Importa el repo en [Vercel](https://vercel.com).
2. Dejá **Root Directory vacío** (raíz del repo). Vercel detecta **Next.js** y **Node 20+** desde `package.json`.
3. Variables de entorno (Production):

| Variable | Requerida |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Recomendada |
| `AUTH_USER` | Sí |
| `AUTH_PASSWORD` | Sí |
| `AUTH_SECRET` | Sí (32+ caracteres) |

4. Deploy. El `vercel.json` en la raíz aplica región `gru1`, caché de estáticos, headers de seguridad e `ignoreCommand` (omite el build si solo cambiaron flujos n8n/SQL, no la app).

### CLI

```bash
pnpm dlx vercel
pnpm dlx vercel --prod
```

## Integración con el backend

Los campos del formulario coinciden con la tabla `ordenes_transmision` definida en `supabase-migrations.sql` en la raíz del monorepo. Las órdenes creadas desde el panel son visibles para los flujos n8n de ingesta y certificación automática.
