import { AxiosError } from "axios"
import { NextResponse } from "next/server"
import { http } from "@/lib/axios/http"
import type { Response } from "@/types/api"

export async function POST(req: Request) {
	const data = await req.json()
	try {
		const response = await http.post<Response<null, string>>("yard-cards", data)
		return NextResponse.json({ message: response.data.message })
	} catch (error) {
		const err = error as AxiosError<Response<null | { listMessage: string[] }, string>>
		return NextResponse.json(
			{ message: err.response ? err.response.data.data?.listMessage.join(", ") || err.response.data.message : "Unknown Error!" },
			{ status: err.status }
		)
	}
}
