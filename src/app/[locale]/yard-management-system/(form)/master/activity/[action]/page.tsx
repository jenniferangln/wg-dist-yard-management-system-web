import { notFound } from "next/navigation";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { MYardActivity } from "@/types/yard-activities";
import type { Response } from "@/types/api";

type YardActivityCategoryIdOptions = {
  id: number;
  yardActivityCategory: string;
};

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
  let yardActivityCategoryIdOptions = [{ value: 0, label: "Loading..." }];

  // load category options
  const fetchCategoryOptions = async () => {
    await http
    .get<Response<YardActivityCategoryIdOptions[]>>("yard-activity-categories")
    .then((r) => {
      yardActivityCategoryIdOptions = r.data.data.map((option) => ({
        value: option.id,
        label: option.yardActivityCategory,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });
  }

  const refreshCategoryOptions = () => {
    fetchCategoryOptions();
  };

  // load detail 
  if (action === "update" && id) {
    await http
      .get<Response<MYardActivity>>(`yard-activities/detail?id=${atob(id)}`)
      .then((r) => {
        data = r.data.data;
      })
      .catch((error) => {
        console.log("Error fetching masterData", error);
      });
  }

  await fetchCategoryOptions();

  return (
    <Client
      action={action}
      data={data}
      yardActivityCategoryIdOptions={yardActivityCategoryIdOptions} 
      // refreshCategoryOptions={refreshCategoryOptions}    
    />
  );
}
