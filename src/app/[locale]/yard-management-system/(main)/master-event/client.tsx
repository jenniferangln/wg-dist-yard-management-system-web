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
import type { MYardEvent } from "@/types/yard-events";
import { usePathname } from "next/navigation";
import type { GridColDef } from "@mui/x-data-grid-premium";

const columns: GridColDef<MYardEvent>[] = [
  {
    field: "yardEvent",
    headerName: "Event Code",
    type: "string",
    width: 150,
  },
  {
    field: "yardEventDesc",
    headerName: "Event Desc",
    type: "string",
    width: 150,
  },
  {
    field: "subToKafkaTopic",
    headerName: "Kafka",
    type: "string",
    width: 150,
  },
];

export default function Client({ data }: { data: MYardEvent[] | null }) {
  const [selectedRowId, setSelectedRowId] = useState(0);
  const [dialog, setDialog] = useState({ isOpen: false, isDeleting: false });
  const router = useRouter();
  const { triggerSnackbar } = useSnackbar();
  const pathname = usePathname();

  function onRowDelete() {
    setDialog((prev) => ({ ...prev, isDeleting: true }));
    axios
      .delete<Response<null, string>>(
        `/yard-management-system/api/yard-events/${selectedRowId}`,
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
        autosizeOnMount
        allowCreate
        checkboxSelection
        columns={columns}
        dataName="Event"
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
