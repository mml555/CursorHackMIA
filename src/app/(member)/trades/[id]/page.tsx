import { TradeDetailView } from "@/components/member/trade-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TradeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TradeDetailView tradeId={id} />;
}
