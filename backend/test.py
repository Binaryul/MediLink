from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad

# Fixed 32-byte key (AES-256)
key = b"0123456789abcdef0123456789abcdef"

# Fixed 16-byte IV for reproducibility (DO NOT do this in real crypto use)
iv = b"abcdef0123456789"

cipher = AES.new(key, AES.MODE_CBC, iv=iv)

plaintext = b"Shush yo mouth Chopper D. Plug"
ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))

print("Ciphertext (hex):", ciphertext.hex())
