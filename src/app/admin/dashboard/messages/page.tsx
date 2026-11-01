import { PageHeader } from "@/components/dashboard/PageHeader";
import { MessagesInbox } from "./_components/MessagesInbox";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" description="Sent from the store's contact form." />
      <MessagesInbox />
    </>
  );
}
