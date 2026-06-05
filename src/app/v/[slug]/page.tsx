import { PublicVendor } from "@/components/vendor/public-vendor";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VendorPage({ params }: PageProps) {
  const { slug } = await params;
  return <PublicVendor slug={slug} />;
}
