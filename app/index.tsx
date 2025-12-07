import { Redirect } from "expo-router";
import { getToken } from "./api-calls/helper";
import { useEffect, useState } from "react";
import { useAuth } from "../app/context/useAuth";
import { useUserStore } from "../src/utils/zustandStore";

export default function Index() {
  const [loggedIn, setLoggedin] = useState(false)
  const { locationEnabled, startLocationTracking } = useUserStore();

  useEffect(() => {
    if (locationEnabled) {
      startLocationTracking();
    }
  }, [locationEnabled]);




  return <Redirect href={"/auth"} />;
}
