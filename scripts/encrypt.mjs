import crypto from 'crypto';

// Encryption function
function encrypt(text, secretKey) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Usage example
const secretKey = 'secret'; // Replace with your key
const textToEncrypt = 'sk-';
const encryptedText = encrypt(textToEncrypt, secretKey);
console.log('Encrypted:', encryptedText);
