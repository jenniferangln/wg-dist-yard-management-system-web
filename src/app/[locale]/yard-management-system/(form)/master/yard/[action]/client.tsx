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
import type { MYard } from "@/types/yards";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import axios, { AxiosError } from "axios";
import type { Response } from "@/types/api";
import { usePathname } from "next/navigation";

const formSchema = z.object({
  yardCode: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  yardName: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(255, "Max length is 255 characters"),
  parentYardId: z.number({ message: "Field is required" }),
  yardType: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  yardAddress: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(255, "Max length is 255 characters"),
  latitude: z.number({ message: "Field is required" }),
  longitude: z.number({ message: "Field is required" }),
  sourceLoc: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(10, "Max length is 10 characters"),
  utcTimezone: z.number({ message: "Field is required" }),
});

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
  action: "create" | "update";
  data: MYard | null;
  parentYardIdOptions: { value: string | number; label: string }[];
  yardTypeOptions: { value: string | number; label: string }[];
  sourceLocOptions: { value: string | number; label: string }[];
  utcTimezoneOptions: { value: string | number; label: string }[];
}

export default function Page({
  action,
  data,
  parentYardIdOptions,
  yardTypeOptions,
  sourceLocOptions,
  utcTimezoneOptions,
}: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    yardCode: data?.yardCode || "",
    yardName: data?.yardName || "",
    parentYardId: data?.parentYardId || 0,
    yardType: data?.yardType || "",
    yardAddress: data?.yardAddress || "",
    latitude: data?.latitude || 0,
    longitude: data?.longitude || 0,
    sourceLoc: data?.sourceLoc || "",
    utcTimezone: data?.utcTimezone || 0,
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
          `/yard-management-system/api/yards/${atob(id)}`,
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
        .post<Response<null, string>>("/yard-management-system/api/yards", data)
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
                    label="Yard Code"
                    name="yardCode"
                    type="text"
                    disabled={action === 'update'}
                    defaultValue={form.yardCode}
                    onBlur={(ev) =>
                      handleFormChange("yardCode", ev.target.value)
                    }
                    error={
                      errors?.yardCode && errors.yardCode._errors?.length > 0
                    }
                    helperText={errors?.yardCode?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Yard Name"
                    name="yardName"
                    type="text"
                    defaultValue={form.yardName}
                    onBlur={(ev) =>
                      handleFormChange("yardName", ev.target.value)
                    }
                    error={
                      errors?.yardName && errors.yardName._errors?.length > 0
                    }
                    helperText={errors?.yardName?._errors?.join(", ")}
                  />
                  <Select
                    fullWidth
                    label="Parent Yard Code"
                    error={
                      errors?.parentYardId &&
                      errors.parentYardId._errors?.length > 0
                    }
                    helperText={errors?.parentYardId?._errors?.join(", ")}
                    name="parentYardId"
                    value={form.parentYardId}
                    onChange={(ev) =>
                      handleFormChange(
                        "parentYardId",
                        ev.target.value as string,
                      )
                    }
                  >
                    {parentYardIdOptions?.map((item, idx) => (
                      <MenuItem
                        key={idx}
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                    fullWidth
                    label="Yard Type"
                    error={
                      errors?.yardType && errors.yardType._errors?.length > 0
                    }
                    helperText={errors?.yardType?._errors?.join(", ")}
                    name="yardType"
                    value={form.yardType}
                    onChange={(ev) =>
                      handleFormChange("yardType", ev.target.value as string)
                    }
                  >
                    {yardTypeOptions?.map((item, idx) => (
                      <MenuItem
                        key={idx}
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    fullWidth
                    label="Yard Address"
                    name="yardAddress"
                    type="text"
                    defaultValue={form.yardAddress}
                    onBlur={(ev) =>
                      handleFormChange("yardAddress", ev.target.value)
                    }
                    error={
                      errors?.yardAddress &&
                      errors.yardAddress._errors?.length > 0
                    }
                    helperText={errors?.yardAddress?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    defaultValue={form.latitude}
                    onBlur={(ev) =>
                      handleFormChange("latitude", +ev.target.value)
                    }
                    error={
                      errors?.latitude && errors.latitude._errors?.length > 0
                    }
                    helperText={errors?.latitude?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    defaultValue={form.longitude}
                    onBlur={(ev) =>
                      handleFormChange("longitude", +ev.target.value)
                    }
                    error={
                      errors?.longitude && errors.longitude._errors?.length > 0
                    }
                    helperText={errors?.longitude?._errors?.join(", ")}
                  />
                  <Select
                    fullWidth
                    label="Source Loc"
                    error={
                      errors?.sourceLoc && errors.sourceLoc._errors?.length > 0
                    }
                    helperText={errors?.sourceLoc?._errors?.join(", ")}
                    name="sourceLoc"
                    value={form.sourceLoc}
                    onChange={(ev) =>
                      handleFormChange("sourceLoc", ev.target.value as string)
                    }
                  >
                    {sourceLocOptions?.map((item, idx) => (
                      <MenuItem
                        key={idx}
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                    fullWidth
                    label="Utc Timezone"
                    error={
                      errors?.utcTimezone &&
                      errors.utcTimezone._errors?.length > 0
                    }
                    helperText={errors?.utcTimezone?._errors?.join(", ")}
                    name="utcTimezone"
                    value={form.utcTimezone}
                    onChange={(ev) =>
                      handleFormChange("utcTimezone", ev.target.value as string)
                    }
                  >
                    {utcTimezoneOptions?.map((item, idx) => (
                      <MenuItem
                        key={idx}
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
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
