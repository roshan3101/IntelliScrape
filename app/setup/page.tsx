import { SetupUser } from "@/actions/biling/SetupUser";

export default function Page() {
  return <SetupUserWrapper />;
}

async function SetupUserWrapper() {
  return await SetupUser();
}