import { http } from "@/lib/axios/http";
import type { Response } from "@/types/api";
import type { MYardCard } from "@/types/yard-cards";
import { notFound } from "next/navigation";
import Client from "./client";

type YardIdOptions = { id: number; yardCode: string; yardName: string };

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
  let yardIdOptions = [{ value: 0, label: "Label" }];

  let masterData = null;
  if (action === "update" && id) {
    masterData = http
      .get<Response<MYardCard>>(`yard-cards/detail?id=${atob(id)}`)
      .then((r) => {
        data = r.data.data;
      })
      .catch((error) => {
        console.log("Error fetching masterData", error);
      });
  }

  const allYardIdOptions = http
    .get<Response<YardIdOptions[]>>("yards")
    .then((r) => {
      yardIdOptions = r.data.data.map((option) => ({
        value: option.id,
        label: `${option.yardCode} - ${option.yardName}`,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });

  await Promise.all([masterData, allYardIdOptions]);

  return (
    <Client
      action={action}
      data={data}
      yardIdOptions={yardIdOptions}
    />
  );
}
