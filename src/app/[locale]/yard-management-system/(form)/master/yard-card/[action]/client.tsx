"use client";

import type { Response } from "@/types/api";
import type { MYardCard } from "@/types/yard-cards";
import { useRouter } from "@bprogress/next";
import { Box, Stack } from "@mui/material";
import {
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Topbar,
  breakpoint,
  getGap,
  getPadding,
  getRadius,
  getStrokeColor,
  responsive,
  shadow,
  useSnackbar,
} from "@wings-corporation/phoenix-ui";
import axios, { AxiosError } from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  yardId: z.number({ message: "Field is required" }),
  cardCode: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(1, "Max length is 1 characters"),
  cardName: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(100, "Max length is 100 characters"),
  maxCard: z.number({ message: "Field is required" }),
  startNum: z.number({ message: "Field is required" }),
  endNum: z.number({ message: "Field is required" }),
  kodeKbm: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(2, "Max length is 2 characters"),
});

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
  action: "create" | "update";
  data: MYardCard | null;
  yardIdOptions: { value: string | number; label: string }[];
}

export default function Page({ action, data, yardIdOptions }: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    yardId: data?.yardId || 0,
    cardCode: data?.cardCode || "",
    cardName: data?.cardName || "",
    maxCard: data?.maxCard || 0,
    startNum: data?.startNum || 0,
    endNum: data?.endNum || 0,
    kodeKbm: data?.kodeKbm || "",
  });
  const { triggerSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const redirect = pathname.split("/").slice(0, -1).join("/");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          `/yard-management-system/api/yard-cards/${atob(id)}`,
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
          "/yard-management-system/api/yard-cards",
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
      {isMounted && (
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
      )}
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
                  <Select
                    fullWidth
                    label="Yard Code"
                    error={errors?.yardId && errors.yardId._errors?.length > 0}
                    helperText={errors?.yardId?._errors?.join(", ")}
                    name="yardId"
                    value={form.yardId}
                    disabled={action === 'update'}
                    onChange={(ev) =>
                      handleFormChange("yardId", ev.target.value as string)
                    }
                  >
                    {yardIdOptions?.map((item, idx) => (
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
                    label="Card Code"
                    name="cardCode"
                    type="text"
                    disabled={action === 'update'}
                    defaultValue={form.cardCode}
                    onBlur={(ev) =>
                      handleFormChange("cardCode", ev.target.value)
                    }
                    error={
                      errors?.cardCode && errors.cardCode._errors?.length > 0
                    }
                    helperText={errors?.cardCode?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Card Name"
                    name="cardName"
                    type="text"
                    defaultValue={form.cardName}
                    onBlur={(ev) =>
                      handleFormChange("cardName", ev.target.value)
                    }
                    error={
                      errors?.cardName && errors.cardName._errors?.length > 0
                    }
                    helperText={errors?.cardName?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Max Card"
                    name="maxCard"
                    type="number"
                    defaultValue={form.maxCard}
                    onBlur={(ev) =>
                      handleFormChange("maxCard", +ev.target.value)
                    }
                    error={
                      errors?.maxCard && errors.maxCard._errors?.length > 0
                    }
                    helperText={errors?.maxCard?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Start Num"
                    name="startNum"
                    type="number"
                    defaultValue={form.startNum}
                    onBlur={(ev) =>
                      handleFormChange("startNum", +ev.target.value)
                    }
                    error={
                      errors?.startNum && errors.startNum._errors?.length > 0
                    }
                    helperText={errors?.startNum?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="End Num"
                    name="endNum"
                    type="number"
                    defaultValue={form.endNum}
                    onBlur={(ev) =>
                      handleFormChange("endNum", +ev.target.value)
                    }
                    error={errors?.endNum && errors.endNum._errors?.length > 0}
                    helperText={errors?.endNum?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Kode Kbm"
                    name="kodeKbm"
                    type="text"
                    defaultValue={form.kodeKbm}
                    onBlur={(ev) =>
                      handleFormChange("kodeKbm", ev.target.value)
                    }
                    error={
                      errors?.kodeKbm && errors.kodeKbm._errors?.length > 0
                    }
                    helperText={errors?.kodeKbm?._errors?.join(", ")}
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
