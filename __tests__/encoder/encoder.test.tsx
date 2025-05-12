import { encrypt } from "../../encoder/encrypt"
import { writeFileSync } from "fs";
import path from "path";

describe("Encryption - AES256-GCM", () => {
  const key = "12345678901234567890123456789012"; //NOSONAR
  const text = "Pesan penting untuk didekripsi di Python";

  it("should produce a base64 encrypted string", () => {
    const encrypted = encrypt(text, key); //NOSONAR

    expect(typeof encrypted).toBe("string"); //NOSONAR
    expect(() => Buffer.from(encrypted, 'base64')).not.toThrow(); //NOSONAR

    const filePath = path.join(__dirname, "test_output.txt");
    writeFileSync(filePath, encrypted, 'utf8');
  });
});
