"use client";

import { useState } from "react";
import { z } from "zod";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  Snackbar,
  useSnackbar,
  Topbar,
  getStrokeColor,
  responsive,
  getGap,
  getPadding,
  shadow,
  getRadius,
  breakpoint,
} from "@wings-corporation/phoenix-ui";
import { Box, Container, Grid2, Stack } from "@mui/material";
import type { MSetting } from "@/types/settings";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import axios, { AxiosError } from "axios";
import type { Response } from "@/types/api";
import { usePathname } from "next/navigation";

const formSchema = z.object({
  settingId: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  value: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  description: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(100, "Max length is 100 characters"),
});

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
  action: "create" | "update";
  data: MSetting | null;
}

export default function Page({ action, data }: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    settingId: data?.settingId || "",
    value: data?.value || "",
    description: data?.description || "",
    // createdBy: data?.createdBy || "",
    // createdAt: data?.createdAt || 0,
    // updatedBy: data?.updatedBy || "",
    // updatedAt: data?.updatedAt || 0,
  });
  const { triggerSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const redirect = pathname.split("/").slice(0, -1).join("/");

  function handleFormChange(key: keyof typeof form, value: string | number) {
    const updatedForm = { ...form, [key]: value };
    setIsSubmitted(true);
    if (isSubmitted) {
      const result = formSchema.safeParse(updatedForm);
      if (!result.success) {
        const errors = result.error.format() as FormError;
        setErrors(errors);
      } else {
        setErrors(null);
      }
    }
    setForm(updatedForm);
  }

  function onSubmit() {
    setIsSubmitted(true);
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.format() as FormError;
      setErrors(errors);
      return;
    }

    const id = searchParams.get("id");
    setIsLoading(true);
    if (action === "update" && id) {
      axios
        .put<Response<null, string>>(
          `/yard-management-system/api/settings/${atob(id)}`,
          form,
        )
        .then((r) => {
          triggerSnackbar({ message: r.data.message, emoji: "sparkles" });
          setTimeout(() => {
            router.push(redirect);
          }, 4000);
        })
        .catch((err: AxiosError<{ message: string }>) =>
          triggerSnackbar({
            message: err.response!.data.message,
            emoji: "police-car-light",
          }),
        )
        .finally(() => setIsLoading(false));
    } else {
      const data = {
        data: [form],
      };
      axios
        .post<Response<null, string>>(
          "/yard-management-system/api/settings",
          data,
        )
        .then((r) => {
          triggerSnackbar({ message: r.data.message, emoji: "sparkles" });
          setTimeout(() => {
            router.push(redirect);
          }, 4000);
        })
        .catch((err: AxiosError<{ message: string }>) =>
          triggerSnackbar({
            message: err.response!.data.message,
            emoji: "police-car-light",
          }),
        )
        .finally(() => setIsLoading(false));
    }
  }

  return (
    <>
      <Topbar
        topBarDefault={false}
        slotProps={{
          submitButton: {
            isLoading: isLoading,
            onClick: () => onSubmit(),
          },
          cancelButton: {
            onClick: () => router.back(),
          },
        }}
      />
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            [breakpoint.desktop]: {
              width: "calc(100% / 2)",
            },
          }}
        >
          <Box
            sx={{
              border: `0.5px solid ${getStrokeColor("neutral")}`,
              boxShadow: shadow.sm,
              ...responsive({
                attribute: "borderRadius",
                getter: getRadius,
                preset: "lg",
              }),
            }}
          >
            <Stack>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  ...responsive({
                    attribute: "padding",
                    getter: getPadding,
                    preset: "lg",
                  }),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    ...responsive({
                      attribute: "gap",
                      getter: getGap,
                      preset: "md",
                    }),
                  }}
                >
                  <TextField
                    fullWidth
                    label="Setting Id"
                    name="settingId"
                    type="text"
                    defaultValue={form.settingId}
                    onBlur={(ev) =>
                      handleFormChange("settingId", ev.target.value)
                    }
                    error={
                      errors?.settingId && errors.settingId._errors?.length > 0
                    }
                    helperText={errors?.settingId?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Value"
                    name="value"
                    type="text"
                    defaultValue={form.value}
                    onBlur={(ev) => handleFormChange("value", ev.target.value)}
                    error={errors?.value && errors.value._errors?.length > 0}
                    helperText={errors?.value?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    type="text"
                    defaultValue={form.description}
                    onBlur={(ev) =>
                      handleFormChange("description", ev.target.value)
                    }
                    error={
                      errors?.description &&
                      errors.description._errors?.length > 0
                    }
                    helperText={errors?.description?._errors?.join(", ")}
                  />
                  {/* <TextField
                    fullWidth
                    label="Created By"
                    name="createdBy"
                    type="text"
                    disabled={true}
                    defaultValue={data?.createdBy}
                  />
                  <TextField
                    fullWidth
                    label="Created At"
                    name="createdAt"
                    type="number"
                    disabled={true}
                    defaultValue={data?.createdAt}
                  />
                  <TextField
                    fullWidth
                    label="Updated By"
                    name="updatedBy"
                    type="text"
                    disabled={true}
                    defaultValue={data?.updatedBy}
                  />
                  <TextField
                    fullWidth
                    label="Updated At"
                    name="updatedAt"
                    type="number"
                    disabled={true}
                    defaultValue={data?.updatedAt}
                  /> */}
                </Box>
              </Box>
            </Stack>
          </Box>
          <Snackbar variant="neutral" />
        </Stack>
      </Stack>
    </>
  );
}
