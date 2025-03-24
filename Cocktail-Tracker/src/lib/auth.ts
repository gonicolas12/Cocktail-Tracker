import * as CryptoJS from 'crypto-js';

// Fonction de hachage
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

// Fonction de vérification
export function comparePassword(password: string, hashedPassword: string): boolean {
  return CryptoJS.SHA256(password).toString() === hashedPassword;
}