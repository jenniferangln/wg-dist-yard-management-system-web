"use client";

import {
  DataGrid,
  Snackbar,
  useSnackbar,
  Dialog,
  Typography,
} from "@wings-corporation/phoenix-ui";
import { Box } from "@mui/material";
import axios, { AxiosError } from "axios";
import { useRouter } from "@bprogress/next";
import { useState } from "react";
import type { Response } from "@/types/api";
import type { MSetting } from "@/types/settings";
import { usePathname } from "next/navigation";
import type { GridColDef } from "@mui/x-data-grid-premium";

const columns: GridColDef<MSetting>[] = [
  { field: "settingId", headerName: "Setting Id", type: "string", width: 150 },
  { field: "seq", headerName: "Seq", type: "string", width: 150 },
  { field: "value", headerName: "Value", type: "string", width: 150 },
  {
    field: "description",
    headerName: "Description",
    type: "string",
    width: 150,
  },
  { field: "createdBy", headerName: "Created By", type: "string", width: 150 },
  { field: "createdAt", headerName: "Created At", type: "string", width: 150 },
  { field: "updatedBy", headerName: "Updated By", type: "string", width: 150 },
  { field: "updatedAt", headerName: "Updated At", type: "string", width: 150 },
];

export default function Client({ data }: { data: MSetting[] | null }) {
  const [selectedRowId, setSelectedRowId] = useState(0);
  const [dialog, setDialog] = useState({ isOpen: false, isDeleting: false });
  const router = useRouter();
  const { triggerSnackbar } = useSnackbar();
  const pathname = usePathname();

  function onRowDelete() {
    setDialog((prev) => ({ ...prev, isDeleting: true }));
    axios
      .delete<Response<null, string>>(
        `/yard-management-system/api/settings/${selectedRowId}`,
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
        dataName="Setting"
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
