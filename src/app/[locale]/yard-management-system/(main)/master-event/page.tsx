import { Suspense } from "react";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { Response } from "@/types/api";
import type { MYardEvent } from "@/types/yard-events";

export default async function Page() {
  let data = null;

  try {
    const response = await http.get<Response<MYardEvent[], string>>("yard-events",);
    data = response.data.data;
  } catch (error) {
    console.log("error", error);
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Client data={data} />
    </Suspense>
  );
}
