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
import type { MYardEvent } from "@/types/yard-events";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import axios, { AxiosError } from "axios";
import type { Response } from "@/types/api";
import { usePathname } from "next/navigation";

const formSchema = z.object({
  yardEvent: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  yardEventDesc: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(255, "Max length is 255 characters"),
  subToKafkaTopic: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(128, "Max length is 128 characters"),
});

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
  action: "create" | "update";
  data: MYardEvent | null;
}

export default function Page({ action, data }: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    yardEvent: data?.yardEvent || "",
    yardEventDesc: data?.yardEventDesc || "",
    subToKafkaTopic: data?.subToKafkaTopic || "",
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
          `/yard-management-system/api/yard-events/${atob(id)}`,
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
          "/yard-management-system/api/yard-events",
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
                    label="Event Code"
                    name="yardEvent"
                    type="text"
                    defaultValue={form.yardEvent}
                    onBlur={(ev) =>
                      handleFormChange("yardEvent", ev.target.value)
                    }
                    error={
                      errors?.yardEvent && errors.yardEvent._errors?.length > 0
                    }
                    helperText={errors?.yardEvent?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Event Description"
                    name="yardEventDesc"
                    type="text"
                    defaultValue={form.yardEventDesc}
                    onBlur={(ev) =>
                      handleFormChange("yardEventDesc", ev.target.value)
                    }
                    error={
                      errors?.yardEventDesc &&
                      errors.yardEventDesc._errors?.length > 0
                    }
                    helperText={errors?.yardEventDesc?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Kafka"
                    name="subToKafkaTopic"
                    type="text"
                    defaultValue={form.subToKafkaTopic}
                    onBlur={(ev) =>
                      handleFormChange("subToKafkaTopic", ev.target.value)
                    }
                    error={
                      errors?.subToKafkaTopic &&
                      errors.subToKafkaTopic._errors?.length > 0
                    }
                    helperText={errors?.subToKafkaTopic?._errors?.join(", ")}
                  />
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
