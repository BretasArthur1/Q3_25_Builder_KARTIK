// index.js
const bs58 = require('bs58');
const fs = require('fs');


const base58Secret = '3P2eR46qZAJoqdkfN9i9cJMHy59mNVGGiTfogqKRLVRVi8DNFofH8XNNhPhyen6fB3kafnv93fdxbJfeEPYWQQRd'; // Your exported key from Phantom
const secretKey = bs58.decode(base58Secret);

fs.writeFileSync('wallet.json', JSON.stringify(Array.from(secretKey)));
console.log('Saved to wallet.json');



