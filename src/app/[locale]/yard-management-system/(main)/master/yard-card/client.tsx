"use client";

import type { Response } from "@/types/api";
import type { MYardCard } from "@/types/yard-cards";
import { useRouter } from "@bprogress/next";
import { Box } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid-premium";
import {
  DataGrid,
  Dialog,
  Snackbar,
  Typography,
  useSnackbar,
} from "@wings-corporation/phoenix-ui";
import axios, { AxiosError } from "axios";
import { usePathname } from "next/navigation";
import { useState } from "react";

const columns: GridColDef<MYardCard>[] = [
  { field: "yardId", headerName: "Yard Id", type: "string", width: 150 },
  { field: "cardCode", headerName: "Card Code", type: "string", width: 150 },
  { field: "cardName", headerName: "Card Name", type: "string", width: 150, flex: 1 },
  { field: "maxCard", headerName: "Max Card", type: "string", width: 150 },
  { field: "startNum", headerName: "Start Num", type: "string", width: 150 },
  { field: "endNum", headerName: "End Num", type: "string", width: 150 },
  { field: "kodeKbm", headerName: "Kode Kbm", type: "string", width: 150 },
];

export default function Client({ data }: { data: MYardCard[] | null }) {
  const [selectedRowId, setSelectedRowId] = useState(0);
  const [dialog, setDialog] = useState({ isOpen: false, isDeleting: false });
  const router = useRouter();
  const { triggerSnackbar } = useSnackbar();
  const pathname = usePathname();

  function onRowDelete() {
    setDialog((prev) => ({ ...prev, isDeleting: true }));
    axios
      .delete<Response<null, string>>(
        `/yard-management-system/api/yard-cards/${selectedRowId}`,
      )
      .then((r) => {
        router.refresh();
        triggerSnackbar({ message: r.data.message, emoji: "sparkles" });
      })
      .catch((err: AxiosError<{ message: string }>) =>
        triggerSnackbar({ message: err.response!.data.message }),
      )
      .finally(() => setDialog({ isOpen: false, isDeleting: false }));
  }

  return (
    <Box>
      <DataGrid
        autoHeight
        allowCreate
        checkboxSelection
        columns={columns}
        dataName="Yard Card"
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
          setDialog((prev) => ({ ...prev, isOpen: true }));
          setSelectedRowId(row.id);
        }}
        rows={data || []}
        onCreate={() => router.push(`${pathname}/create`)}
        onRowEdit={(ev) => {
          router.push(`${pathname}/update?id=${btoa(ev.id.toString())}`);
        }}
        withExport
        withFilter
        withSearch
      />

      <Dialog
        slotProps={{
          cancelButton: {
            onClick: () => setDialog((prev) => ({ ...prev, isOpen: false })),
            disabled: dialog.isDeleting,
          },
          submitButton: {
            children: dialog.isDeleting ? "Deleting..." : "Delete",
            isLoading: dialog.isDeleting,
            variant: "negative",
            onClick: () => onRowDelete(),
          },
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
