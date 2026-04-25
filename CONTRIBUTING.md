# Contributing & Development Guide

## Entwickler Onboarding

### Setup
```bash
# Clone repository
git clone https://github.com/DataDruide/punzenverzeichnis.git
cd punzenverzeichnis

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
# VITE_SUPABASE_PROJECT_ID=...
```

### Development
```bash
# Start development server
npm run dev

# Run tests
npm run test
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build
```

---

## 🔐 Security Guidelines for Developers

### Don'ts
- ❌ **Never commit `.env` files** - Use `.env.example` as template
- ❌ **Never hardcode API keys** - Use environment variables
- ❌ **Never console.log sensitive data** in production
- ❌ **Never trust user input** - Always validate server-side
- ❌ **Never disable ESLint rules** without good reason

### Do's
- ✅ **Use TypeScript strict mode** - Catches type errors early
- ✅ **Validate all inputs** - Use Zod schemas
- ✅ **Handle errors gracefully** - Use Error Boundary
- ✅ **Review security headers** - Keep netlify.toml updated
- ✅ **Run tests before push** - Prevent regressions
- ✅ **Update dependencies regularly** - `npm audit fix`
- ✅ **Use React.lazy() for routes** - Keep bundle smaller
- ✅ **Document security changes** - Update SECURITY.md

---

## Code Quality Standards

### TypeScript
```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

const user: User = { id: '1', email: 'test@example.com', role: 'user' };

// ❌ Bad - Implicit any
const user: any = {};
```

### Component Structure
```typescript
// ✅ Good - Error boundary wrapper
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// ✅ Good - Lazy loaded routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ❌ Bad - Unguarded component
import Dashboard from './pages/Dashboard'; // No error handling
```

### Validation
```typescript
// ✅ Good - Schema validation
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ❌ Bad - No validation
const handleLogin = (email: string, password: string) => {
  // Trust user input directly
};
```

---

## PR & Commit Guidelines

### Commit Messages
```bash
# ✅ Good
git commit -m "feat: add lazy loading for dashboard page"
git commit -m "fix: prevent XSS in user input"
git commit -m "chore: update dependencies"
git commit -m "docs: update security guidelines"

# ❌ Bad
git commit -m "update stuff"
git commit -m "fixed bug"
```

### PR Checklist
- [ ] Tests pass: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors/warnings
- [ ] No hardcoded secrets
- [ ] Security review complete
- [ ] SECURITY.md updated (if applicable)
- [ ] Types are correctly inferred

---

## Testing

### Write Tests For
- ✅ Security-critical functions
- ✅ Complex business logic
- ✅ Public APIs
- ✅ Error handling

### Run Tests
```bash
npm run test           # Run once
npm run test:watch     # Watch mode
```

---

## Performance Guidelines

### Bundle Size
- Keep main bundle < 100KB (gzipped)
- Use React.lazy() for routes
- Monitor with: `npm run build`

### API Calls
- Use `@tanstack/react-query` for caching
- Debounce search requests
- Implement pagination for large lists

### Images
- Use WebP format where possible
- Compress before upload
- Use responsive images

---

## Deployment

### Before Merging to Main
```bash
npm run build       # Verify build
npm run test        # Run all tests
npm run lint        # Check code quality
git push            # Push to feature branch
```

### CI/CD Pipeline
GitHub Actions automatically:
- ✅ Runs ESLint
- ✅ Runs TypeScript type check
- ✅ Runs tests
- ✅ Audits dependencies
- ✅ Scans for secrets
- ✅ Deploys to Netlify (on main branch)

---

## Questions?

- 📚 [Security Policy](./SECURITY.md)
- 📖 [README](./README.md)
- 🔧 [Setup Guide](./SETUP_COMPLETE.md)
- 📋 [Deployment Guide](./DEPLOYMENT.md)
