# Global Index Funds Dashboard

A real-time dashboard for tracking and comparing global market indices. Built with Next.js 13, TypeScript, and Tailwind CSS.

## Features

- 🌍 Track major market indices from around the world
- 📊 Interactive charts with multiple timeframes
- 💱 Currency conversion support via FRED API
- 🎨 Clean, responsive UI with dark mode support
- ⚡ Real-time data updates
- 📱 Mobile-friendly design

## Prerequisites

- Node.js 18+ 
- Yarn (recommended) or npm
- FRED API key (for currency exchange rates)

## Setup

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/index-funds.git
cd index-funds
yarn install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Get your FRED API key:
     1. Go to [FRED](https://fred.stlouisfed.org/)
     2. Create an account or login
     3. Navigate to My Account -> API Keys
     4. Generate a new API key
   - Add your FRED API key to `.env.local`

3. Start the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
index-funds/
├── src/
│   ├── app/              # Next.js 13 app directory
│   │   ├── api/         # API routes
│   │   └── page.tsx     # Main page
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   └── services/       # API and data services
├── public/             # Static assets
└── compose/           # Development utilities
```

## API Routes

- `/api/market` - Fetches list of available market indices
- `/api/history` - Fetches historical price data
- `/api/exchange-rates` - Fetches currency exchange rates from FRED

## Development

```bash
# Run development server
yarn dev

# Run linter
yarn lint

# Build for production
yarn build

# Start production server
yarn start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FRED_API_KEY` | API key for FRED currency data | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FRED®](https://fred.stlouisfed.org/) for currency exchange rate data
- [Yahoo Finance](https://finance.yahoo.com/) for market data
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
