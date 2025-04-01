# VFied - Your Credentials, Your Super-Power

VFied is a decentralized credential verification platform that allows users to verify their education, work experience, certificates, and skills once, then share them with potential employers.

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vfied.git
cd vfied
```

2. Install dependencies:

```bash
cd frontend
npm install
```

3. Create a `.env.local` file in the `frontend` directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Configure Authentication to enable Email/Password, Google, and GitHub sign-in methods
4. Create Firestore Database and configure rules
5. Set up Storage for credential document uploads

## Project Structure

```
vfied/
├── frontend/               # Next.js application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Next.js pages
│   │   └── styles/         # CSS/Tailwind styles
│   ├── .env.local          # Environment variables (gitignored)
│   └── package.json        # Dependencies
├── .github/workflows/      # CI/CD pipelines
└── README.md               # Project documentation
```

## Features

- User authentication (Email/Password, Google, GitHub)
- Credential verification system
- Document upload functionality
- User profile management
- Dashboard for tracking verification status
- Shareable credential profiles

## Deployment

The project is set up for easy deployment to Vercel:

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables in Vercel
4. Deploy!

## License

[MIT](LICENSE)
# VFIED
