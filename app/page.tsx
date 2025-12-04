"use client";

import BadmintonManager from "./BadmintonManager";

// URL 뒤에 ?admin=yoon511 이 붙으면 관리자 모드
function useAdmin() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("admin") === "yoon511";
}

export default function Home() {
  const isAdmin = useAdmin();
  return <BadmintonManager isAdmin={isAdmin} />;
}

