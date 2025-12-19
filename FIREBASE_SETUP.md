# Firebase Setup Guide

This guide will help you set up Firebase for the VaultNotesApp.

## 📋 Prerequisites

- Firebase account
- Firebase project created
- Firestore Database enabled
- Authentication enabled (Email/Password)

## 🔧 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (we'll add security rules next)
4. Select a location (choose closest to your users)
5. Click "Enable"

### 3. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click "Save"

### 4. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Scroll to **Authorized domains** section
3. Click "Add domain"
4. Add your deployment domains:
   - `localhost` (for development)
   - `valuenotes.netlify.app` (or your actual domain)
   - Any other domains you'll use
5. Click "Add"

### 5. Deploy Firestore Security Rules

#### Option A: Using Firebase Console (Recommended for beginners)

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Copy the entire contents of `firestore.rules` file
3. Paste into the rules editor
4. Click "Publish"
5. Wait for confirmation

#### Option B: Using Firebase CLI

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use `firestore.rules` as the rules file

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 6. Deploy Firebase Storage Rules (Optional)

If you plan to use Firebase Storage for file uploads:

1. In Firebase Console, go to **Storage** → **Rules**
2. Copy the entire contents of `firebase-storage.rules` file
3. Paste into the rules editor
4. Click "Publish"

Or using CLI:
```bash
firebase deploy --only storage:rules
```

### 7. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click on the web app icon (`</>`) or "Add app" → Web
4. Register your app (give it a nickname)
5. Copy the Firebase configuration object
6. Update `src/lib/firebase.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};
```

## 🔒 Security Rules Explanation

### Firestore Rules

The security rules ensure:
- **Users can only access their own data**: Each user can only read/write their own notes, folders, and profile
- **Account recovery support**: Unauthenticated reads are allowed for username lookups (needed for recovery flow)
- **Proper isolation**: Users cannot access other users' data

### Storage Rules (if using Firebase Storage)

- **User-specific access**: Users can only upload/download their own files
- **Secure file storage**: Files are stored in user-specific paths

## ✅ Verification Checklist

- [ ] Firestore Database created and enabled
- [ ] Authentication enabled (Email/Password)
- [ ] Authorized domains added (localhost + production domain)
- [ ] Firestore security rules deployed
- [ ] Firebase Storage rules deployed (if using Storage)
- [ ] Firebase config added to `src/lib/firebase.ts`
- [ ] Test registration works
- [ ] Test login works
- [ ] Test account recovery works

## 🧪 Testing Security Rules

### Test Firestore Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Click "Rules Playground"
3. Test scenarios:
   - User reading their own notes: ✅ Should allow
   - User reading another user's notes: ❌ Should deny
   - Unauthenticated user querying by username: ✅ Should allow (for recovery)

### Common Issues

**Issue**: "Permission denied" errors
- **Solution**: Check that security rules are deployed and user is authenticated

**Issue**: Recovery flow not working
- **Solution**: Ensure rules allow unauthenticated reads for username queries

**Issue**: OAuth warnings
- **Solution**: Add your domain to Authorized domains in Authentication settings

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## 🆘 Troubleshooting

### Error: "Function setDoc() called with invalid data. Unsupported field value: undefined"

**Solution**: This has been fixed in the code. Make sure you're using the latest version of `firebaseService.ts` which handles undefined values properly.

### Error: "The current domain is not authorized for OAuth operations"

**Solution**: Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### Error: "Permission denied" when reading/writing data

**Solution**: 
1. Check that security rules are deployed
2. Verify user is authenticated
3. Check that user ID matches the document path

---

**Need help?** Check the main README.md for more information about the application.

