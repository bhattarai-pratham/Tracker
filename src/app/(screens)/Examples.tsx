import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import COLORS from "../../assets/colors";
import AppButton from "../../components/AppButton";
import { supabase } from "../../functions/supabase";

export default function ExampleButtons() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Buttons — Variants & Sizes</Text>

      <View style={styles.row}>
        <AppButton
          onPress={() => Alert.alert("Primary pressed")}
          variant="primary"
          size="md"
        >
          Primary
        </AppButton>
      </View>

      <View style={styles.row}>
        <AppButton
          onPress={() => Alert.alert("Outline pressed")}
          variant="outline"
          size="md"
        >
          Outline
        </AppButton>
      </View>

      <View style={styles.row}>
        <AppButton
          onPress={() => Alert.alert("Ghost pressed")}
          variant="ghost"
          size="md"
        >
          Ghost
        </AppButton>
      </View>

      <View style={styles.row}>
        <AppButton
          onPress={() => Alert.alert("Danger pressed")}
          variant="danger"
          size="md"
        >
          Danger
        </AppButton>
      </View>

      <View style={styles.row}>
        <AppButton
          onPress={() => Alert.alert("Success pressed")}
          variant="success"
          size="md"
        >
          Success
        </AppButton>
      </View>

      <Text style={styles.subheader}>Sizes</Text>

      <View style={styles.row}>
        <AppButton onPress={() => {}} variant="primary" size="sm">
          Small
        </AppButton>
        <View style={{ width: 12 }} />
        <AppButton onPress={() => {}} variant="primary" size="md">
          Medium
        </AppButton>
        <View style={{ width: 12 }} />
        <AppButton onPress={() => {}} variant="primary" size="lg">
          Large
        </AppButton>
      </View>

      <Text style={styles.subheader}>Disabled</Text>

      <View style={styles.row}>
        <AppButton onPress={() => {}} variant="primary" disabled>
          Disabled
        </AppButton>
        <View style={{ width: 12 }} />
        <AppButton onPress={() => {}} variant="outline" disabled>
          Disabled
        </AppButton>
      </View>

      <Text style={styles.subheader}>With icon</Text>

      <View style={styles.row}>
        <AppButton
          onPress={() => Alert.alert("Add pressed")}
          variant="primary"
          size="md"
        >
          <>
            <Ionicons
              name="add"
              size={16}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            Add Trip
          </>
        </AppButton>
      </View>

      <View style={{ height: 40 }} />

      <View style={styles.jsoncontainer}>
        <Text>
          {JSON.stringify(
            {
              connected: !!supabase,
            },
            null,
            2
          )}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  subheader: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 18,
    marginBottom: 8,
  },
  row: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  jsoncontainer: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
  },
});
