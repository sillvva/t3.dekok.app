import withPWA from "next-pwa";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default withPWA(
  defineNextConfig({
    reactStrictMode: true,
    experimental: {
      images: {
        allowFutureImage: true
      }
    },
    images: {
      domains: ["slxazldgfeytirfrculz.supabase.co", "avatars.githubusercontent.com"]
    },
    pwa: {
      dest: "public"
    }
  })
);
