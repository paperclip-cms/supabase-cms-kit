import { CollectionsList } from "@/components/collections/collections-list";
import { createClient } from "@/lib/supabase/server";
import { getCollectionsQuery } from "@/lib/supabase/queries";

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data: collections, error } = await getCollectionsQuery(supabase);

  if (error) {
    console.error(error);
    return <div>Error loading collections</div>;
  }

  return (
    <div className="w-full flex justify-center p-8">
      <div className="w-full max-w-7xl">
        <CollectionsList collections={collections || []} />
      </div>
    </div>
  );
}
