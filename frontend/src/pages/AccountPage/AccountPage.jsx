import { AccountSideMenu } from "@/components/widgets/AccountSideMenu";
import { AccountHeader } from "@/components/widgets/AccountHeader";
import { AccountFooter } from "@/components/widgets/AccountFooter";
import { Note } from "@/components/widgets/Note";

export const AccountPage = () => {
  return (
    <div className="min-h-screen w-full">
      <AccountSideMenu />
      <div className="min-h-screen flex flex-col pt-[50px]">
        <AccountHeader />

        <main className="px-[90px] py-[70px] flex-1">
          <Note />
        </main>

        <AccountFooter />
      </div>
    </div>
  );
};
