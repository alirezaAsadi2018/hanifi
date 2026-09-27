import { toLatinDigits } from "../components/ui";

/** Iranian national code (کد ملی) checksum. */
export function isValidNationalCode(raw: string) {
  const code = toLatinDigits(raw).replace(/\D/g, "");
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  const sum = code.slice(0, 9).split("").reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0);
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

/** Iranian IBAN (شماره شبا): IR + 24 digits, ISO 13616 mod-97 check. */
export function isValidSheba(raw: string) {
  const value = toLatinDigits(raw).replace(/\s/g, "").toUpperCase();
  const iban = value.startsWith("IR") ? value : `IR${value}`;
  if (!/^IR\d{24}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + "1827" + iban.slice(2, 4); // I=18, R=27
  let remainder = 0;
  for (const digit of rearranged) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}
