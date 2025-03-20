import { notFound } from "next/navigation";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { MYardScenario } from "@/types/yard-scenarios";
import type { Response } from "@/types/api";

type ScenarioCategoryOptions = { value: string };

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
  let scenarioCategoryOptions = [{ value: "", label: "Loading..." }];

  if (action === "update" && id) {
    await http
      .get<Response<MYardScenario>>(`yard-scenarios/detail?id=${atob(id)}`)
      .then((r) => {
        data = r.data.data;
      })
      .catch((error) => {
        console.log("Error fetching masterData", error);
      });
  }
  await http
    .get<Response<ScenarioCategoryOptions[]>>("settings?settingId=scenario_cat")
    .then((r) => {
      scenarioCategoryOptions = r.data.data.map((option) => ({
        value: option.value,
        label: option.value,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });

  return (
    <Client
      action={action}
      data={data}
      scenarioCategoryOptions={scenarioCategoryOptions}
    />
  );
}
