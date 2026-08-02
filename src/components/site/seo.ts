import { brand } from "@/content/site";

type MetaEntry = Record<string, string>;

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): { meta: MetaEntry[] } {
  const fullTitle = title.includes(brand.name) ? title : `${title} — ${brand.name}`;
  const meta: MetaEntry[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
  ];
  if (path) meta.push({ property: "og:url", content: `${brand.url}${path}` });
  return { meta };
}

export function jsonLd(data: Record<string, unknown>) {
  return {
    scripts: [{ type: "application/ld+json", children: JSON.stringify(data) }],
  };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  legalName: brand.legalName,
  url: brand.url,
  email: brand.email,
  telephone: brand.phone,
  foundingDate: String(brand.founded),
  description: brand.positioning,
  address: {
    "@type": "PostalAddress",
    streetAddress: brand.addressLines[0],
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94104",
    addressCountry: "US",
  },
  sameAs: [brand.social.linkedin, brand.social.x, brand.social.github],
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${brand.url}${item.path}`,
    })),
  };
}
