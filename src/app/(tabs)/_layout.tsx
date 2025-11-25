import { Tabs } from "expo-router";
import React from "react";
import {
  HomeFilledIcon,
  HomeIcon,
  RecieptsFilledIcon,
  RecieptsIcon,
  TripsFilledIcon,
  TripsIcon,
} from "../../assets/Icons";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <HomeFilledIcon color={color} size={size} />
            ) : (
              <HomeIcon color={color} size={size} />
            ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <TripsFilledIcon color={color} size={size} />
            ) : (
              <TripsIcon color={color} size={size} />
            ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Reciepts"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <RecieptsFilledIcon color={color} size={size} />
            ) : (
              <RecieptsIcon color={color} size={size} />
            ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
