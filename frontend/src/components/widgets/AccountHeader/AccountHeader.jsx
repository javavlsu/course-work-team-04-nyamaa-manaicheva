import { Link } from "react-router-dom";

export const AccountHeader = () => {
  return (
    <header className="mx-[50px] flex justify-between items-center pb-[30px] border-b border-light-gray">
      <p className="logo">
        <Link to="/account">NotesBook</Link>
      </p>
      <div className="border-3 border-orange rounded-[20px]">
        <span className="logo text-[24px] text-orange px-[30px] py-[10px]">2.0.0</span>
      </div>
    </header>
  );
};
