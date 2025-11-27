import { Image, View, StyleSheet } from "react-native";

export const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View style={styles.focusedContainer}>
        <View style={styles.focusedInner}>
          <Image source={icon} tintColor="#FFEBEB" style={styles.icon} />
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.unfocusedContainer}>
        <Image source={icon} tintColor="#B57474" style={styles.icon} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  focusedContainer: {
    flex: 1,
    flexDirection: "row",
    minWidth: 110,
    width: "100%",
    minHeight: 64, // h-16
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    overflow: "hidden",
  },
  focusedInner: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6B4545",
    borderRadius: 9999,
    paddingHorizontal: 20, // px-5
    paddingVertical: 12, // py-3
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  unfocusedContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 56, // w-14
    height: 56, // h-14
    marginTop: 16,
    borderRadius: 9999,
  },
  icon: {
    width: 24,
    height: 24, // size-6
  },
});
