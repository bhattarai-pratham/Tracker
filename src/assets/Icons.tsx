import { Ionicons } from "@expo/vector-icons";
import React from "react";

const HomeIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="home-outline" size={size} color={color} />;
};

const TripsIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="file-tray-full-outline" size={size} color={color} />;
};

const TripsFilledIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="file-tray-full" size={size} color={color} />;
};

const HomeFilledIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="home" size={size} color={color} />;
};

const StartTripIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="add" size={size} color={color} />;
};

const EndTripIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="close-outline" size={size} color={color} />;
};

const ScanReceiptIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="barcode-outline" size={size} color={color} />;
};

const RecieptsIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="receipt-outline" size={size} color={color} />;
};

const RecieptsFilledIcon = ({
  size = 24,
  color = "black",
}: {
  size?: number;
  color?: string;
}) => {
  return <Ionicons name="receipt" size={size} color={color} />;
};

export {
  EndTripIcon,
  HomeFilledIcon,
  HomeIcon,
  RecieptsFilledIcon,
  RecieptsIcon,
  ScanReceiptIcon,
  StartTripIcon,
  TripsFilledIcon,
  TripsIcon,
};
