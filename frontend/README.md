# Mr Gutter Production Tracker - Frontend

A Progressive Web App (PWA) for tracking gutter company production and profitability.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icons
- **Vite PWA Plugin** - Service worker & manifest

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

### API URL

Update the API URL in `src/utils/api.js`:

```javascript
const API_BASE_URL = 'https://mr-gutter-worker.YOUR_SUBDOMAIN.workers.dev';
```

Or set the environment variable:

```bash
VITE_API_URL=https://mr-gutter-worker.your-subdomain.workers.dev npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── icons/              # PWA icons
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── src/
│   ├── components/
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── Header.jsx      # Top header (mobile)
│   │   ├── Sidebar.jsx     # Side navigation (desktop)
│   │   └── BottomNav.jsx   # Bottom navigation (mobile)
│   ├── pages/
│   │   ├── Dashboard.jsx   # Home dashboard
│   │   ├── JobsList.jsx    # Jobs listing
│   │   ├── JobForm.jsx     # Add/edit job form
│   │   └── Goals.jsx       # Yearly goals
│   ├── utils/
│   │   └── api.js          # API client & helpers
│   ├── App.jsx             # Routes configuration
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── vite.config.js          # Vite + PWA config
├── tailwind.config.js
└── package.json
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Production overview & stats |
| `/jobs` | JobsList | List of all jobs |
| `/jobs/new` | JobForm | Add new job |
| `/jobs/:id/edit` | JobForm | Edit existing job |
| `/goals` | Goals | Set yearly production goals |

## PWA Features

- **Installable** - Add to home screen on mobile & desktop
- **Offline Support** - Service worker caches app shell
- **API Caching** - NetworkFirst strategy for API calls

### Installing the App

1. Open the app in a browser
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Install app"

## Responsive Design

- **Mobile** (< 1024px): Bottom navigation, hamburger menu
- **Desktop** (≥ 1024px): Sidebar navigation, full layout

## Customization

### Brand Colors

Update colors in `tailwind.config.js`:

```javascript
colors: {
  brand: {
    50: '#eff6ff',
    // ... your colors
    900: '#1e3a8a',
  }
}
```

### Theme Color

Update in:
- `vite.config.js` → manifest.theme_color
- `index.html` → meta[name="theme-color"]

### Icons

Replace the placeholder icons in `public/icons/` with your actual brand icons:
- `icon-192x192.png` (192×192px)
- `icon-512x512.png` (512×512px)

## API Integration

The `src/utils/api.js` provides a fetch wrapper:

```javascript
import api from './utils/api';

// Jobs
const jobs = await api.jobs.list();
const job = await api.jobs.get(id);
await api.jobs.create({ client_name, zipcode, ... });
await api.jobs.update(id, { full_price, ... });
await api.jobs.delete(id);

// Goals
const goals = await api.goals.get(2024);
await api.goals.set(2024, { yearly_target: 500000 });

// Stats
const summary = await api.stats.summary();
const zipcodes = await api.stats.zipcodes();
```

## Next Steps

- [ ] Connect Dashboard to live API data
- [ ] Implement Jobs CRUD with API
- [ ] Connect Goals form to API
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add error handling UI
- [ ] Add charts for production trends
