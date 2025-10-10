# CIMB Wealth Management Application

## Overview
This is a comprehensive Vue 3 wealth management application built with Vite, TypeScript, and modern web technologies. The application provides a complete financial dashboard with portfolio management, transaction tracking, goal setting, and advanced 3D visualizations.

## Recent Changes

### October 10, 2025 - Complete Bond Trading Module Implementation
- ✅ Created comprehensive bond trading system with market explorer, portfolio management, and analytics
- ✅ Implemented bond market data catalog (bonds-market.json) with 28 bonds:
  - Government bonds (Malaysian Government Securities) across various maturities
  - Corporate bonds from banking, telecom, energy, real estate, and utility sectors
  - Credit ratings from AAA to BBB with appropriate yield spreads
  - Risk levels from Very Low to High with corresponding pricing
- ✅ Created user bonds portfolio data (user-bonds.json) with 5 initial holdings
- ✅ Built comprehensive bonds Pinia store (stores/bonds.ts) with:
  - Buy/sell bond operations with commission calculations (0.5%)
  - Financial calculations: YTM (Yield to Maturity), Macaulay Duration, Modified Duration, Convexity
    - Note: Uses simplified approximation formulas suitable for demonstration purposes
    - For production deployment, would require Newton-Raphson root-finding for YTM and precise cash-flow modeling
  - Portfolio analytics: total value, unrealized gains, portfolio yield, allocation by type/rating
  - Coupon payment tracking with next payment date calculations
- ✅ Created Bond Market Explorer page (BondsMarketView.vue):
  - AG-Grid table with 28+ bonds showing ISIN, issuer, type, rating, coupon, price, yield
  - Advanced filters: bond type, rating, risk level, sector
  - Color-coded ratings and bond types for quick identification
  - Buy bond functionality with modal
- ✅ Created My Bonds Portfolio page (MyBondsView.vue):
  - Portfolio summary cards: total value, investment, unrealized gains, portfolio yield
  - Holdings table with gain/loss tracking, coupon dates, and sell functionality
  - Chart.js allocation charts by bond type and rating
  - Sell bond modal with profit/loss calculations
- ✅ Created Bond Analytics page (BondsAnalyticsView.vue):
  - Bond calculator with YTM, Macaulay Duration, Modified Duration, Convexity metrics
  - Educational tooltips explaining each metric
  - Risk vs Return scatter plot chart
  - Time to Maturity bar chart for portfolio
  - Government Bond Yield Curve visualization
- ✅ Created Bond Reports page (BondsReportsView.vue):
  - Portfolio Summary CSV export with holdings and performance
  - Coupon Payment Calendar CSV export with payment schedules
  - Bond Analytics Report CSV export with all metrics
  - Export history tracking
