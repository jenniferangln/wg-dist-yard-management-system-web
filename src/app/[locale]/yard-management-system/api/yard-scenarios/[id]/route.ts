import { AxiosError } from "axios"
import { NextResponse } from "next/server"
import { http } from "@/lib/axios/http"
import type { Response } from "@/types/api"
import type { MYardScenario } from "@/types/yard-scenarios";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id
	const data = await req.json()
	try {
		const response = await http.put<Response<MYardScenario, string>>(`yard-scenarios/${id}`, data)
		return NextResponse.json({ message: response.data.message })
	} catch (error) {
		const err = error as AxiosError<Response<null | { listMessage: string[] }, string>>
		return NextResponse.json(
			{ message: err.response ? err.response.data.data?.listMessage || [err.response.data.message] : "Unknown Error!" },
			{ status: err.status }
		)
	}
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id
	try {
		const response = await http.delete<Response<MYardScenario, string>>(`yard-scenarios/${id}`)
		return NextResponse.json({ message: response.data.message })
	} catch (error) {
		const err = error as AxiosError<Response<null | { listMessage: string[] }, string>>
		return NextResponse.json(
			{ message: err.response ? err.response.data.data?.listMessage || [err.response.data.message] : "Unknown Error!" },
			{ status: err.status }
		)
	}
}
