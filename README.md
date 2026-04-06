# Board Game Search Site

A Nuxt.js application for searching and managing board game data from BoardGameGeek (BGG) API with Supabase backend.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Setup:**
```bash
# Copy the example environment file
cp .env.example .env

# Fill in your environment variables (see .env.example for details)
```

3. **Required Environment Variables:**
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (server-side)
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key (client-side)
   - `BGG_API_TOKEN`: BoardGameGeek API token (optional but recommended)
   - `DATABASE_URL`: PostgreSQL connection string (for import scripts)

## Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Production Build

```bash
npm run build
```

## Deployment to Netlify

### 1. Prepare for Deployment
The project is configured with `netlify.toml` for automatic deployment.

### 2. Set Environment Variables in Netlify
In your Netlify dashboard, go to Site settings > Environment variables and add:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
BGG_API_TOKEN=your_bgg_api_token
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. Deploy Options

**Option A: Git Integration (Recommended)**
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically build and deploy

**Option B: Manual Deploy**
```bash
# Build and deploy manually
npm run build
npx netlify deploy --prod --dir=.output/public
```

### 4. Import Scripts
To import board game data:
```bash
# Import from BGG API
npm run import:bgg
```

## Project Structure
- `app/` - Vue components and pages
- `server/` - Server-side API routes and scripts
- `plugins/` - Nuxt plugins
- `public/` - Static assets

## Technologies Used
- **Nuxt.js** - Vue.js framework
- **Supabase** - Database and authentication
- **TailwindCSS** - Styling
- **BoardGameGeek API** - Board game data source
