import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { t } from "@/i18n";
import { getSupabase } from "@/lib/supabase";

type PingState = "pending" | "ok" | "fail";

export default function Index() {
  const [pingState, setPingState] = useState<PingState>("pending");
  const [rowCount, setRowCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from("meal_types")
      .select("*", { count: "exact", head: true })
      .then(({ error, count }) => {
        if (error) {
          setPingState("fail");
        } else {
          setPingState("ok");
          setRowCount(count ?? 0);
        }
      });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold text-slate-900 text-center">
        {t("smokeTest.title")}
      </Text>
      <Text className="mt-2 text-base text-slate-500">
        {t("smokeTest.subtitle")}
      </Text>
      <Text className="mt-6 text-sm text-slate-700">
        Supabase: {pingState}
        {rowCount !== null ? ` (${rowCount} meal types)` : ""}
      </Text>
    </View>
  );
}
