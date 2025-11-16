import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import {
  HomeFilledIcon,
  HomeIcon,
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
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({});
