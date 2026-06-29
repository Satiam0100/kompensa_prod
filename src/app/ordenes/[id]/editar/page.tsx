import { redirect } from "next/navigation";

interface EditarOrdenPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarOrdenPage(_props: EditarOrdenPageProps) {
  redirect("/ordenes");
}
