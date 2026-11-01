import { EditPage } from "./EditPage";

export const metadata = { title: "Edit page" };

export default async function EditPagePage({
  params,
}: PageProps<"/admin/dashboard/pages/[id]/edit">) {
  const { id } = await params;
  return <EditPage id={id} />;
}
