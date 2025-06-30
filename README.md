## Getting Started

First, enable Corepack and install the package manager:

```bash
corepack enable # Corepack is built-in to npm, use it to install package manager

pnpm -v # Check if pnpm is installed
```

Then, install the dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js**: 15.2.2
- **React**: 19.0.0
- **React DOM**: 19.0.0
- **TypeScript**: 5.8.2
- **ESLint**: 9.22.0
- **Prettier**: 3.5.3
- **Tailwind CSS**: 4.0.13
- **PostCSS**: 8.5.3
- **Husky**: 9.1.7

## Building for Production

To create a production build, use the following command:

```bash
pnpm build
```

## License

This project is licensed under the MIT License.