- ✅ Updated router with 4 bond routes: market, my-bonds, analytics, reports
- ✅ Updated sidebar navigation with Bond Market, My Bonds, Bond Analytics, Bond Reports menu items
- ✅ All bond calculations use Malaysian Ringgit (MYR) currency
- ✅ Professional financial UI with CIMB red branding (#dc143c, #ff1744)

### October 10, 2025 - Comprehensive Typography & Text Visibility Overhaul
- ✅ Fixed critical dark mode bug where text was invisible
- ✅ Resolved conflicting CSS: replaced `@media (prefers-color-scheme: dark)` with `[data-theme="dark"]` in base.css
- ✅ Created comprehensive typography-fix.css with global text visibility improvements:
  - Light mode: #1a1a1a text on light backgrounds
  - Dark mode: #f5f5f5 text on dark backgrounds
  - Font-weight: 500 for improved readability
  - Applied Inter/Poppins font family consistently
- ✅ Fixed all headings (h1-h6), card titles, and card text with readable colors
- ✅ Sidebar: solid white text (#ffffff) with bright CIMB red (#ff1744) active states
- ✅ Navbar: proper text color inheritance from theme variables
- ✅ Removed all low-contrast rgba colors and opacity issues
- ✅ Added professional CIMB corporate styling with clean spacing and typography
- ✅ Text now properly visible in both light and dark modes across all pages

### October 9, 2025 - Unit Trust Module Implementation
- ✅ Created comprehensive unit trust management system with full buy/sell/switch functionality
- ✅ Implemented separate immutable catalog (unit-trust-catalog.json) containing all available funds
- ✅ Created user holdings data structure (unit-trusts.json) with equity, bond, balanced, and money market funds
- ✅ Built dedicated Unit Trust page (UnitTrustsView.vue) with:
  - Holdings portfolio display using AG-Grid
  - Transaction history tracking
  - Performance charts with Chart.js
  - Buy/Sell/Switch modals with full validation
- ✅ Created unit trust Pinia store with:
  - buyUnitTrust: Creates new holdings from catalog when buying previously unheld funds
  - sellUnitTrust: Comprehensive error handling for insufficient units and missing positions
  - switchUnitTrust: Validates destination fund exists before executing, prevents broken states
- ✅ Integrated unit trust transactions into main transaction history
- ✅ Added "Unit Trusts" to navigation menu and router
- ✅ All functionality architect-approved with Pass rating for production deployment

### October 9, 2025 - UX/UI Improvements & Bug Fixes
- ✅ Fixed login page layout - removed sidebar/navbar from login view
- ✅ Redesigned login page with modern split-screen layout (50/50 branding + form)
  - Left side: CIMB branding with gradient background and feature highlights
  - Right side: Spacious login form that stretches across screen
  - Fully responsive: converts to single-column on mobile devices
- ✅ Fixed navbar to display actual user name from auth store (instead of hardcoded "John Doe")
- ✅ Implemented functional logout button with proper navigation
- ✅ Enhanced 3D Visualization page with full ThreeVisualization component (replaced placeholder)
- ✅ Cleaned up all debug console.log statements for production readiness
- ✅ Verified responsive design works correctly on mobile, tablet, and desktop
- ✅ Fixed logout functionality - removed async/await for immediate navigation
- ✅ Verified all sidebar menu items have FontAwesome icons (already implemented)
- ✅ All UX/UI fixes architect-approved with Pass rating

### September 20, 2025 - Initial Setup
- Successfully imported and configured the project for Replit environment
- Installed all dependencies and resolved TypeScript configuration issues
- Fixed AG-Grid column definition type issues
- Added missing type declarations for Three.js and file-saver
- Configured deployment settings for production
- Application is running successfully on port 5000

## Project Architecture
### Frontend Framework
- **Vue 3** with Composition API
- **Vite** for build tooling and development server
- **TypeScript** for type safety
- **Bootstrap 5** with Bootstrap Vue Next for UI components
- **Pinia** for state management
- **Vue Router** for navigation

### Key Features
1. **Authentication System** - Login/logout with route guards
2. **Dashboard** - Financial overview with key metrics
3. **Portfolio Management** - Holdings tracking with AG-Grid tables
4. **Unit Trust Management** - Complete unit trust buy/sell/switch with catalog of available funds
5. **Bond Trading Module** - Complete bond market explorer, portfolio management, analytics with YTM/Duration/Convexity calculations, and CSV reports
6. **Transaction History** - Comprehensive transaction tracking including unit trusts and bonds
7. **Goal Setting** - Financial goal management
8. **Reports** - Data export and analysis
9. **3D Visualization** - Advanced Three.js 3D data visualization

### Libraries & Dependencies
- **AG-Grid** for data tables
- **Chart.js** for charts and graphs
- **Three.js** for 3D visualizations
- **Font Awesome** for icons
- **File Saver** for data export
- **Date-fns** for date handling

### Project Structure
```
cimb-wealth-app/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   └── ThreeVisualization.vue
│   │   ├── AppLayout.vue
│   │   ├── AppNavbar.vue
│   │   └── AppSidebar.vue
│   ├── data/
│   │   ├── unit-trust-catalog.json (immutable catalog of available funds)
│   │   ├── unit-trusts.json (user holdings)
│   │   ├── bonds-market.json (immutable catalog of available bonds - 28 bonds)
│   │   ├── user-bonds.json (user bond holdings)
│   │   └── other JSON mock data
│   ├── pages/
│   │   ├── bonds/
│   │   │   ├── BondsMarketView.vue
│   │   │   ├── MyBondsView.vue
│   │   │   ├── BondsAnalyticsView.vue
│   │   │   ├── BondsReportsView.vue
│   │   │   └── components/
│   │   │       ├── BuyBondModal.vue
│   │   │       └── SellBondModal.vue
│   │   ├── UnitTrustsView.vue
│   │   └── other Vue page components
│   ├── router/ (Vue Router configuration)
│   ├── stores/
│   │   ├── bonds.ts (bond trading and analytics)
│   │   ├── unitTrusts.ts
│   │   └── other Pinia stores
│   └── assets/ (CSS and static assets)
├── public/
└── Configuration files
```

### Development Configuration
- **Host**: 0.0.0.0 (configured for Replit environment)
- **Port**: 5000
- **Hot Reload**: Enabled
- **Dev Server**: Configured to allow all hosts for proxy compatibility

### Deployment Configuration
- **Target**: Autoscale (stateless deployment)
- **Build**: npm run build
- **Serve**: Using serve package on port 5000
- **Production Ready**: Yes

## User Preferences
- Modern, responsive design
- Fast development with hot reload
- Type-safe development with TypeScript
- Production-ready deployment setup

## Current Status
✅ Project successfully imported and running in Replit
✅ All dependencies installed and configured
✅ TypeScript issues resolved
✅ Development server running on port 5000
✅ Deployment configuration complete
✅ Ready for use and further development