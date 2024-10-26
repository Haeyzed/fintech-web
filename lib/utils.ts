import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {Locale} from "@/i18n.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}