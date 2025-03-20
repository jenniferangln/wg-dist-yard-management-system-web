import { Suspense } from "react";
import Client from "./client";
import { http } from "@/lib/axios/http";
import type { Response } from "@/types/api";
import type { MYardScenario } from "@/types/yard-scenarios";
import moment from "moment";

export default async function Page() {
  let data = null;

  const convertUnixToLocalTime = (timestamp: number) => {
    return moment.unix(timestamp).format("DD/MM/YYYY HH:mm:ss");
  };
  
  try {
    const response = await http.get<Response<MYardScenario[], string>>("yard-scenarios");
    data = response.data.data;
    data.map((x) => {
      x.createdAt = x.createdAt ? convertUnixToLocalTime(parseInt(x.createdAt)) : "";
      x.updatedAt = x.updatedAt ? convertUnixToLocalTime(parseInt(x.updatedAt)) : "";
    })
  } catch (error) {
    console.log("error", error);
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Client data={data} />
    </Suspense>
  );
}
