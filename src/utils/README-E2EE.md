# End-to-End Encryption (E2EE) Implementation

## Overview

This E2EE implementation uses **password-based key derivation** with Web Crypto API for maximum security and browser compatibility.

## Features

### 🔐 **Password-Based Key Derivation**
- Uses **PBKDF2** with 100,000 iterations
- **SHA-256** hashing
- **Random salt** for each encryption
- **AES-256-GCM** encryption

### 🛡️ **Security Features**
- **Forward secrecy** - different keys for each encryption
- **Salt protection** - prevents rainbow table attacks
- **Authentication** - GCM mode provides integrity verification
- **Password hashing** - separate from encryption key derivation

## API Reference

### Core Functions

```typescript
// Encrypt data with password
const encrypted = await encryptData(plainText: string, password: string);
// Returns: { encrypted: string, iv: string, salt: string }

// Decrypt data with password
const decrypted = await decryptData(
  encryptedBase64: string, 
  ivBase64: string, 
  saltBase64: string, 
  password: string
);
// Returns: string (original plaintext)
```

### Helper Functions

```typescript
// Generate secure random password
const password = generateSecurePassword(length?: number);

// Hash password for storage (not encryption)
const hash = await hashPassword(password: string);

// Verify password against hash
const isValid = await verifyPassword(password: string, hash: string);
```

## Usage Examples

### 1. Basic E2EE

```typescript
import { encryptData, decryptData } from './utils/encryption';

const password = 'mySecurePassword123!';
const plainText = 'Sensitive data';

// Encrypt
const encrypted = await encryptData(plainText, password);
console.log(encrypted);
// {
//   encrypted: "base64-encrypted-data",
//   iv: "base64-iv",
//   salt: "base64-salt"
// }

// Decrypt
const decrypted = await decryptData(
  encrypted.encrypted, 
  encrypted.iv, 
  encrypted.salt, 
  password
);
console.log(decrypted); // "Sensitive data"
```

### 2. User Registration

```typescript
import { encryptData, hashPassword } from './utils/encryption';

async function registerUser(password: string, userData: any) {
  // Hash password for authentication (store in DB)
  const passwordHash = await hashPassword(password);
  
  // Encrypt user data with their password
  const encryptedData = await encryptData(
    JSON.stringify(userData), 
    password
  );
  
  // Store in database
  await saveUser({
    passwordHash,        // For login verification
    encryptedData       // Encrypted with user's password
  });
}
```

### 3. User Login & Data Access

```typescript
import { decryptData, verifyPassword } from './utils/encryption';

async function loginUser(password: string, userId: string) {
  const user = await getUserFromDB(userId);
  
  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid password');
  }
  
  // Decrypt user data
  const userData = await decryptData(
    user.encryptedData.encrypted,
    user.encryptedData.iv,
    user.encryptedData.salt,
    password
  );
  
  return JSON.parse(userData);
}
```

### 4. Document Encryption

```typescript
async function encryptDocument(document: any, password: string) {
  const docString = JSON.stringify(document);
  return await encryptData(docString, password);
}

async function decryptDocument(encryptedDoc: any, password: string) {
  const decrypted = await decryptData(
    encryptedDoc.encrypted,
    encryptedDoc.iv,
    encryptedDoc.salt,
    password
  );
  return JSON.parse(decrypted);
}
```

## Security Considerations

### ✅ **Best Practices**

1. **Password Strength**
   ```typescript
   // Generate strong passwords
   const strongPassword = generateSecurePassword(32);
   ```

2. **Separate Storage**
   ```typescript
   // Store separately:
   // 1. Password hash (for authentication)
   // 2. Encrypted data (with user's password)
   const passwordHash = await hashPassword(password);  // DB storage
   const encrypted = await encryptData(data, password); // Data encryption
   ```

3. **Error Handling**
   ```typescript
   try {
     const decrypted = await decryptData(encrypted, iv, salt, password);
   } catch (error) {
     // Handle wrong password or corrupted data
     console.error('Decryption failed:', error.message);
   }
   ```

### ⚠️ **Important Notes**

- **Password Loss = Data Loss**: If user forgets password, data cannot be recovered
- **No Backend Decryption**: Server cannot decrypt user data without password
- **Client-Side Only**: All encryption/decryption happens in browser
- **Performance**: PBKDF2 is intentionally slow (100k iterations)

## Integration with Forms

```typescript
// In your React component
import { encryptData, decryptData } from '@/utils/encryption';

const handleSave = async (formData: any, userPassword: string) => {
  try {
    const encrypted = await encryptData(
      JSON.stringify(formData), 
      userPassword
    );
    
    // Save encrypted data to backend
    await api.post('/data', encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
  }
};

const handleLoad = async (encryptedData: any, userPassword: string) => {
  try {
    const decrypted = await decryptData(
      encryptedData.encrypted,
      encryptedData.iv,
      encryptedData.salt,
      userPassword
    );
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Invalid password or corrupted data');
  }
};
```

## Test Your Implementation

```typescript
import { runAllExamples } from './utils/encryptionExamples';

// Run comprehensive tests
await runAllExamples();
```

This will demonstrate all features and edge cases.
