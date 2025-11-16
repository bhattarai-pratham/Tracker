import React from "react";
import { Ionicons } from "@expo/vector-icons";

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

export {
  HomeIcon,
  HomeFilledIcon,
  TripsIcon,
  TripsFilledIcon,
  StartTripIcon,
  EndTripIcon,
};
