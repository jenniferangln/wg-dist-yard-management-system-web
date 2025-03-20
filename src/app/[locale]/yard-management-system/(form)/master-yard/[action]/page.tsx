import { notFound } from "next/navigation";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { MYard } from "@/types/yards";
import type { Response } from "@/types/api";

type ParentYardIdOptions = { id: number; yardCode: string };
type YardTypeOptions = { value: string };
type SourceLocOptions = { value: string };
type UtcTimezoneOptions = { value: string };

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
  let parentYardIdOptions = [{ value: 0, label: "Label" }];
  let yardTypeOptions = [{ value: "", label: "Label" }];
  let sourceLocOptions = [{ value: "", label: "Label" }];
  let utcTimezoneOptions = [{ value: "", label: "Label" }];

  let masterData = null;
  if (action === "update" && id) {
    masterData = http
      .get<Response<MYard>>(`yards/detail?id=${atob(id)}`)
      .then((r) => {
        data = r.data.data;
      })
      .catch((error) => {
        console.log("Error fetching masterData", error);
      });
  }

  const allParentYardIdOptions = http
    .get<Response<ParentYardIdOptions[]>>("yards?yardType=ESTATE")
    .then((r) => {
      parentYardIdOptions = r.data.data.map((option) => ({
        value: option.id,
        label: option.yardCode,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });

  const allYardTypeOptions = http
    .get<Response<YardTypeOptions[]>>("settings?settingId=yard_type")
    .then((r) => {
      yardTypeOptions = r.data.data.map((option) => ({
        value: option.value,
        label: option.value,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });

  const allSourceLocOptions = http
    .get<Response<SourceLocOptions[]>>("replace/this")
    .then((r) => {
      sourceLocOptions = r.data.data.map((option) => ({
        value: option.value,
        label: option.value,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });

  const allUtcTimezoneOptions = http
    .get<Response<UtcTimezoneOptions[]>>("settings?settingId=utc_time")
    .then((r) => {
      utcTimezoneOptions = r.data.data.map((option) => ({
        value: option.value,
        label: option.value,
      }));
    })
    .catch((error) => {
      console.log("Error fetching options", error);
    });

  await Promise.all([
    masterData,
    allParentYardIdOptions,
    allYardTypeOptions,
    allSourceLocOptions,
    allUtcTimezoneOptions,
  ]);

  return (
    <Client
      action={action}
      data={data}
      parentYardIdOptions={parentYardIdOptions}
      yardTypeOptions={yardTypeOptions}
      sourceLocOptions={sourceLocOptions}
      utcTimezoneOptions={utcTimezoneOptions}
    />
  );
}
