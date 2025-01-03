# Booking Application

A modern booking application built with Next.js 14, featuring a clean UI and robust backend integration.

## Demo

🚀 **Live Demo:** [https://nextjs-booking-aa5n.vercel.app/](https://nextjs-booking-aa5n.vercel.app/)

## Tech Stack

- **Framework:** Next.js 15
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma (for database operations)
- **Components:** Custom React components including booking form
- **Environment:** Environment variable configuration
- **Hosting:** Vercel

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── booking-form.tsx
│   └── lib/
│       └── actions/
│           └── db.ts
├── public/
│   ├── globe.svg
│   ├── file.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
```

## Getting Started

1. Clone the repository:

```bash
git clone [your-repo-url]
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

```env
# Database Configuration
DATABASE_URL="postgres://avnadmin:[password]@[hostname].aivencloud.com:19819/defaultdb?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your_nextauth_secret"  # Generate this using: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"    # In production: your deployment URL

```

Note: For security reasons, never commit your actual database credentials to version control. The database URL follows Aiven Cloud PostgreSQL connection string format.

4. Set up the database:

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. Generate NextAuth Secret:
   For production, generate a secure secret using:

   ```bash
   openssl rand -base64 32
   ```

   Add this to your Vercel environment variables.

6. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Features

- Modern booking interface
- PostgreSQL database integration with Prisma ORM
- Secure authentication with NextAuth.js
- Responsive design with Tailwind CSS
- Production deployment on Vercel

## Development

The project uses TypeScript for type safety and follows Next.js 15 conventions. Key files:

- `booking-form.tsx`: Main booking interface component
- `db.ts`: Database interaction layer
- `globals.css`: Global styles and Tailwind imports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
