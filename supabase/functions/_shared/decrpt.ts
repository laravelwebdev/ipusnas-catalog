import { AES } from "god_crypto";
import { DECRYPT_ALGO, PASS_KEY_ALG, PASS_KEY_SUB, PASS_PDF_ALG, PASS_PDF_SUB, PASS_ZIP_ALG, PASS_ZIP_SUB } from "./consts.ts";
export async function digestHex(msg, algo) {
  const uint8_msg = new TextEncoder().encode(msg);
  const hashBuff = await crypto.subtle.digest(algo, uint8_msg);
  return Array.from(new Uint8Array(hashBuff)).map((b)=>b.toString(16).padStart(2, "0")).join("");
}
export async function decrypt(key, msg) {
  const uint8_msg = Uint8Array.from(msg, (m)=>m.codePointAt(0) || 0);
  const vtr = uint8_msg.slice(0, 16);
  const bin = uint8_msg.slice(16);
  const decipher = new AES(key, {
    mode: DECRYPT_ALGO,
    iv: vtr
  });
  const decrypted = await decipher.decrypt(bin);
  return decrypted.toString();
}
export async function resolvePassKey(item) {
  const msg = `ddfe0889-bf59-40f0-8c67-795aea581da8uxExxLuKEe7LJ1MT1R6xhVWGkRBU2A3KlEl4NxCW4l9AA8vsm+IHQJLUP+YOaHLT8o1tcu//sUOoN6KUD6T41w==789493d9-4f7c-48d1-ad32-e2c120461f68`;
  const digest = await digestHex(msg, PASS_KEY_ALG);
  const [from, to] = PASS_KEY_SUB.split(",");
  const key = digest.substring(Number(from), Number(to));
  return key;
}
export async function resolvePassZip(msg) {
  const digest = await digestHex(msg, PASS_ZIP_ALG);
  const [from, to] = PASS_ZIP_SUB.split(",");
  const key = digest.substring(Number(from), Number(to));
  return key;
}
export async function resolvePassPdf(msg) {
  const digest = await digestHex(msg, PASS_PDF_ALG);
  const [from, to] = PASS_PDF_SUB.split(",");
  const key = digest.substring(Number(from), Number(to));
  return key;
}
