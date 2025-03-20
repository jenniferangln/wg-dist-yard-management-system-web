import { Suspense } from "react";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { Response } from "@/types/api";
import type { MYardConfigsap } from "@/types/yard-configsaps";

export default async function Page() {
  let data = null;

  try {
    const response = await http.get<Response<MYardConfigsap[], string>>("yard-configsaps");
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
