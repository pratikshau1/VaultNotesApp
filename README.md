# VaultNotesApp

A secure, encrypted note-taking application built with React, TypeScript, and Firebase. VaultNotes provides zero-knowledge encryption for your notes and files, ensuring your data remains private and secure.

## 🚀 Features

### Core Features
- **Zero-Knowledge Encryption**: All notes are encrypted client-side using AES-256 encryption before being stored
- **Firebase Integration**: Notes and folders are stored in Firebase Firestore for cloud synchronization
- **Local File Storage**: Files (PDFs, images, etc.) are stored locally in IndexedDB for privacy and performance
- **Real-time Updates**: Real-time synchronization of notes and folders across devices using Firebase
- **Secure Authentication**: Firebase Authentication with encrypted user profiles
- **Account Recovery**: Recovery key system for account restoration

### Note Management
- Create, edit, and delete notes
- Rich text editing with TipTap editor
- Pin important notes
- Archive notes
- Trash/Recycle Bin with restore functionality
- Organize notes with folders
- Label/tag system for categorization
- Search functionality
- Auto-save with 2-second debounce

### File Management
- Upload and encrypt files (PDFs, images, documents)
- Local storage in IndexedDB (browser database)
- File organization with folders
- Secure file encryption

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with Radix UI components
- **State Management**: React Context API
- **Database**: 
  - Firebase Firestore (notes, folders, user profiles)
  - IndexedDB (files only)
- **Authentication**: Firebase Authentication
- **Encryption**: CryptoJS (AES-256)
- **Rich Text Editor**: TipTap

### Data Flow

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Encryption     │ (Client-side AES-256)
└────────┬────────┘
         │
         ├─────────────────┬──────────────────┐
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Firebase   │  │  IndexedDB  │  │   Firebase   │
│   Firestore  │  │   (Files)    │  │    Auth      │
│  (Notes/     │  │              │  │               │
│  Folders)    │  │              │  │               │
└──────────────┘  └──────────────┘  └──────────────┘
         │                 │                  │
         └─────────────────┴──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   UI Update   │
                    │  (Real-time)  │
                    └──────────────┘
```

### Storage Strategy

#### Firebase Firestore (Cloud Storage)
- **Notes**: All notes are encrypted and stored in Firestore
- **Folders**: Folder structure stored in Firestore
- **User Profiles**: User metadata and encryption salts stored in Firestore
- **Real-time Sync**: Changes are synchronized in real-time across devices

#### IndexedDB (Local Browser Storage)
- **Files Only**: PDFs, images, and other files are stored locally
- **Privacy**: Files never leave the browser
- **Performance**: Fast access without network latency
- **Encryption**: Files are encrypted before storage

## 🔐 Security

### Encryption
- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Encryption**: Client-side only - data is encrypted before transmission
- **Zero-Knowledge**: Server cannot decrypt user data

### Authentication
- Firebase Authentication for user management
- Email-based authentication (username@vaultnotes.local)
- Account lockout after 5 failed attempts (15-minute lockout)
- Recovery key system for account restoration

### Data Privacy
- All notes encrypted before storage
- Files stored locally and encrypted
- User profiles contain only metadata (no plaintext data)
- Recovery keys encrypted and stored securely

## 📁 Project Structure

```
VaultNotesApp/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthPage.tsx          # Authentication UI
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   ├── NoteEditor.tsx        # Rich text editor
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   ├── FileVault.tsx         # File management
│   │   │   └── LabelSelector.tsx     # Label/tag selector
│   │   ├── landing/
│   │   │   └── LandingPage.tsx       # Landing page
│   │   └── ui/                        # Reusable UI components
│   ├── context/
│   │   └── AuthContext.tsx            # Authentication context
│   ├── lib/
│   │   ├── firebase.ts                # Firebase configuration
│   │   ├── firebaseService.ts         # Firebase operations (notes/folders)
│   │   ├── db.ts                      # IndexedDB operations (files only)
│   │   ├── crypto.ts                  # Encryption utilities
│   │   └── utils.ts                   # Utility functions
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── package.json
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VaultNotesApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config
   - Update `src/lib/firebase.ts` with your Firebase configuration

4. **Configure Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         match /notes/{noteId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         
         match /folders/{folderId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📖 Usage

### Creating an Account
1. Navigate to the registration page
2. Enter a username (will be used as email: username@vaultnotes.local)
3. Create a strong login password (minimum 8 characters)
4. Create an encryption passphrase (minimum 12 characters)
5. **IMPORTANT**: Save your recovery key securely
6. Complete registration

### Logging In
1. Enter your username
2. Enter your login password
3. Enter your encryption passphrase
4. Access your vault

### Creating Notes
1. Click "New Note" in the sidebar
2. Enter a title
3. Start typing - notes auto-save every 2 seconds
4. Use the toolbar for formatting (bold, italic, headings, lists, images)

### Organizing Notes
- **Folders**: Create folders to organize notes
- **Labels**: Add labels/tags to categorize notes
- **Pin**: Pin important notes to the top
- **Archive**: Archive notes you don't need frequently
- **Search**: Use the search bar to find notes

### File Management
1. Click "File Vault" in the sidebar
2. Click "Upload Asset" to upload files
3. Files are encrypted and stored locally
4. Organize files into folders
5. Download or delete files as needed

### Account Recovery
1. If you forget your encryption passphrase, use the recovery key
2. Enter your username and recovery key
3. Your passphrase will be recovered
4. Use the recovered passphrase to login

## 🔄 Data Flow & Synchronization

### Notes & Folders
- **Storage**: Firebase Firestore
- **Sync**: Real-time synchronization via Firebase listeners
- **Encryption**: Client-side encryption before storage
- **Updates**: Changes propagate instantly across devices

### Files
- **Storage**: IndexedDB (local browser database)
- **Sync**: Not synchronized (local only)
- **Encryption**: Client-side encryption before storage
- **Access**: Fast local access without network dependency

### User Authentication
- **Provider**: Firebase Authentication
- **Storage**: User profiles in Firestore
- **Security**: Account lockout after failed attempts
- **Recovery**: Encrypted recovery keys in Firestore

## 🧪 Development

### Key Files
- `src/lib/firebaseService.ts`: Firebase operations for notes and folders
- `src/lib/db.ts`: IndexedDB operations for files
- `src/lib/crypto.ts`: Encryption/decryption utilities
- `src/context/AuthContext.tsx`: Authentication and user management
- `src/components/dashboard/Dashboard.tsx`: Main dashboard with note management

### Adding Features
1. Notes/Folders: Use `firebaseService` from `src/lib/firebaseService.ts`
2. Files: Use `db` from `src/lib/db.ts`
3. Encryption: Use functions from `src/lib/crypto.ts`
4. Authentication: Use `useAuth()` hook from `AuthContext`

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `src/lib/firebase.ts`
- Check Firestore security rules
- Ensure Authentication is enabled in Firebase Console

### Encryption Errors
- Verify encryption key is correctly derived
- Check that passphrase matches the one used during registration
- Ensure encryption salt is correctly stored

### Data Not Syncing
- Check Firebase connection status
- Verify user is authenticated
- Check browser console for errors
- Ensure Firestore rules allow read/write access

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contributions are not accepted at this time.

## 📧 Support

For issues or questions, please contact the project maintainer.

---

**Built with ❤️ using React, TypeScript, and Firebase**
