"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  TextField,
  Button,
  RadioGroup,
  RadioGroupItem,
  Dialog,
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
import type { MYardActivity } from "@/types/yard-activities";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import axios, { AxiosError } from "axios";
import type { Response } from "@/types/api";
import { usePathname } from "next/navigation";
import React from "react";
import AddIcon from "@mui/icons-material/Add";

type YardActivityCategoryOptions = {
  id: number;
  yardActivityCategory: string;
};

const formSchema = z.object({
  yardActivity: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  yardActivityDesc: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(255, "Max length is 255 characters"),
  yardActivityCategoryId: z.number({ message: "Field is required" }),
  pubToKafkaTopic: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(128, "Max length is 128 characters"),
});

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

const formCategorySchema = z.object({
  yardActivityCategory: z
    .string()
    .nonempty({ message: "Field is required" })
    .max(50, "Max length is 50 characters"),
  isCreateTaskDoc: z.boolean({
    required_error: "A selection is required.",
    invalid_type_error: "Value must be a boolean.",
  }),
});

type FormCategoryError = {
  [key in keyof z.infer<typeof formCategorySchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
  action: "create" | "update";
  data: MYardActivity | null;
  yardActivityCategoryIdOptions: { value: string | number; label: string }[];
}

export default function Page({
  action,
  data,
  yardActivityCategoryIdOptions,
}: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    yardActivity: data?.yardActivity || "",
    yardActivityDesc: data?.yardActivityDesc || "",
    yardActivityCategoryId: data?.yardActivityCategoryId || 0,
    pubToKafkaTopic: data?.pubToKafkaTopic || "",
  });
  const [formCat, setFormCat] = useState({
    yardActivityCategory: "",
    isCreateTaskDoc: false,
  });
  const { triggerSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const redirect = pathname.split("/").slice(0, -1).join("/");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [dialogCatOpen, setDialogCatOpen] = useState(false);
  const [isCatSubmitted, setIsCatSubmitted] = useState(false);
  const [isCatLoading, setIsCatLoading] = useState(false);
  const [errorCategory, setErrorCategory] = useState<FormCategoryError | null>(
    null,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleFormCatChange(
    key: keyof typeof formCat,
    value: string | boolean,
  ) {
    const updatedForm = { ...formCat, [key]: value };
    setIsCatSubmitted(true);
    if (isCatSubmitted) {
      const result = formCategorySchema.safeParse(updatedForm);
      if (!result.success) {
        console.log("error form category");
        const errors = result.error.format() as FormCategoryError;
        setErrorCategory(errors);
        console.log(errors);
      } else {
        setErrorCategory(null);
      }
    }
    setFormCat(updatedForm);
  }

  function onCategorySubmit() {
    console.log("oncatsubmit");
    setIsCatSubmitted(true);
    const result = formCategorySchema.safeParse(formCat);
    if (!result.success) {
      console.log("parse failed");
      const errors = result.error.format() as FormCategoryError;
      setErrorCategory(errors);
      console.log(formCat);
      console.log(errors);
      return;
    }
    console.log("parse success");
    setIsCatLoading(true);
    const data = {
      data: [formCat],
    };
    axios
      .post<Response<null, string>>(
        "/yard-management-system/api/yard-activity-categories",
        data,
      )
      .then((r) => {
        triggerSnackbar({ message: r.data.message, emoji: "sparkles" });
        setTimeout(() => {
          // refresh category options here

          setDialogCatOpen(false);
        }, 4000);
      })
      .catch((err: AxiosError<{ message: string }>) =>
        triggerSnackbar({
          message: err.response!.data.message,
          emoji: "police-car-light",
        }),
      )
      .finally(() => setIsCatLoading(false));
  }

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
          `/yard-management-system/api/yard-activities/${atob(id)}`,
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
          "/yard-management-system/api/yard-activities",
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
                <Stack
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
                    label="Activity Code"
                    name="yardActivity"
                    type="text"
                    defaultValue={form.yardActivity}
                    onBlur={(ev) =>
                      handleFormChange("yardActivity", ev.target.value)
                    }
                    error={
                      errors?.yardActivity &&
                      errors.yardActivity._errors?.length > 0
                    }
                    helperText={errors?.yardActivity?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Activity Description"
                    name="yardActivityDesc"
                    type="text"
                    defaultValue={form.yardActivityDesc}
                    onBlur={(ev) =>
                      handleFormChange("yardActivityDesc", ev.target.value)
                    }
                    error={
                      errors?.yardActivityDesc &&
                      errors.yardActivityDesc._errors?.length > 0
                    }
                    helperText={errors?.yardActivityDesc?._errors?.join(", ")}
                  />
                  <TextField
                    fullWidth
                    label="Kafka"
                    name="pubToKafkaTopic"
                    hidden={true}
                    type="text"
                    defaultValue={form.pubToKafkaTopic}
                    onBlur={(ev) =>
                      handleFormChange("pubToKafkaTopic", ev.target.value)
                    }
                    error={
                      errors?.pubToKafkaTopic &&
                      errors.pubToKafkaTopic._errors?.length > 0
                    }
                    helperText={errors?.pubToKafkaTopic?._errors?.join(", ")}
                  />
                  <Select
                    fullWidth
                    label="Activity Category"
                    error={
                      errors?.yardActivityCategoryId &&
                      errors.yardActivityCategoryId._errors?.length > 0
                    }
                    helperText={errors?.yardActivityCategoryId?._errors?.join(
                      ", ",
                    )}
                    name="yardActivityCategoryId"
                    value={form.yardActivityCategoryId}
                    onChange={(ev) =>
                      handleFormChange(
                        "yardActivityCategoryId",
                        ev.target.value as string,
                      )
                    }
                  >
                    {yardActivityCategoryIdOptions?.map((item, idx) => (
                      <MenuItem
                        key={idx}
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    size="md"
                    variant="neutral"
                    startIcon={<AddIcon />}
                    sx={{ color: "#00a69a" }}
                    onClick={() => setDialogCatOpen(true)}
                  >
                    Add Category
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
          <Snackbar variant="neutral" />
          <Dialog
            fullWidth
            open={dialogCatOpen}
            title="Add New Activity Category"
            slotProps={{
              submitButton: {
                isLoading: isCatLoading,
                onClick: () => onCategorySubmit(),
              },
              cancelButton: {
                onClick: () => setDialogCatOpen(false),
              },
            }}
          >
            <TextField
              fullWidth
              label="Yard Activity Category"
              name="yardActivityCategory"
              type="text"
              defaultValue={formCat.yardActivityCategory}
              onBlur={(ev) =>
                handleFormCatChange("yardActivityCategory", ev.target.value)
              }
              error={
                errorCategory?.yardActivityCategory &&
                errorCategory.yardActivityCategory._errors?.length > 0
              }
              helperText={errorCategory?.yardActivityCategory?._errors?.join(
                ", ",
              )}
            />
            <RadioGroup
              title="Create Task Document"
              datatype="boolean"
              defaultValue={null}
              onChange={(ev) => {
                handleFormCatChange(
                  "isCreateTaskDoc",
                  Boolean(ev.target.value),
                );
              }}
              error={
                errorCategory?.isCreateTaskDoc &&
                errorCategory.isCreateTaskDoc._errors?.length > 0
              }
              sx={{ mt: 1 }}
            >
              <RadioGroupItem
                label={"Yes"}
                value={true}
              />
              <RadioGroupItem
                label={"No"}
                value={false}
              />
            </RadioGroup>
          </Dialog>
        </Stack>
      </Stack>
    </>
  );
}
