import { Outlet } from "react-router";
import Header from "@/components/layout/Header";

export default function Layout() {
  return (
    <>
      <Header />

      <main >
        <Outlet />
      </main>
    </>
  );
}
