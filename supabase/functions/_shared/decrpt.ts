import { AES } from "god_crypto";

import { Item } from "./interfaces.ts";
import {
  DECRYPT_ALGO,
  PASS_KEY_ALG,
  PASS_KEY_SUB,
  PASS_PDF_ALG,
  PASS_PDF_SUB,
  PASS_ZIP_ALG,
  PASS_ZIP_SUB,
} from "./consts.ts";

type AESBlockMode = "cbc" | "ecb" | "cfb";

export async function digestHex(msg: string, algo: string) {
  const uint8_msg = new TextEncoder().encode(msg);
  const hashBuff = await crypto.subtle.digest(algo, uint8_msg);
  return Array.from(new Uint8Array(hashBuff))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function decrypt(key: string, msg: string) {
  const uint8_msg: Uint8Array = Uint8Array.from(
    msg,
    (m) => m.codePointAt(0) || 0
  );
  const vtr = uint8_msg.slice(0, 16);
  const bin: Uint8Array = uint8_msg.slice(16);
  const decipher = new AES(key, { mode: <AESBlockMode>DECRYPT_ALGO, iv: vtr });
  const decrypted = await decipher.decrypt(bin);
  return decrypted.toString();
}

export async function resolvePassKey(item: Item) {
  const msg = `${item.user_id}${item.key}${item.library_id}`;
  const digest = await digestHex(msg, PASS_KEY_ALG);
  const [from, to] = PASS_KEY_SUB.split(",");
  const key = digest.substring(Number(from), Number(to));
  return key;
}

export async function resolvePassZip(msg: string) {
  const digest = await digestHex(msg, PASS_ZIP_ALG);
  const [from, to] = PASS_ZIP_SUB.split(",");
  const key = digest.substring(Number(from), Number(to));
  return key;
}

export async function resolvePassPdf(msg: string) {
  const digest = await digestHex(msg, PASS_PDF_ALG);
  const [from, to] = PASS_PDF_SUB.split(",");
  const key = digest.substring(Number(from), Number(to));
  return key;
}
