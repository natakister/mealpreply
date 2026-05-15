import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { initI18n } from "@/i18n";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
