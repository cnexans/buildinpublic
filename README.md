# buildinpublic

Public dashboard that shows real-time traffic metrics across all my projects, powered by [PostHog](https://posthog.com) and [Next.js](https://nextjs.org).

Live at [cnexans.com/projects](https://cnexans.com/projects) (coming soon).

## Features

- Aggregated pageviews, sessions, and unique visitors across multiple PostHog projects
- Domain-to-project mapping via regex patterns (preview deploys, subdomains, etc. grouped automatically)
- Per-project colored progress bars
- Filterable by project
- Area charts for 30-day trends (pageviews, sessions, visitors)
- Private project masking (projects can be hidden behind a label)
- Built with [shadcn/ui](https://ui.shadcn.com) components and [Recharts](https://recharts.org)
- Self-tracking via PostHog client-side analytics

## Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local

# Run dev server
npm run dev
```

## Configuration

### Environment Variables

See `.env.example` for all required variables. You need:

- A PostHog **private API key** (`phx_...`) for server-side HogQL queries
- One or more **PostHog project IDs** to aggregate data from
- Optionally, a **public PostHog key** (`phc_...`) for self-tracking

### Project Mappings

Edit `lib/posthog.ts` to configure how domains map to projects:

```typescript
export const PROJECT_MAPPINGS: ProjectMapping[] = [
  {
    name: "My App",
    url: "https://myapp.com",
    patterns: [/myapp/i],         // regex patterns to match domains
    color: "#2563EB",             // color for the progress bar
  },
  {
    name: "Private Project",
    private: true,                // hides real name, shows masked label
    patterns: [/secret-app/i],
    color: "#DC2626",
  },
];
```

The first matching pattern wins. Unmatched domains appear with their raw domain name.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- shadcn/ui (base-nova)
- Recharts
- PostHog HogQL API

## License

MIT
