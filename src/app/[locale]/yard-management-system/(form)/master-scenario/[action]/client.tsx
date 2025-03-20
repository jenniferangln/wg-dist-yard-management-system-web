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
import type { MYardScenario } from "@/types/yard-scenarios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import axios, { AxiosError } from "axios";
import type { Response } from "@/types/api";
import { usePathname } from "next/navigation";

const formSchema = z.object({
  scenarioCode: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  scenarioDesc: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(255, "Max length is 255 characters"),
  scenarioCategory: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
});

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
  action: "create" | "update";
  data: MYardScenario | null;
  scenarioCategoryOptions: { value: string | number; label: string }[];
}

export default function Page({
  action,
  data,
  scenarioCategoryOptions,
}: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    scenarioCode: data?.scenarioCode || "",
    scenarioDesc: data?.scenarioDesc || "",
    scenarioCategory: data?.scenarioCategory || "",
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
          `/yard-management-system/api/yard-scenarios/${atob(id)}`,
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
          "/yard-management-system/api/yard-scenarios",
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
                    label="Scenario Code"
                    name="scenarioCode"
                    type="text"
                    defaultValue={form.scenarioCode}
                    onBlur={(ev) =>
                      handleFormChange("scenarioCode", ev.target.value)
                    }
                    error={
                      errors?.scenarioCode &&
                      errors.scenarioCode._errors?.length > 0
                    }
                    helperText={errors?.scenarioCode?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Scenario Description"
                    name="scenarioDesc"
                    type="text"
                    defaultValue={form.scenarioDesc}
                    onBlur={(ev) =>
                      handleFormChange("scenarioDesc", ev.target.value)
                    }
                    error={
                      errors?.scenarioDesc &&
                      errors.scenarioDesc._errors?.length > 0
                    }
                    helperText={errors?.scenarioDesc?._errors?.join(", ")}
                  />
                  <Select
                    fullWidth
                    label="Scenario Category"
                    error={
                      errors?.scenarioCategory &&
                      errors.scenarioCategory._errors?.length > 0
                    }
                    helperText={errors?.scenarioCategory?._errors?.join(", ")}
                    name="scenarioCategory"
                    value={form.scenarioCategory}
                    onChange={(ev) =>
                      handleFormChange(
                        "scenarioCategory",
                        ev.target.value as string,
                      )
                    }
                  >
                    {scenarioCategoryOptions?.map((item, idx) => (
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
