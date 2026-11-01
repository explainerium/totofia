import { PageHeader } from "@/components/dashboard/PageHeader";
import { AttributesManager } from "./_components/AttributesManager";

export const metadata = { title: "Attributes" };

export default function AttributesPage() {
  return (
    <>
      <PageHeader
        title="Attributes"
        description="Options that variants are made of, e.g. Size and Color. `size` and `color` power the store filters."
      />
      <AttributesManager />
    </>
  );
}
