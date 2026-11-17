import { useEffect, useState } from "react";

const getConnectionQuality = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = connection?.effectiveType;
  if (type === "slow-2g") return 1;
  if (type === "2g") return 2;
  if (type === "3g") return 3;
  if (type === "4g") return 4;
  if (typeof connection?.downlink === "number") {
    if (connection.downlink < 0.5) return 1;
    if (connection.downlink < 1.5) return 2;
    if (connection.downlink < 5) return 3;
    return 4;
  }
  return 0;
};

const getConnectionInfo = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    type: connection?.type || "unknown",
    effectiveType: connection?.effectiveType || "unknown",
    downlink: typeof connection?.downlink === "number" ? connection.downlink : null,
    rtt: typeof connection?.rtt === "number" ? connection.rtt : null,
    saveData: Boolean(connection?.saveData),
  };
};

export default function useInternetStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [quality, setQuality] = useState(getConnectionQuality);
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleConnectionChange = () => {
      setQuality(getConnectionQuality());
      setConnectionInfo(getConnectionInfo());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connection?.addEventListener?.("change", handleConnectionChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      connection?.removeEventListener?.("change", handleConnectionChange);
    };
  }, []);

  return { online, quality, connectionInfo, markOnline: () => setOnline(true) };
}
