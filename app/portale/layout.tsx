import { Rail } from "@/components/gestionale/Rail";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Rail />
      <div className="pb-28 lg:pb-16">{children}</div>
    </>
  );
}
