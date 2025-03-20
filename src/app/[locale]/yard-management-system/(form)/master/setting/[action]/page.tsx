import { notFound } from "next/navigation";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { MSetting } from "@/types/settings";
import type { Response } from "@/types/api";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ action: "create" | "update" }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const action = (await params).action;
  const id = (await searchParams).id;
  if (action !== "create" && action !== "update") {
    notFound();
  }

  let data = null;

  if (action === "update" && id) {
    const masterData = http
      .get<Response<MSetting>>(`settings/detail?id=${atob(id)}`)
      .then((r) => {
        data = r.data.data;
      })
      .catch((error) => {
        console.log("Error fetching masterData", error);
      });

    await Promise.all([masterData]);
  }

  return (
    <Client
      action={action}
      data={data}
    />
  );
}
