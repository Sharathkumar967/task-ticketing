import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AdminHomeScreen from "../home/adminHomeScreen";
import UserHomeScreen from "../home/userHomeScreen";

const HomeScreen = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (role === "ADMIN") {
    return <AdminHomeScreen />;
  } else {
    return <UserHomeScreen />;
  }
};

export default HomeScreen;
