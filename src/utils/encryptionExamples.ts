// E2EE Encryption Usage Examples and Test

import {
  encryptData,
  decryptData,
  generateSecurePassword,
  hashPassword,
  verifyPassword,
} from "./encryption";

// Example 1: Basic E2EE Encryption with password
export async function exampleBasicE2EE() {
  try {
    console.log("=== Basic E2EE Example ===");

    const password = "mySecurePassword123!";
    const plainText = "This is sensitive data that needs E2EE protection";

    // Encrypt
    console.log("Original text:", plainText);
    const encrypted = await encryptData(plainText, password);
    console.log("Encrypted data:", encrypted);

    // Decrypt
    const decrypted = await decryptData(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.salt,
      password
    );
    console.log("Decrypted text:", decrypted);
    console.log("Success:", plainText === decrypted);
  } catch (error) {
    console.error("E2EE Error:", error);
  }
}

// Example 2: User Registration with E2EE
export async function exampleUserRegistration() {
  try {
    console.log("=== User Registration Example ===");

    // User provides password
    const userPassword = "userPassword123!";

    // Hash password for storage (NOT for encryption)
    const passwordHash = await hashPassword(userPassword);
    console.log("Password hash for DB:", passwordHash);

    // User's sensitive data
    const userData = JSON.stringify({
      personalInfo: "Sensitive personal information",
      creditCard: "1234-5678-9012-3456",
      notes: "Private notes",
    });

    // Encrypt user data with their password
    const encryptedUserData = await encryptData(userData, userPassword);
    console.log("Encrypted user data:", encryptedUserData);

    // Simulate storage
    const storedData = {
      userId: "user123",
      passwordHash: passwordHash,
      encryptedData: encryptedUserData,
    };

    console.log("Data to store in database:", storedData);
  } catch (error) {
    console.error("Registration Error:", error);
  }
}

// Example 3: User Login and Data Decryption
export async function exampleUserLogin() {
  try {
    console.log("=== User Login Example ===");

    // Simulate stored data from database
    const storedData = {
      userId: "user123",
      passwordHash: await hashPassword("userPassword123!"),
      encryptedData: await encryptData(
        JSON.stringify({ message: "Secret user data" }),
        "userPassword123!"
      ),
    };

    // User attempts to login
    const loginPassword = "userPassword123!";

    // Verify password
    const isValidPassword = await verifyPassword(
      loginPassword,
      storedData.passwordHash
    );
    console.log("Password valid:", isValidPassword);

    if (isValidPassword) {
      // Decrypt user data
      const decryptedData = await decryptData(
        storedData.encryptedData.encrypted,
        storedData.encryptedData.iv,
        storedData.encryptedData.salt,
        loginPassword
      );
      console.log("Decrypted user data:", JSON.parse(decryptedData));
    } else {
      console.log("Invalid password - cannot decrypt data");
    }
  } catch (error) {
    console.error("Login Error:", error);
  }
}

// Example 4: Generate secure password
export function examplePasswordGeneration() {
  console.log("=== Password Generation Example ===");

  const password8 = generateSecurePassword(8);
  const password16 = generateSecurePassword(16);
  const password32 = generateSecurePassword(32);

  console.log("8-char password:", password8);
  console.log("16-char password:", password16);
  console.log("32-char password:", password32);
}

// Example 5: Wrong password handling
export async function exampleWrongPassword() {
  try {
    console.log("=== Wrong Password Example ===");

    const correctPassword = "correct123!";
    const wrongPassword = "wrong456!";
    const plainText = "Secret message";

    // Encrypt with correct password
    const encrypted = await encryptData(plainText, correctPassword);
    console.log("Encrypted successfully");

    // Try to decrypt with wrong password
    try {
      await decryptData(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.salt,
        wrongPassword
      );
      console.log("ERROR: Should not reach here!");
    } catch (error) {
      console.log(
        "Expected error with wrong password:",
        (error as Error).message
      );
    }

    // Decrypt with correct password
    const decrypted = await decryptData(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.salt,
      correctPassword
    );
    console.log("Decrypted with correct password:", decrypted);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

// Run all examples
export async function runAllExamples() {
  await exampleBasicE2EE();
  console.log("\n");

  await exampleUserRegistration();
  console.log("\n");

  await exampleUserLogin();
  console.log("\n");

  examplePasswordGeneration();
  console.log("\n");

  await exampleWrongPassword();
}
