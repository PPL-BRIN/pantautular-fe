# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all necessary files for building
COPY app ./app
COPY public ./public
COPY utils ./utils
COPY types ./types
COPY store ./store
COPY styles ./styles
COPY hooks ./hooks
COPY data ./data
COPY __tests__ ./__tests__
COPY __mocks__ ./__mocks__
COPY services ./services
COPY next.config.ts ./
COPY tsconfig.json ./
COPY pnpm-lock.yaml ./
COPY nginx.conf ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY babel.config.js ./
COPY jest.config.js ./
COPY setupTest.js ./
COPY jest.setup.js ./
COPY setupTests.js ./
COPY next-env.d.ts ./
COPY CHANGELOG.md ./
COPY VERSION ./

# Build the application
RUN npm run build

# Stage 3: Runner (production)
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Set to production environment
ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Install curl for health check and set proper permissions
RUN apk --no-cache add curl && \
    chown -R nextjs:nodejs /app

# Copy health check script
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Switch to non-root user
USER nextjs

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["/healthcheck.sh"]

# Expose port 3000
EXPOSE 3000

# Start Next.js in production mode
CMD ["node", "server.js"]