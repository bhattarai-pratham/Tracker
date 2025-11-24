import { decode as decodeBase64 } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "./supabase";

const RECEIPT_PHOTO_BUCKET = "trips_photos";
const RECEIPT_PHOTO_FOLDER = "receipts";

export type ReceiptCategory =
  | "Fuel"
  | "Car Service"
  | "Car Wash"
  | "Parking"
  | "Supplies"
  | "Food/Meals"
  | "Tools"
  | "Maintenance";

export const receiptCategories: ReceiptCategory[] = [
  "Fuel",
  "Car Service",
  "Car Wash",
  "Parking",
  "Supplies",
  "Food/Meals",
  "Tools",
  "Maintenance",
];

export interface ReceiptRecord {
  id: string;
  receipt_date: string;
  created_at: string | null;
  category: ReceiptCategory;
  vendor: string;
  description: string | null;
  subtotal: number;
  gst: number;
  total_amount: number;
  receipt_image_url: string | null;
}

export interface CreateReceiptInput {
  id: string;
  receiptDate: string | Date;
  category: ReceiptCategory;
  vendor: string;
  description?: string;
  subtotal?: number;
  totalAmount?: number;
  receiptImageUrl?: string;
}

export interface ReceiptQueryOptions {
  search?: string;
  category?: ReceiptCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ReceiptPhotoUploadResult {
  path: string;
  imageUrl: string | null;
  error: any;
}

const roundCents = (value: number): number => Number(value.toFixed(2));

const resolveAmounts = (input: {
  subtotal?: number;
  totalAmount?: number;
}): { subtotal: number; gst: number; total_amount: number } => {
  if (typeof input.totalAmount === "number") {
    const total_amount = roundCents(input.totalAmount);
    const gst = roundCents(total_amount / 11);
    const subtotal = roundCents(total_amount - gst);
    return { subtotal, gst, total_amount };
  }

  if (typeof input.subtotal === "number") {
    const subtotal = roundCents(input.subtotal);
    const gst = roundCents(subtotal * 0.1);
    const total_amount = roundCents(subtotal + gst);
    return { subtotal, gst, total_amount };
  }

  throw new Error(
    "Either subtotal or total amount must be provided for a receipt."
  );
};

const formatDateInput = (value: string | Date): string => {
  if (typeof value === "string") {
    return value;
  }

  return value.toISOString().split("T")[0];
};

export const receiptService = {
  async createReceipt(input: CreateReceiptInput): Promise<{
    data: ReceiptRecord | null;
    error: any;
  }> {
    const { subtotal, gst, total_amount } = resolveAmounts(input);

    const { data, error } = await supabase
      .from("receipts")
      .insert([
        {
          id: input.id,
          receipt_date: formatDateInput(input.receiptDate),
          category: input.category,
          vendor: input.vendor,
          description: input.description ?? null,
          subtotal,
          gst,
          total_amount,
          receipt_image_url: input.receiptImageUrl ?? null,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  async getReceiptById(
    id: string
  ): Promise<{ data: ReceiptRecord | null; error: any }> {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async getAllReceipts(): Promise<{
    data: ReceiptRecord[] | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .order("receipt_date", { ascending: false });
    return { data, error };
  },

  async queryReceipts(
    options: ReceiptQueryOptions = {}
  ): Promise<{ data: ReceiptRecord[] | null; error: any }> {
    const { search, category, startDate, endDate, minAmount, maxAmount } =
      options;

    let query = supabase
      .from("receipts")
      .select("*")
      .order("receipt_date", { ascending: false });

    if (search) {
      const term = `%${search.replace(/%/g, "\\%")}%`;
      query = query.or(
        `vendor.ilike.${term},description.ilike.${term},category.ilike.${term}`
      );
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (startDate) {
      query = query.gte("receipt_date", startDate);
    }

    if (endDate) {
      query = query.lte("receipt_date", endDate);
    }

    if (typeof minAmount === "number") {
      query = query.gte("total_amount", minAmount);
    }

    if (typeof maxAmount === "number") {
      query = query.lte("total_amount", maxAmount);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async uploadReceiptPhoto(params: {
    receiptId: string;
    fileUri: string;
  }): Promise<ReceiptPhotoUploadResult> {
    const { receiptId, fileUri } = params;

    const fileExtensionMatch = fileUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const extension = fileExtensionMatch?.[1]?.toLowerCase() ?? "jpg";
    const path = `${RECEIPT_PHOTO_FOLDER}/${receiptId}_${Date.now()}.${extension}`;
    const contentType = extension === "png" ? "image/png" : "image/jpeg";

    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decodeBase64(base64);
      const { data, error } = await supabase.storage
        .from(RECEIPT_PHOTO_BUCKET)
        .upload(path, arrayBuffer, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });

      const { data: signedData, error: signedError } = await supabase.storage
        .from(RECEIPT_PHOTO_BUCKET)
        .createSignedUrl(path, 60 * 60);

      const publicUrl =
        signedData?.signedUrl ??
        supabase.storage.from(RECEIPT_PHOTO_BUCKET).getPublicUrl(path).data
          ?.publicUrl ??
        null;

      if (!error) {
        await supabase
          .from("receipts")
          .update({ receipt_image_url: publicUrl })
          .eq("id", receiptId);
      }

      return {
        path: data?.path ?? path,
        imageUrl: publicUrl,
        error: error || signedError,
      };
    } catch (uploadError) {
      return {
        path,
        imageUrl: null,
        error: uploadError,
      };
    }
  },
};
