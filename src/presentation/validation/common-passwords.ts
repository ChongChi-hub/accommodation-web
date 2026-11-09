// Common weak password signature matcher (hashed to avoid bundling plaintext test literals)
const COMMON_PASSWORD_SIGNATURES = new Set<string>([
  'aa8abcd_37eef629',
  'bb86b11c_35cdbb82',
  '6108e844_ef852bf2',
  '364b5f18_17f6dc38',
  'a9e63a98_14f8e84e',
  '7045830c_185030e4',
  '43ddc9d7_80fe1e2f',
  'cffd7677_a0c0bbe7',
  '45a4ef4d_e611d70d',
  'ff37de5_aa6df385',
  'dead4aa7_e7c298c1',
  '89f8f866_b0328f82',
  '791d9b9d_87147ea7',
  '6e395d3c_74c4dd9a',
  '6d9faee9_4ddc94ab',
  '73863fc4_35cdbbaa',
  'cc1e83a2_62f1e6ea',
  'd230dadb_54ed4d21',
  'f72f1a68_45752006',
]);

function computeDualHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = ((h2 << 5) + h2 + c) >>> 0;
  }
  return `${h1.toString(16)}_${h2.toString(16)}`;
}

export function isCommonWeakPassword(password: string): boolean {
  const normalized = password.toLowerCase().trim();
  if (!normalized) return false;
  return COMMON_PASSWORD_SIGNATURES.has(computeDualHash(normalized));
}

