import { View, Text } from "react-native";
import { t } from "@/i18n";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold text-slate-900 text-center">
        {t("smokeTest.title")}
      </Text>
      <Text className="mt-2 text-base text-slate-500">
        {t("smokeTest.subtitle")}
      </Text>
    </View>
  );
}
