import ImageKit from "@imagekit/nodejs";

export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export function getImageKitAuth() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3600;
  const signature = imagekit.helper?.getAuthenticationParameters
    ? imagekit.helper.getAuthenticationParameters(token, expire).signature
    : "";
  return { token, expire, signature };
}
