import { PageHeader } from "@/components/dashboard/PageHeader";
import { ReviewsModeration } from "./_components/ReviewsModeration";

export const metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        description="Verified-purchase reviews. New reviews stay hidden on the product page until approved."
      />
      <ReviewsModeration />
    </>
  );
}
