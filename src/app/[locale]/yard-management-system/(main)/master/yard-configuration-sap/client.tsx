"use client"

import { DataGrid, Snackbar, useSnackbar, Dialog, Typography } from "@wings-corporation/phoenix-ui"
import { Box } from "@mui/material"
import axios, { AxiosError } from "axios"
import { useRouter } from "@bprogress/next"
import { useState } from "react"
import type { Response } from "@/types/api"
import type { MYardConfigsap } from "@/types/yard-configsaps"
import { usePathname } from "next/navigation"
import type { GridColDef } from "@mui/x-data-grid-premium"

const columns: GridColDef<MYardConfigsap>[] = [{"field":"yardId","headerName":"Yard Code","type":"string","width":150},{"field":"host","headerName":"Host","type":"string","width":150},{"field":"client","headerName":"Client","type":"string","width":150},{"field":"systemNumber","headerName":"System Number","type":"string","width":150},{"field":"systemId","headerName":"System Id","type":"string","width":150},{"field":"username","headerName":"Username","type":"string","width":150},{"field":"password","headerName":"Password","type":"string","width":150},{"field":"lang","headerName":"Lang","type":"string","width":150}]

export default function Client({ data }: { data: MYardConfigsap[] | null }) {
	const [selectedRowId, setSelectedRowId] = useState(0)
	const [dialog, setDialog] = useState({ isOpen: false, isDeleting: false })
	const router = useRouter()
	const { triggerSnackbar } = useSnackbar()
  const pathname = usePathname();

	function onRowDelete() {
    setDialog((prev) => ({ ...prev, isDeleting: true }))
		axios
			.delete<Response<null, string>>(`/yard-management-system/api/yard-configsaps/${selectedRowId}`)
			.then((r) => {
        router.refresh()
        triggerSnackbar({ message: r.data.message, emoji: "sparkles" })
      })
			.catch((err: AxiosError<{ message: string }>) => triggerSnackbar({ message: err.response!.data.message }))
			.finally(() => setDialog({ isOpen: false, isDeleting: false }))
	}

  return (
    <Box>
      <DataGrid
        autoHeight
        allowCreate
        checkboxSelection
        columns={columns}
        dataName="Yard Configuration SAP"
        editMode="row"
        slotProps={{
          floatingActionbar: {
            menuOptions: [
              {
                label: "Profile",
                onClick: function onProfileClick() {},
              },
              {
                label: "Settings",
                onClick: function onSettingsClick() {},
              },
              {
                label: "Logout",
                onClick: function onLogoutClick() {},
              },
            ],
            onEdit: function onEditClicked() {},
          },
        }}
        onRowDelete={(row) => {
					setDialog((prev) => ({ ...prev, isOpen: true }))
					setSelectedRowId(row.id)
				}}
        rows={data || []}
        onCreate={() => router.push(`${pathname}/create`)}
				onRowEdit={(ev) => {
					router.push(`${pathname}/update?id=${btoa(ev.id.toString())}`)
				}}
        withExport
        withFilter
        withSearch
      />

      <Dialog
        slotProps={{
          cancelButton:{
            onClick: () => setDialog((prev) => ({ ...prev, isOpen: false })),
            disabled: dialog.isDeleting
          },
          submitButton: {
            children: dialog.isDeleting ? "Deleting..." : "Delete",
            isLoading: dialog.isDeleting,
            variant: "negative",
            onClick: () => onRowDelete()
          }
        }}
        title="Delete Confirmation"
        open={dialog.isOpen}
        fullWidth
      >
        <Box>
          <Typography>Do you want to delete this item?</Typography>
        </Box>
      </Dialog>
      <Snackbar variant="neutral" />
    </Box>
  );
}
