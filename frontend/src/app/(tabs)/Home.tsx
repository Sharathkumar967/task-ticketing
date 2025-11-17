import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AdminHomeScreen from "../home/adminHomeScreen";
import UserHomeScreen from "../home/userHomeScreen";
import { useLocalSearchParams } from "expo-router";

const HomeScreen = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const params = useLocalSearchParams<{ refresh?: string }>();

  if (role === "ADMIN") {
    return <AdminHomeScreen refresh={params.refresh} />;
  } else {
    return <UserHomeScreen />;
  }
};

export default HomeScreen;
