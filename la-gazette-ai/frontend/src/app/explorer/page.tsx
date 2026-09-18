import { redirect } from "next/navigation";

export default async function ExplorerPage(props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const searchParams = await props.searchParams;
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (typeof value === "string") {
            params.set(key, value);
        } else if (Array.isArray(value) && value.length > 0) {
            params.set(key, value[0]);
        }
    }

    const query = params.toString();
    redirect(query ? `/search?${query}` : "/search");
}
