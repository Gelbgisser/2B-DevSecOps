import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

/**
 * Default is localhost — that only works on an emulator that maps host loopback.
 * On a physical phone, replace with http://YOUR_PC_LAN_IP:3080 (Day 9 README).
 */
const DEFAULT_BASE = "http://127.0.0.1:3080";

export default function App() {
  const [base, setBase] = useState(DEFAULT_BASE);
  const [out, setOut] = useState("Set the LAN URL, then tap Hello.");

  async function hello() {
    const url = `${base.replace(/\/$/, "")}/api/hello`;
    setOut(`GET ${url}\n…`);
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const text = await res.text();
      setOut(`GET ${url}\nstatus ${res.status}\n${text}`);
    } catch (err) {
      setOut(
        `GET ${url}\nFAILED: ${err.message}\n\n` +
          "On a real phone, localhost is the phone. Use http://192.168.x.x:3080\n" +
          "Windows Firewall / Public Wi-Fi often blocks inbound TCP 3080."
      );
    }
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar style="light" />
      <Text style={styles.h1}>Secure Demo (Expo)</Text>
      <Text style={styles.muted}>
        Native fetch — CORS does not apply. localhost ≠ your PC on a physical device.
      </Text>
      <Text style={styles.label}>API base URL (edge, including port)</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        value={base}
        onChangeText={setBase}
        placeholder="http://192.168.1.42:3080"
      />
      <Pressable style={styles.btn} onPress={hello}>
        <Text style={styles.btnText}>GET /api/hello</Text>
      </Pressable>
      <ScrollView style={styles.pre}>
        <Text style={styles.preText}>{out}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0f172a", padding: 20, gap: 10 },
  h1: { color: "#f8fafc", fontSize: 22, fontWeight: "700" },
  muted: { color: "#94a3b8", marginBottom: 8 },
  label: { color: "#cbd5e1", fontSize: 13 },
  input: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    fontFamily: "monospace",
  },
  btn: {
    backgroundColor: "#0d9488",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  pre: { flex: 1, backgroundColor: "#020617", borderRadius: 8, padding: 12 },
  preText: { color: "#86efac", fontFamily: "monospace", fontSize: 12 },
});
